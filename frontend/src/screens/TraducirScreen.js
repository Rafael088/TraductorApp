import { useRef } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as Speech from 'expo-speech';

import LanguageChip from '../components/LanguageChip';
import MicButton from '../components/MicButton';
import SegmentBubble from '../components/SegmentBubble';
import { useUser } from '../context/UserContext';
import useTraduccionEnVivo from '../hooks/useTraduccionEnVivo';
import { getVelocidadVoz } from '../utils/preferences';

const SPEECH_LANGUAGE = 'es-ES';

// Texto y color del punto según la máquina de estados del hook.
const ESTADOS = {
  idle: { texto: 'Pulsa Escuchar y habla en inglés.', color: '#94a3b8' },
  listening: { texto: 'Escuchando…', color: '#2563eb' },
  sending: { texto: 'Traduciendo…', color: '#f59e0b' },
  speaking: { texto: 'Hablando en español…', color: '#16a34a' },
};

// Pantalla principal (ARQUITECTURA.md §5): saludo, chip EN → ES, frases en
// vivo y el botón Escuchar / Detener del ciclo.
export default function TraducirScreen() {
  const { user } = useUser();
  const { estado, segmentos, error, iniciando, iniciar, detener } =
    useTraduccionEnVivo();

  const listaRef = useRef(null);
  const activa = estado !== 'idle';
  const estadoActual = ESTADOS[estado] || ESTADOS.idle;

  // Solo fuera de la sesión: con el micrófono abierto, la voz en español se
  // mandaría a traducir como si fuera inglés (ARQUITECTURA.md §3).
  async function handlePlay(segment) {
    if (activa) return;

    Speech.stop();
    Speech.speak(segment.translatedText, {
      language: SPEECH_LANGUAGE,
      rate: await getVelocidadVoz(),
    });
  }

  const cabecera = (
    <View>
      <View style={styles.saludoFila}>
        <Text style={styles.hola}>Hola, {user?.name || '...'} 👋</Text>
        <LanguageChip />
      </View>

      <View style={styles.estadoFila}>
        <View style={[styles.punto, { backgroundColor: estadoActual.color }]} />
        <Text style={styles.estado}>{estadoActual.texto}</Text>
      </View>
    </View>
  );

  const vacio = (
    <Text style={styles.vacio}>
      Todavía no hay frases. Al escuchar, aparecerán aquí con su traducción.
    </Text>
  );

  return (
    <View style={styles.container}>
      <FlatList
        ref={listaRef}
        data={segmentos}
        keyExtractor={(item, index) => item._id || `fragmento-${index}`}
        renderItem={({ item }) => <SegmentBubble segment={item} onPlay={handlePlay} />}
        ListHeaderComponent={cabecera}
        ListEmptyComponent={vacio}
        contentContainerStyle={styles.lista}
        onContentSizeChange={() => listaRef.current?.scrollToEnd({ animated: true })}
      />

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <View style={styles.pie}>
        <MicButton
          estado={estado}
          iniciando={iniciando}
          onPress={() => (activa ? detener() : iniciar())}
        />
      </View>

      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 56,
  },
  lista: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  saludoFila: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  hola: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0f172a',
  },
  estadoFila: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  punto: {
    width: 9,
    height: 9,
    borderRadius: 5,
  },
  estado: {
    fontSize: 15,
    color: '#475569',
  },
  vacio: {
    fontSize: 15,
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 40,
    lineHeight: 22,
  },
  error: {
    marginHorizontal: 16,
    marginBottom: 8,
    padding: 12,
    borderRadius: 10,
    backgroundColor: '#fef2f2',
    color: '#b91c1c',
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
  pie: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 24,
  },
});
