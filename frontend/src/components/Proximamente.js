import { StyleSheet, Text, View } from 'react-native';
import { useTheme, globalStyles, typo } from '../utils/theme';

export default function Proximamente({ titulo, descripcion }) {
  const { colors, space } = useTheme();
  return (
    <View style={[globalStyles.center, { backgroundColor: colors.systemBackground, padding: space[6] }]}>
      <Text style={[typo.largeTitle, { color: colors.tertiaryLabel }]}>🚧</Text>
      <Text style={[typo.title2, { color: colors.label, marginTop: space[3] }]}>{titulo}</Text>
      <Text style={[typo.body, { color: colors.secondaryLabel, marginTop: space[2], textAlign: 'center', lineHeight: 22 }]}>
        {descripcion}
      </Text>
    </View>
  );
}