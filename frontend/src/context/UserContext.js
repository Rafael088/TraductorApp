import { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getMe } from '../services/userService';

const USER_KEY = 'tradufly.user';

const UserContext = createContext({
  user: null,
  loading: true,
  signIn: async () => {},
  updateUser: async () => {},
  signOut: async () => {},
});

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Primer arranque: recupera el usuario guardado en el teléfono.
  useEffect(() => {
    let activo = true;

    (async () => {
      try {
        const stored = await AsyncStorage.getItem(USER_KEY);

        if (!activo) return;

        if (stored) {
          setUser(JSON.parse(stored));
          refrescarPerfil();
        }
      } catch (error) {
        console.error('Error al leer el usuario guardado:', error);
      } finally {
        if (activo) setLoading(false);
      }
    })();

    return () => {
      activo = false;
    };
  }, []);

  // Best-effort: si el backend contesta, actualiza el perfil; si no, nos quedamos con lo guardado.
  async function refrescarPerfil() {
    try {
      const perfil = await getMe();

      setUser((actual) => {
        const actualizado = { ...actual, ...perfil };

        AsyncStorage.setItem(USER_KEY, JSON.stringify(actualizado));

        return actualizado;
      });
    } catch (error) {
      console.warn('No se pudo actualizar el perfil:', error?.message);
    }
  }

  async function signIn(nuevoUsuario) {
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(nuevoUsuario));
    setUser(nuevoUsuario);
  }

  // Actualiza el perfil en memoria y en el teléfono (lo usa AjustesScreen).
  async function updateUser(actualizado) {
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(actualizado));
    setUser(actualizado);
  }

  async function signOut() {
    await AsyncStorage.removeItem(USER_KEY);
    setUser(null);
  }

  return (
    <UserContext.Provider value={{ user, loading, signIn, updateUser, signOut }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}
