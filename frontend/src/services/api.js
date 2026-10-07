import axios from 'axios';
import { getDeviceId } from '../utils/deviceId';

const api = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Todas las peticiones mandan la identidad del dispositivo (ARQUITECTURA.md §4).
// El backend la lee con identifyDevice desde el encabezado x-device-id.
api.interceptors.request.use(async (config) => {
  const deviceId = await getDeviceId();

  config.headers['x-device-id'] = deviceId;

  return config;
});

export default api;
