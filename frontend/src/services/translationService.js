import api from './api';

// POST /translate (ARQUITECTURA.md §8): manda un fragmento de audio de la
// conversación abierta y devuelve su par original / traducción. El backend
// guarda el segmento; aquí solo interesan los dos textos.
export async function translateSegment(conversationId, uri) {
  const formData = new FormData();

  formData.append('conversationId', conversationId);
  formData.append('format', 'm4a');
  formData.append('audio', {
    uri,
    name: 'fragmento.m4a',
    type: 'audio/m4a',
  });

  // services/api.js pone application/json por defecto: sin sobrescribirlo,
  // axios convertiría el FormData a JSON. Con el multipart, React Native
  // añade el boundary del archivo por su cuenta.
  const { data } = await api.post('/translate', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 20000,
  });

  return {
    originalText: data?.originalText || '',
    translatedText: data?.translatedText || '',
  };
}
