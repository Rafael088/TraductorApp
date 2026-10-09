import { Pressable, StyleSheet, View } from 'react-native';
import { useTheme, globalStyles, css } from '../../utils/theme';

/**
 * Card estándar estilo Apple
 * Uso: <Card style={extraStyles}>contenido</Card>
 */
export function Card({ children, style, ...props }) {
  const { colors, shadows, radius, space } = useTheme();
  const base = [
    globalStyles.card,
    { backgroundColor: colors.secondarySystemBackground, borderRadius: radius.xl },
    shadows.level1,
    style,
  ];
  return <View style={base} {...props}>{children}</View>;
}

/**
 * Card elevada (nivel 2)
 */
export function ElevatedCard({ children, style, ...props }) {
  const { colors, shadows, radius } = useTheme();
  return (
    <View style={[globalStyles.card, { backgroundColor: colors.systemBackground, borderRadius: radius.xl }, shadows.level2, style]} {...props}>
      {children}
    </View>
  );
}

/**
 * Card con borde (sin sombra)
 */
export function OutlinedCard({ children, style, ...props }) {
  const { colors, radius } = useTheme();
  return (
    <View style={[globalStyles.card, { backgroundColor: colors.systemBackground, borderRadius: radius.xl, borderWidth: StyleSheet.hairlineWidth, borderColor: colors.separator }, style]} {...props}>
      {children}
    </View>
  );
}