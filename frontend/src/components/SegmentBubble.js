import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ElevatedCard } from './ui/Card';
import { useTheme, typo as typoScale } from '../utils/theme';

// Una frase de la conversación: texto original arriba y su traducción abajo.
// onPlay(segment) vuelve a decir la traducción en voz alta.
// La usan TraducirScreen (en vivo) y ConversacionScreen (historial);
// el tema (colores/tipografía) se aplica solo según el modo claro/oscuro.
export default function SegmentBubble({ segment, onPlay, style }) {
  const { colors } = useTheme();

  return (
    <ElevatedCard style={style}>
      <Text style={[typoScale.body, { color: colors.secondaryLabel }]}>
        {segment.originalText}
      </Text>
      <View style={styles.translationRow}>
        <Text
          style={[typoScale.headline, styles.translated, { color: colors.label }]}
          numberOfLines={0}
        >
          {segment.translatedText}
        </Text>
        <Pressable
          style={({ pressed }) => [
            styles.playButton,
            { backgroundColor: colors.tint },
            pressed && { opacity: 0.7 },
          ]}
          onPress={() => onPlay && onPlay(segment)}
          accessibilityLabel="Reproducir traducción"
          android_ripple={{ color: '#FFFFFF66' }}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text style={styles.playText}>▶</Text>
        </Pressable>
      </View>
    </ElevatedCard>
  );
}

const styles = StyleSheet.create({
  translationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  translated: {
    flex: 1,
  },
  playButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
  playText: {
    color: '#FFFFFF',
    fontSize: 14,
  },
});
