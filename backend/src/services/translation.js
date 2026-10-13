// Voz -> texto (STT) y texto -> texto (traducción EN -> ES).
//
//   STT        -> Groq (tier gratuito, Whisper)      GROQ_API_KEY
//   Traducción -> OpenRouter (OpenAI-compatible)     OPENROUTER_API_KEY
//
// Las claves viven solo en el servidor (ARQUITECTURA.md §2): el teléfono manda el
// audio por POST /translate y recibe { originalText, translatedText }.
//
// Variables de entorno (se leen dentro de las funciones y no al cargar el módulo,
// porque app.js llama a dotenv.config() después de importar las rutas):
//   GROQ_API_KEY                 clave de https://console.groq.com/keys (STT)
//   GROQ_STT_MODEL               por defecto whisper-large-v3-turbo
//   OPENROUTER_API_KEY           clave de https://openrouter.ai/keys (traducción)
//   OPENROUTER_TRANSLATION_MODEL por defecto openai/gpt-4o-mini

const GROQ_BASE_URL = "https://api.groq.com/openai/v1";
const OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1";
const REQUEST_TIMEOUT_MS = 30000;

const DEFAULT_STT_MODEL = "whisper-large-v3-turbo";
const DEFAULT_TRANSLATION_MODEL = "openai/gpt-4o-mini";

const AUDIO_MIME_TYPES = {
    wav: "audio/wav",
    mp3: "audio/mpeg",
    flac: "audio/flac",
    m4a: "audio/mp4",
    ogg: "audio/ogg",
    webm: "audio/webm",
    aac: "audio/aac"
};

// Error propio para que el controlador sepa qué contestar:
//   stage: "config" | "stt" | "translate"   (qué paso falló)
//   status: código HTTP sugerido
export class TranslationError extends Error {
    constructor(message, { stage = "config", status = 502, cause } = {}) {
        super(message, { cause });
        this.name = "TranslationError";
        this.stage = stage;
        this.status = status;
    }
}

function requireEnv(name, stage) {
    const value = process.env[name];

    if (!value) {
        throw new TranslationError(`Falta ${name} en backend/.env`, {
            stage,
            status: 500
        });
    }

    return value;
}

// Groq devuelve `error.message`; OpenRouter, lo mismo o `message` suelto.
function describeHttpError(response, data, provider, stage) {
    const detail =
        data?.error?.message || data?.message || `HTTP ${response.status}`;

    if (response.status === 401 || response.status === 403) {
        return new TranslationError(`La clave de ${provider} no es válida: ${detail}`, {
            stage,
            status: 502
        });
    }

    if (response.status === 429) {
        // Tier gratuito de Groq: 20 req/min y 2.000/día. El teléfono puede reintentar.
        return new TranslationError(
            `Límite de peticiones de ${provider} alcanzado, reintenta en unos segundos`,
            { stage, status: 429 }
        );
    }

    if (response.status === 413) {
        return new TranslationError(`El audio supera el tamaño permitido por ${provider}`, {
            stage,
            status: 413
        });
    }

    return new TranslationError(`${provider} respondió ${response.status}: ${detail}`, {
        stage,
        status: 502
    });
}

// POST que valida la respuesta HTTP y traduce los fallos de red/timeout.
async function post(url, init, provider, stage) {
    let response;

    try {
        response = await fetch(url, { ...init, signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS) });
    } catch (error) {
        const timedOut = error.name === "TimeoutError" || error.name === "AbortError";

        throw new TranslationError(
            timedOut
                ? `${provider} no respondió a tiempo`
                : `No se pudo conectar con ${provider}`,
            { stage, status: timedOut ? 504 : 502, cause: error }
        );
    }

    const data = await response.json().catch(() => null);

    if (!response.ok) {
        throw describeHttpError(response, data, provider, stage);
    }

    return data;
}

// El controlador puede mandar el Buffer del archivo o su base64; aquí nos
// quedamos siempre con un Buffer para subirlo como archivo multipart.
function resolveAudioBuffer({ audioBuffer, audioBase64 }) {
    if (Buffer.isBuffer(audioBuffer) && audioBuffer.length > 0) {
        return audioBuffer;
    }

    if (typeof audioBase64 === "string" && audioBase64.length > 0) {
        return Buffer.from(audioBase64, "base64");
    }

    throw new TranslationError("No llegó audio para transcribir", {
        stage: "stt",
        status: 400
    });
}

// Whisper alucina sobre silencio: inventa frases como "Thank you." apoyadas en
// los 30 s de relleno que añade a los audios cortos. La pista es que el
// segmento termina más allá de la duración real del audio. Medido con Groq:
//   silencio (0,3 / 0,8 / 1,5 / 3 / 5 s) -> duration = duración real, end = 29,98
//   voz      (1 / 3 / 11 s)              -> end <= duration
// Descartamos esos segmentos; si no queda ninguno, el fragmento no tenía voz y
// el controlador responde `empty: true` sin guardar nada.
const HALLUCINATION_MARGIN_SECONDS = 1;

function pickSpeech({ text, duration, segments } = {}) {
    if (!Number.isFinite(duration) || !Array.isArray(segments) || segments.length === 0) {
        // Respuesta sin metadatos: nos quedamos con el texto tal cual.
        return typeof text === "string" ? text.trim() : "";
    }

    const realEnd = duration + HALLUCINATION_MARGIN_SECONDS;
    const spokenSegments = segments.filter(
        (segment) => Number.isFinite(segment?.end) && segment.end <= realEnd
    );

    if (spokenSegments.length === 0) {
        return "";
    }

    return spokenSegments
        .map((segment) => segment.text)
        .join("")
        .trim();
}

// speechToText({ audioBuffer | audioBase64, format, language }) -> "Hello world"
//
// Groq (https://console.groq.com/docs/speech-to-text) espera multipart con el
// campo `file`; el tier gratuito admite hasta 25 MB por petición.
// language: ISO-639-1; con "en" Whisper no se confunde con español.
export async function speechToText({
    audioBuffer,
    audioBase64,
    format = "m4a",
    language = "en"
}) {
    const buffer = resolveAudioBuffer({ audioBuffer, audioBase64 });
    const apiKey = requireEnv("GROQ_API_KEY", "stt");
    const model = process.env.GROQ_STT_MODEL || DEFAULT_STT_MODEL;

    const form = new FormData();
    form.append(
        "file",
        new Blob([buffer], { type: AUDIO_MIME_TYPES[format] || "application/octet-stream" }),
        `audio.${format}`
    );
    form.append("model", model);
    // verbose_json además de `text` trae duration y segments: hace falta para
    // descartar las alucinaciones sobre silencio (ver pickSpeech).
    form.append("response_format", "verbose_json");
    form.append("temperature", "0");
    if (language) {
        form.append("language", language);
    }

    const data = await post(
        `${GROQ_BASE_URL}/audio/transcriptions`,
        {
            method: "POST",
            // Sin Content-Type a mano: fetch añade el boundary del multipart.
            headers: { Authorization: `Bearer ${apiKey}` },
            body: form
        },
        "Groq",
        "stt"
    );

    return pickSpeech(data);
}

// Algunos modelos contestan la traducción entre comillas; el teléfono la dicta
// en voz alta, así que las quitamos.
function cleanTranslation(text) {
    const trimmed = text.trim();
    const match = trimmed.match(/^(["'`\u201c\u2018])(.+)(["'`\u201d\u2019])$/su);

    return match ? match[2].trim() : trimmed;
}

// translateText({ text, sourceLanguage, targetLanguage }) -> "Hola mundo"
export async function translateText({
    text,
    sourceLanguage = "en",
    targetLanguage = "es"
}) {
    if (typeof text !== "string" || text.trim().length === 0) {
        throw new TranslationError("No hay texto para traducir", {
            stage: "translate",
            status: 400
        });
    }

    // Mismo idioma de origen y destino: no tiene sentido llamar al modelo.
    if (sourceLanguage === targetLanguage) {
        return text.trim();
    }

    const apiKey = requireEnv("OPENROUTER_API_KEY", "translate");
    const model = process.env.OPENROUTER_TRANSLATION_MODEL || DEFAULT_TRANSLATION_MODEL;

    const data = await post(
        `${OPENROUTER_BASE_URL}/chat/completions`,
        {
            method: "POST",
            headers: {
                Authorization: `Bearer ${apiKey}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model,
                temperature: 0.2,
                messages: [
                    {
                        role: "system",
                        content:
                            "Eres un traductor profesional. Traduce el texto del usuario " +
                            `del idioma "${sourceLanguage}" al idioma "${targetLanguage}". ` +
                            "Responde SOLO con la traducción: sin comillas, sin notas y sin explicaciones. " +
                            "Conserva el tono, la puntuación y los números."
                    },
                    { role: "user", content: text }
                ]
            })
        },
        "OpenRouter",
        "translate"
    );

    const content = data?.choices?.[0]?.message?.content;

    if (typeof content !== "string" || content.trim().length === 0) {
        throw new TranslationError("OpenRouter devolvió una traducción vacía", {
            stage: "translate",
            status: 502
        });
    }

    return cleanTranslation(content);
}

// Flujo completo del ciclo en vivo (ARQUITECTURA.md §3): audio -> EN -> ES.
// Si el fragmento no contiene voz, devuelve ambos textos vacíos y el controlador
// no guarda segmento.
export async function transcribeAndTranslate({
    audioBuffer,
    audioBase64,
    format = "m4a",
    sourceLanguage = "en",
    targetLanguage = "es"
}) {
    const originalText = await speechToText({
        audioBuffer,
        audioBase64,
        format,
        language: sourceLanguage
    });

    if (!originalText) {
        return { originalText: "", translatedText: "" };
    }

    const translatedText = await translateText({
        text: originalText,
        sourceLanguage,
        targetLanguage
    });

    return { originalText, translatedText };
}
