import AsyncStorage from '@react-native-async-storage/async-storage';

const VELOCIDAD_KEY = 'tradufly.velocidadVoz';

export const VELOCIDAD_VOCES = [
  { valor: 0.8, etiqueta: 'Lenta' },
  { valor: 1, etiqueta: 'Normal' },
  { valor: 1.2, etiqueta: 'Rápida' },
];

export const VELOCIDAD_NORMAL = 1;

// La usa AjustesScreen para guardar y TraducirScreen (expo-speech) para leer.
export async function getVelocidadVoz() {
  try {
    const guardada = await AsyncStorage.getItem(VELOCIDAD_KEY);
    const valor = Number(guardada);

    return VELOCIDAD_VOCES.some((v) => v.valor === valor) ? valor : VELOCIDAD_NORMAL;
  } catch (error) {
    console.warn('No se pudo leer la velocidad de voz:', error?.message);
    return VELOCIDAD_NORMAL;
  }
}

export async function setVelocidadVoz(valor) {
  await AsyncStorage.setItem(VELOCIDAD_KEY, String(valor));
}
