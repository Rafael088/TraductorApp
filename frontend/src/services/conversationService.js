import api from './api';

// El header x-device-id lo agrega el interceptor de api.js.

// POST /conversations -> { ok, conversation } (abre la sesión al pulsar Escuchar)
export async function createConversation() {
  const { data } = await api.post('/conversations');
  return data.conversation;
}

// PUT /conversations/:id/end -> { ok, conversation } (cierra al pulsar Detener)
export async function endConversation(id) {
  const { data } = await api.put(`/conversations/${id}/end`);
  return data.conversation;
}

// GET /conversations -> { ok, conversations } (la más reciente primero)
export async function getConversations() {
  const { data } = await api.get('/conversations');
  return data.conversations;
}

// GET /conversations/:id -> { ok, conversation, segments } (segmentos en orden cronológico)
export async function getConversation(id) {
  const { data } = await api.get(`/conversations/${id}`);
  return { conversation: data.conversation, segments: data.segments };
}

// DELETE /conversations/:id -> borra la conversación y todos sus segmentos
export async function deleteConversation(id) {
  await api.delete(`/conversations/${id}`);
}
