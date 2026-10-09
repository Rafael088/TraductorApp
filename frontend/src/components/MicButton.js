import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

// Botón grande Escuchar / Detener del ciclo en vivo (ARQUITECTURA.md §5).
// Cualquier estado distinto de idle significa sesión abierta → Detener.
export default function MicButton({ estado, iniciando, onPress }) {
  const activo = estado !== 'idle';

  return (
    <Pressable
      style={({ pressed }) => [
        styles.boton,
        activo && styles.botonActivo,
        pressed && styles.botonPulsado,
      ]}
      onPress={onPress}
      disabled={iniciando && !activo}
      accessibilityRole="button"
      accessibilityLabel={activo ? 'Detener la traducción' : 'Empezar a traducir'}
    >
      {iniciando && !activo ? (
        <ActivityIndicator color="#fff" />
      ) : (
        <View style={styles.contenido}>
          <Text style={styles.icono}>{activo ? '⏹' : '🎤'}</Text>
          <Text style={styles.texto}>{activo ? 'Detener' : 'Escuchar'}</Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  boton: {
    backgroundColor: '#2563eb',
    borderRadius: 30,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 58,
  },
  botonActivo: {
    backgroundColor: '#ef4444',
  },
  botonPulsado: {
    opacity: 0.7,
  },
  contenido: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  icono: {
    fontSize: 20,
    color: '#fff',
  },
  texto: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
});
