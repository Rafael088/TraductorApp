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

// PUT /me — cambia el nombre (requiere x-device-id).
export async function updateMe(name) {
  const { data } = await api.put('/me', { name });

  return data.user;
}
