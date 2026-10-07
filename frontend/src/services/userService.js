import api from './api';

// POST /users — registra al usuario por deviceId.
// Si el deviceId ya existe, el backend devuelve ese mismo usuario (idempotente).
export async function createOrGetUser(name, deviceId) {
  const { data } = await api.post('/users', { name, deviceId });

  return data.user;
}

// GET /me — perfil del dispositivo actual (requiere x-device-id).
export async function getMe() {
  const { data } = await api.get('/me');

  return data.user;
}
