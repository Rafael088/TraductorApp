import * as Crypto from 'expo-crypto';
import AsyncStorage from '@react-native-async-storage/async-storage';

const DEVICE_ID_KEY = 'tradufly.deviceId';

// Se genera una sola vez y queda guardado en el teléfono.
// Siempre se usa la memoria si ya lo tenemos (evita leer AsyncStorage en cada petición).
let inMemoryDeviceId = null;

export async function getDeviceId() {
  if (inMemoryDeviceId) {
    return inMemoryDeviceId;
  }

  const stored = await AsyncStorage.getItem(DEVICE_ID_KEY);

  if (stored) {
    inMemoryDeviceId = stored;
    return stored;
  }

  const generated = Crypto.randomUUID();

  await AsyncStorage.setItem(DEVICE_ID_KEY, generated);
  inMemoryDeviceId = generated;

  return generated;
}

// Solo para pruebas: olvida el deviceId y fuerza uno nuevo.
export async function resetDeviceId() {
  await AsyncStorage.removeItem(DEVICE_ID_KEY);
  inMemoryDeviceId = null;
}
