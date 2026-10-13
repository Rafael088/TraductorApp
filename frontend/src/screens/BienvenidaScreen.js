import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useUser } from '../context/UserContext';
import { createOrGetUser } from '../services/userService';
import { getDeviceId } from '../utils/deviceId';

import { Card } from '../components/ui/Card';
import { PrimaryButton } from '../components/ui/Button';
import { ErrorState } from '../components/ui/StateViews';
import { ScreenTitle, ScreenSubtitle } from '../components/ui/Typography';
import { useTheme, globalStyles, typo, css } from '../utils/theme';

const MAX_NAME_LENGTH = 30;

export default function BienvenidaScreen() {
  const { colors, space, shadows } = useTheme();
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
    } catch (err) {
      console.error('Error al crear el usuario:', err);
      setError(
        err?.response?.data?.msg || 'No se pudo crear el usuario. Revisa que el servidor esté corriendo.'
      );
      setSaving(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.systemBackground }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Card style={styles.card} elevation={3}>
        <ScreenTitle>TraduFly</ScreenTitle>
        <ScreenSubtitle>Inglés hablado, en español, en vivo.</ScreenSubtitle>

        <View style={styles.inputGroup}>
          <Text style={[typo.headline, { color: colors.label }]}>¿Cómo te llamas?</Text>

          <TextInput
            style={[
              styles.input,
              { backgroundColor: colors.tertiarySystemBackground, borderColor: colors.separator, color: colors.label },
            ]}
            value={name}
            onChangeText={(texto) => {
              setName(texto);
              if (error) setError(null);
            }}
            placeholder="Tu nombre"
            placeholderTextColor={colors.tertiaryLabel}
            autoCapitalize="words"
            autoCorrect={false}
            maxLength={MAX_NAME_LENGTH}
            editable={!saving}
            returnKeyType="go"
            onSubmitEditing={handleEmpezar}
          />

          {error && <ErrorState message={error} style={styles.errorInline} />}
        </View>

        <PrimaryButton onPress={handleEmpezar} disabled={saving} loading={saving} style={styles.primaryButton}>
          Empezar
        </PrimaryButton>

        <Text style={[typo.footnote, { color: colors.tertiaryLabel, textAlign: 'center', marginTop: space[4] }]}>
          Tu teléfono queda identificado por una clave única. No hace falta correo ni contraseña.
        </Text>
      </Card>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    maxWidth: 420,
    padding: 28,
  },
  inputGroup: {
    marginTop: 24,
    width: '100%',
  },
  input: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 17,
    marginTop: 10,
  },
  errorInline: { marginTop: 10 },
  primaryButton: { marginTop: 20, width: '100%' },
});