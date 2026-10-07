import { StyleSheet, Text, View } from 'react-native';

// Pantalla de relleno para los bloques que aún no están (Traducir, Historial).
export default function Proximamente({ titulo, descripcion }) {
  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>🚧</Text>
      <Text style={styles.titulo}>{titulo}</Text>
      <Text style={styles.descripcion}>{descripcion}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emoji: {
    fontSize: 44,
    marginBottom: 16,
  },
  titulo: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 8,
  },
  descripcion: {
    fontSize: 15,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 21,
  },
});
