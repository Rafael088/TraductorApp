import Conversation from "../models/conversations.js";
import { Chat } from "../models/chats.js";
import { TranslationError, transcribeAndTranslate } from "../services/translation.js";

const isValidId = (id) => typeof id === "string" && /^[a-f\d]{24}$/i.test(id);

// Formatos que OpenRouter acepta en input_audio.format.
const AUDIO_FORMATS = new Set(["wav", "mp3", "flac", "m4a", "ogg", "webm", "aac"]);

const MIME_FORMATS = {
    "audio/mpeg": "mp3",
    "audio/mp3": "mp3",
    "audio/mp4": "m4a",
    "audio/m4a": "m4a",
    "audio/x-m4a": "m4a",
    "audio/aac": "aac",
    "audio/wav": "wav",
    "audio/x-wav": "wav",
    "audio/wave": "wav",
    "audio/flac": "flac",
    "audio/x-flac": "flac",
    "audio/ogg": "ogg",
    "audio/webm": "webm"
};

// El teléfono puede mandar el formato explícito; si no, lo deducimos del nombre
// o del Content-Type del archivo. "m4a" es lo que graba expo-audio por defecto.
function resolveAudioFormat(file, requestedFormat) {
    if (requestedFormat && AUDIO_FORMATS.has(requestedFormat)) {
        return requestedFormat;
    }

    const extension = (file.originalname || "").split(".").pop()?.toLowerCase();

    if (extension && AUDIO_FORMATS.has(extension)) {
        return extension;
    }

    const mimeType = (file.mimetype || "").toLowerCase();

    if (MIME_FORMATS[mimeType]) {
        return MIME_FORMATS[mimeType];
    }

    return "m4a";
}

// POST /translate — recibe el fragmento de audio y devuelve la frase traducida.
// El encabezado x-device-id lo resuelve identifyDevice (req.user) y el segmento
// queda guardado para el Historial.
export async function cTranslate(req, res) {
    try {
        if (!req.file || req.file.buffer.length === 0) {
            return res.status(400).json({
                msg: 'Falta el audio (campo "audio" en multipart/form-data)',
                ok: false
            });
        }

        const { conversationId, format: requestedFormat } = req.body ?? {};

        if (!conversationId || !isValidId(conversationId)) {
            return res.status(400).json({
                msg: "conversationId es obligatorio y debe ser un ID válido",
                ok: false
            });
        }

        const conversation = await Conversation.findOne({
            _id: conversationId,
            userId: req.user._id
        });

        if (!conversation) {
            return res.status(404).json({
                msg: "Conversación no encontrada",
                ok: false
            });
        }

        const { originalText, translatedText } = await transcribeAndTranslate({
            audioBuffer: req.file.buffer,
            format: resolveAudioFormat(req.file, requestedFormat),
            sourceLanguage: conversation.sourceLanguage,
            targetLanguage: conversation.targetLanguage
        });

        // Fragmento sin voz (solo silencio): no es un error y no se guarda nada.
        if (!originalText) {
            return res.status(200).json({
                msg: "No se detectó voz en el fragmento",
                ok: true,
                empty: true,
                originalText: "",
                translatedText: ""
            });
        }

        const segment = await Chat.create({
            userId: req.user._id,
            conversationId: conversation._id,
            originalText,
            translatedText,
            sourceLanguage: conversation.sourceLanguage,
            targetLanguage: conversation.targetLanguage
        });

        return res.status(201).json({
            msg: "Fragmento traducido correctamente",
            ok: true,
            originalText,
            translatedText,
            segment
        });
    } catch (error) {
        if (error instanceof TranslationError) {
            // Falta una clave (500), falló Groq u OpenRouter (502/504)
            // o se llegó al límite del tier gratuito (429): el mensaje ya es claro.
            console.error(`Error de traducción [${error.stage}]:`, error.message);

            return res.status(error.status).json({
                msg: error.message,
                ok: false,
                stage: error.stage
            });
        }

        if (error.name === "CastError") {
            return res.status(400).json({
                msg: "ID de conversación no válido",
                ok: false
            });
        }

        console.error("Error al traducir el fragmento:", error);

        return res.status(500).json({
            msg: "Error al traducir el fragmento",
            ok: false
        });
    }
}
