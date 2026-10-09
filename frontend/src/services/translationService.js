import api from './api';

// Extrae la extensión del URI para decirle al backend el formato real del
// archivo (m4a, wav, mp3…). Expo Audio puede usar extensiones distintas
// según la plataforma, así que no forzamos siempre 'm4a'.
function formatFromUri(uri) {
  if (typeof uri !== 'string') return 'm4a';

  const match = uri.match(/\.([a-zA-Z0-9]+)(\?.*)?$/);
  const ext = match ? match[1].toLowerCase() : 'm4a';

  const validos = ['m4a', 'mp4', 'wav', 'mp3', 'flac', 'ogg', 'webm', 'aac'];
  return validos.includes(ext) ? ext : 'm4a';
}

// POST /translate (ARQUITECTURA.md §8): manda un fragmento de audio de la
// conversación abierta y devuelve su par original / traducción. El backend
// guarda el segmento; aquí solo interesan los dos textos.
export async function translateSegment(conversationId, uri) {
  const format = formatFromUri(uri);
  const formData = new FormData();

  formData.append('conversationId', conversationId);
  formData.append('format', format);
  formData.append('audio', {
    uri,
    name: `fragmento.${format}`,
    type: `audio/${format === 'mp3' ? 'mpeg' : format}`,
  });

  // No forzamos 'Content-Type': axios + React Native añaden el boundary
  // del multipart automáticamente. Si lo forzamos a mano, multer puede no
  // encontrar el campo 'audio' y el servidor responde 400.
  const { data } = await api.post('/translate', formData, {
    headers: { 'Content-Type': undefined },
    timeout: 30000,
    transformRequest: (form) => form, // evita que axios serialice el FormData
  });

  return {
    originalText: data?.originalText || '',
    translatedText: data?.translatedText || '',
    empty: data?.empty === true,
  };
}
