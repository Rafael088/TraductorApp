import { StyleSheet, Text, View } from 'react-native';
import { SOURCE_LANG, TARGET_LANG } from '../utils/languages';

// Chip EN → ES. Los idiomas salen de utils/languages: cambiar el par de
// idiomas ahí cambia este chip sin tocar la pantalla (ARQUITECTURA.md §9).
export default function LanguageChip({ source = SOURCE_LANG, target = TARGET_LANG }) {
  return (
    <View style={styles.chip}>
      <Text style={styles.texto}>
        {source.toUpperCase()} → {target.toUpperCase()}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    backgroundColor: '#eff6ff',
    borderColor: '#bfdbfe',
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  texto: {
    color: '#2563eb',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});
