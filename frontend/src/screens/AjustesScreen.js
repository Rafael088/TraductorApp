import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,  
  View,
} from 'react-native';
import { useUser } from '../context/UserContext';
import { updateMe } from '../services/userService';
import { SOURCE_LANG, TARGET_LANG, languageLabel } from '../utils/languages';
import { VELOCIDAD_VOCES, getVelocidadVoz, setVelocidadVoz } from '../utils/preferences';

import { Card } from '../components/ui/Card';
import { PrimaryButton, SecondaryButton } from '../components/ui/Button';
import { ErrorState } from '../components/ui/StateViews';
import { SectionHeader, ScreenTitle } from '../components/ui/Typography';
import { useTheme, globalStyles, typo, css } from '../utils/theme';

const MAX_NAME_LENGTH = 30;

export default function AjustesScreen() {
  const { colors, space, shadows } = useTheme();
  const { user, updateUser } = useUser();

  const [name, setName] = useState(user?.name || '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [saved, setSaved] = useState(false);
  const [velocidad, setVelocidad] = useState(null);

  useEffect(() => {
    if (user?.name) setName(user.name);
  }, [user?.name]);

  useEffect(() => {
    getVelocidadVoz().then(setVelocidad);
  }, []);

  async function handleGuardar() {
    const limpio = name.trim();

    if (!limpio) {
      setError('El nombre no puede estar vacío.');
      return;
    }

    setSaving(true);
    setError(null);
    setSaved(false);

    try {
      const actualizado = await updateMe(limpio);
      await updateUser(actualizado);
      setSaved(true);
    } catch (err) {
      console.error('Error al guardar el nombre:', err);
      setError(err?.response?.data?.msg || 'No se pudo guardar. Revisa que el servidor esté corriendo.');
      setName(user?.name || '');
    } finally {
      setSaving(false);
    }
  }

  async function handleVelocidad(valor) {
    setVelocidad(valor);
    try {
      await setVelocidadVoz(valor);
    } catch (err) {
      console.warn('No se pudo guardar la velocidad:', err?.message);
    }
  }

  const sinCambios = name.trim() === (user?.name || '').trim();

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.systemBackground }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={[styles.greeting, { paddingHorizontal: space[4] }]}>
        <ScreenTitle>Hola, {user?.name || '...'} 👋</ScreenTitle>
      </View>

      {/* --- Tu nombre --- */}
      <SectionHeader title="Tu nombre" />
      <Card style={[styles.card, { marginHorizontal: space[4], marginTop: space[2] }]}>
        <TextInput
          style={[
            styles.input,
            { backgroundColor: colors.tertiarySystemBackground, borderColor: colors.separator, color: colors.label },
          ]}
          value={name}
          onChangeText={(texto) => {
            setName(texto);
            setError(null);
            setSaved(false);
          }}
          placeholder="Tu nombre"
          placeholderTextColor={colors.tertiaryLabel}
          autoCapitalize="words"
          autoCorrect={false}
          maxLength={MAX_NAME_LENGTH}
          editable={!saving}
        />

        {error && <ErrorState message={error} style={styles.errorInline} />}
        {saved && !error && (
          <Text style={[typo.footnote, { color: colors.systemGreen, marginTop: space[2] }]}>Nombre guardado ✓</Text>
        )}

        <PrimaryButton
          onPress={handleGuardar}
          disabled={saving || sinCambios}
          loading={saving}
          style={styles.primaryButton}
        >
          Guardar
        </PrimaryButton>
      </Card>

      {/* --- Idiomas --- */}
      <SectionHeader title="Idiomas" />
      <Card style={[styles.card, { marginHorizontal: space[4], marginTop: space[2] }]}>
        <View style={styles.languageRow}>
          <View>
            <Text style={[typo.caption1, { color: colors.tertiaryLabel }]}>Oigo</Text>
            <Text style={[typo.body, { color: colors.label, fontWeight: '600' }]}>{languageLabel(SOURCE_LANG)}</Text>
          </View>
          <Text style={{ fontSize: 20 }}>🔒</Text>
        </View>

        <View style={[styles.hairline, { backgroundColor: colors.separator, marginVertical: space[2] }]} />

        <View style={styles.languageRow}>
          <View>
            <Text style={[typo.caption1, { color: colors.tertiaryLabel }]}>Hablo</Text>
            <Text style={[typo.body, { color: colors.label, fontWeight: '600' }]}>{languageLabel(TARGET_LANG)}</Text>
          </View>
          <Text style={{ fontSize: 20 }}>🔒</Text>
        </View>

        <Text style={[typo.caption1, { color: colors.tertiaryLabel, marginTop: space[3] }]}>Por ahora los idiomas están fijos.</Text>
      </Card>

      {/* --- Voz --- */}
      <SectionHeader title="Velocidad de voz" />
      <Card style={[styles.card, { marginHorizontal: space[4], marginTop: space[2] }]}>
        <View style={styles.speedOptions}>
          {VELOCIDAD_VOCES.map((opcion) => {
            const activa = velocidad === opcion.valor;
            return (
              <SecondaryButton
                key={opcion.valor}
                onPress={() => handleVelocidad(opcion.valor)}
                disabled={activa}
                textColor={activa ? colors.systemBackground : undefined}
                style={[
                  styles.speedOption,
                  { backgroundColor: activa ? colors.tint : 'transparent', borderColor: activa ? colors.tint : colors.separator },
                ]}
              >
                {opcion.etiqueta}
              </SecondaryButton>
            );
          })}
        </View>
        <Text style={[typo.caption1, { color: colors.tertiaryLabel, marginTop: space[3] }]}>Afecta a la voz en español de la traducción.</Text>
      </Card>

      {/* --- Dispositivo --- */}
      <SectionHeader title="Dispositivo" />
      <Card style={[styles.card, { marginHorizontal: space[4], marginTop: space[2], marginBottom: space[6] }]}>
        <Text style={[typo.callout, { color: colors.label, fontWeight: '600', fontVariant: ['tabular-nums'] }]}>
          {user?.deviceId ? String(user.deviceId).slice(0, 8) + '••••' : '—'}
        </Text>
        <Text style={[typo.caption1, { color: colors.tertiaryLabel, marginTop: space[2] }]}>
          TraduFly reconoce este teléfono por esa clave. No hay correo ni contraseña.
        </Text>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingBottom: 40 },
  greeting: { marginTop: 8, marginBottom: 4 },
  card: { padding: 20 },
  input: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 17,
  },
  errorInline: { marginTop: 10 },
  primaryButton: { marginTop: 16, width: '100%' },
  languageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  hairline: { height: StyleSheet.hairlineWidth },
  speedOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  speedOption: { flex: 1, minWidth: 80 },
});