import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useUser } from '../context/UserContext';
import { updateMe } from '../services/userService';
import { SOURCE_LANG, TARGET_LANG, languageLabel } from '../utils/languages';
import { VELOCIDAD_VOCES, getVelocidadVoz, setVelocidadVoz } from '../utils/preferences';

const MAX_NAME_LENGTH = 30;

export default function AjustesScreen() {
  const { user, updateUser } = useUser();

  const [name, setName] = useState(user?.name || '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [saved, setSaved] = useState(false);
  const [velocidad, setVelocidad] = useState(null);

  // Si el perfil se refresca en segundo plano (GET /me), seguimos su valor.
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

      setError(
        err?.response?.data?.msg ||
          'No se pudo guardar. Revisa que el servidor esté corriendo.'
      );
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
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.hola}>Hola, {user?.name || '...'} 👋</Text>

      {/* --- Tu nombre --- */}
      <Text style={styles.seccion}>Tu nombre</Text>
      <View style={styles.card}>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={(texto) => {
            setName(texto);
            setError(null);
            setSaved(false);
          }}
          placeholder="Tu nombre"
          placeholderTextColor="#9ca3af"
          autoCapitalize="words"
          autoCorrect={false}
          maxLength={MAX_NAME_LENGTH}
          editable={!saving}
        />

        {error ? <Text style={styles.error}>{error}</Text> : null}
        {saved && !error ? <Text style={styles.ok}>Nombre guardado ✓</Text> : null}

        <TouchableOpacity
          style={[styles.button, (saving || sinCambios) && styles.buttonDisabled]}
          onPress={handleGuardar}
          disabled={saving || sinCambios}
          activeOpacity={0.8}
        >
          {saving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Guardar</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* --- Idiomas --- */}
      <Text style={styles.seccion}>Idiomas</Text>
      <View style={styles.card}>
        <View style={styles.fila}>
          <View>
            <Text style={styles.filaLabel}>Oigo</Text>
            <Text style={styles.filaValor}>{languageLabel(SOURCE_LANG)}</Text>
          </View>
          <Text style={styles.candado}>🔒</Text>
        </View>

        <View style={styles.separador} />

        <View style={styles.fila}>
          <View>
            <Text style={styles.filaLabel}>Hablo</Text>
            <Text style={styles.filaValor}>{languageLabel(TARGET_LANG)}</Text>
          </View>
          <Text style={styles.candado}>🔒</Text>
        </View>

        <Text style={styles.nota}>Por ahora los idiomas están fijos.</Text>
      </View>

      {/* --- Voz --- */}
      <Text style={styles.seccion}>Velocidad de voz</Text>
      <View style={styles.card}>
        <View style={styles.opciones}>
          {VELOCIDAD_VOCES.map((opcion) => {
            const activa = velocidad === opcion.valor;

            return (
              <TouchableOpacity
                key={opcion.valor}
                style={[styles.opcion, activa && styles.opcionActiva]}
                onPress={() => handleVelocidad(opcion.valor)}
                activeOpacity={0.8}
              >
                <Text style={[styles.opcionTexto, activa && styles.opcionTextoActiva]}>
                  {opcion.etiqueta}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
        <Text style={styles.nota}>Afecta a la voz en español de la traducción.</Text>
      </View>

      {/* --- Dispositivo --- */}
      <Text style={styles.seccion}>Dispositivo</Text>
      <View style={styles.card}>
        <Text style={styles.dispositivo}>
          {user?.deviceId ? String(user.deviceId).slice(0, 8) + '••••' : '—'}
        </Text>
        <Text style={styles.nota}>
          TraduFly reconoce este teléfono por esa clave. No hay correo ni contraseña.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f1f5f9',
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  hola: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 8,
  },
  seccion: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginTop: 20,
    marginBottom: 8,
    marginLeft: 4,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 17,
    color: '#0f172a',
    backgroundColor: '#f8fafc',
  },
  error: {
    color: '#dc2626',
    fontSize: 14,
    marginTop: 10,
  },
  ok: {
    color: '#16a34a',
    fontSize: 14,
    marginTop: 10,
    fontWeight: '600',
  },
  button: {
    backgroundColor: '#2563eb',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 14,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  fila: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  filaLabel: {
    fontSize: 13,
    color: '#64748b',
    marginBottom: 2,
  },
  filaValor: {
    fontSize: 17,
    fontWeight: '600',
    color: '#0f172a',
  },
  candado: {
    fontSize: 18,
    opacity: 0.6,
  },
  separador: {
    height: 1,
    backgroundColor: '#e2e8f0',
    marginVertical: 10,
  },
  opciones: {
    flexDirection: 'row',
    gap: 8,
  },
  opcion: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  opcionActiva: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  opcionTexto: {
    fontSize: 15,
    fontWeight: '600',
    color: '#475569',
  },
  opcionTextoActiva: {
    color: '#fff',
  },
  nota: {
    fontSize: 13,
    color: '#94a3b8',
    marginTop: 12,
    lineHeight: 18,
  },
  dispositivo: {
    fontSize: 15,
    fontWeight: '600',
    color: '#334155',
    fontVariant: ['tabular-nums'],
  },
});
