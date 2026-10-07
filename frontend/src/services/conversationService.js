import api from './api';

// TEMPORAL: deviceId de prueba hasta que fer suba el interceptor x-device-id en api.js.
// Al llegar ese interceptor, borrar esta constante, `tempConfig` y su uso en cada llamada.
const TEMP_DEVICE_ID = 'seed-device-sebas';
const tempConfig = { headers: { 'x-device-id': TEMP_DEVICE_ID } };

// GET /conversations -> { ok, conversations } (la más reciente primero)
export async function getConversations() {
  const { data } = await api.get('/conversations', tempConfig);
  return data.conversations;
}

// GET /conversations/:id -> { ok, conversation, segments } (segmentos en orden cronológico)
export async function getConversation(id) {
  const { data } = await api.get(`/conversations/${id}`, tempConfig);
  return { conversation: data.conversation, segments: data.segments };
}

// DELETE /conversations/:id -> borra la conversación y todos sus segmentos
export async function deleteConversation(id) {
  await api.delete(`/conversations/${id}`, tempConfig);
}
