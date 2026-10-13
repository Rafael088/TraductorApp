import { StyleSheet, Text, View } from 'react-native';
import { useTheme, globalStyles, css, typo } from '../../utils/theme';

/**
 * Encabezado de sección estilo Apple (título + acción opcional)
 */
export function SectionHeader({ title, action, actionLabel, style }) {
  const { colors, space } = useTheme();
  return (
    <View style={[globalStyles.rowBetween, { paddingHorizontal: space[4], paddingVertical: space[2] }, style]}>
      <Text style={[typo.title3, { color: colors.label }]}>{title}</Text>
      {action && actionLabel && (
        <Pressable onPress={action} android_ripple={{ color: colors.tint }}>
          <Text style={[typo.callout, { color: colors.tint }]}>{actionLabel}</Text>
        </Pressable>
      )}
    </View>
  );
}

/**
 * Título de pantalla grande (largeTitle)
 */
export function ScreenTitle({ children, style }) {
  const { colors } = useTheme();
  return <Text style={[typo.largeTitle, { color: colors.label }, style]}>{children}</Text>;
}

/**
 * Subtítulo de pantalla
 */
export function ScreenSubtitle({ children, style }) {
  const { colors } = useTheme();
  return <Text style={[typo.title3, { color: colors.secondaryLabel }, style]}>{children}</Text>;
}