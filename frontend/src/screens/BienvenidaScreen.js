import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useUser } from '../context/UserContext';
import { createOrGetUser } from '../services/userService';
import { getDeviceId } from '../utils/deviceId';

const MAX_NAME_LENGTH = 30;

export default function BienvenidaScreen() {
  const { signIn } = useUser();
  const [name, setName] = useState('');
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  async function handleEmpezar() {
    const limpio = name.trim();

    if (!limpio) {
      setError('Escribe tu nombre para continuar.');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const deviceId = await getDeviceId();
      const user = await createOrGetUser(limpio, deviceId);

      await signIn(user);
      // Ya hay usuario: UserContext cambia y AppNavigator muestra la app.
    } catch (err) {
      console.error('Error al crear el usuario:', err);

      setError(
        err?.response?.data?.msg ||
          'No se pudo crear el usuario. Revisa que el servidor esté corriendo.'
      );
      setSaving(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.card}>
        <Text style={styles.logo}>TraduFly</Text>
        <Text style={styles.subtitle}>Inglés hablado, en español, en vivo.</Text>

        <Text style={styles.label}>¿Cómo te llamas?</Text>

        <TextInput
          style={styles.input}
          value={name}
          onChangeText={(texto) => {
            setName(texto);
            if (error) setError(null);
          }}
          placeholder="Tu nombre"
          placeholderTextColor="#9ca3af"
          autoCapitalize="words"
          autoCorrect={false}
          maxLength={MAX_NAME_LENGTH}
          editable={!saving}
          returnKeyType="go"
          onSubmitEditing={handleEmpezar}
        />

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <TouchableOpacity
          style={[styles.button, saving && styles.buttonDisabled]}
          onPress={handleEmpezar}
          disabled={saving}
          activeOpacity={0.8}
        >
          {saving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Empezar</Text>
          )}
        </TouchableOpacity>

        <Text style={styles.hint}>
          Tu teléfono queda identificado por una clave única. No hace falta correo ni
          contraseña.
        </Text>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 28,
  },
  logo: {
    fontSize: 32,
    fontWeight: '800',
    color: '#2563eb',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    color: '#64748b',
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 28,
  },
  label: {
    fontSize: 17,
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 17,
    color: '#0f172a',
    backgroundColor: '#f8fafc',
  },
  error: {
    color: '#dc2626',
    fontSize: 14,
    marginTop: 10,
  },
  button: {
    backgroundColor: '#2563eb',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
  },
  hint: {
    fontSize: 13,
    color: '#94a3b8',
    textAlign: 'center',
    marginTop: 18,
    lineHeight: 18,
  },
});
