import { Pressable, StyleSheet, Text, View } from 'react-native';

// Una frase de la conversación: texto original arriba y su traducción abajo.
// onPlay(segment) vuelve a decir la traducción en voz alta.
export default function SegmentBubble({ segment, onPlay }) {
  return (
    <View style={styles.container}>
      <Text style={styles.original}>{segment.originalText}</Text>
      <View style={styles.translationRow}>
        <Text style={styles.translated}>{segment.translatedText}</Text>
        <Pressable
          style={({ pressed }) => [styles.playButton, pressed && styles.playPressed]}
          onPress={() => onPlay && onPlay(segment)}
          accessibilityLabel="Reproducir traducción"
        >
          <Text style={styles.playText}>▶</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
  },
  original: {
    fontSize: 15,
    color: '#6b7280',
  },
  translationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  translated: {
    flex: 1,
    fontSize: 17,
    fontWeight: '600',
  },
  playButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#2563eb',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
  playPressed: {
    opacity: 0.6,
  },
  playText: {
    color: '#fff',
    fontSize: 14,
  },
});
