import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme, globalStyles, typo } from '../../utils/theme';

/**
 * Estado vacío con ilustración, título y descripción
 */
export function EmptyState({ title, description, action, actionLabel, style }) {
  const { colors, space } = useTheme();
  return (
    <View style={[globalStyles.center, { padding: space[6] }, style]}>
      <Text style={[typo.title1, { color: colors.tertiaryLabel }, styles.icon]}>📭</Text>
      <Text style={[typo.headline, { color: colors.label, marginTop: space[3] }]}>{title}</Text>
      {description && (
        <Text style={[typo.body, { color: colors.secondaryLabel, marginTop: space[2], textAlign: 'center' }]}>{description}</Text>
      )}
      {action && actionLabel && (
        <Pressable
          style={[globalStyles.secondaryButton, { marginTop: space[4] }]}
          onPress={action}
          android_ripple={{ color: colors.tint }}
        >
          <Text style={[globalStyles.secondaryButtonText, { color: colors.tint }]}>{actionLabel}</Text>
        </Pressable>
      )}
    </View>
  );
}

/**
 * Estado de carga con spinner
 */
export function LoadingState({ message, style }) {
  const { colors, space } = useTheme();
  return (
    <View style={[globalStyles.center, { padding: space[6] }, style]}>
      <ActivityIndicator size="large" color={colors.tint} />
      {message && <Text style={[typo.body, { color: colors.secondaryLabel, marginTop: space[3] }]}>{message}</Text>}
    </View>
  );
}

/**
 * Estado de error con botón reintentar
 */
export function ErrorState({ message, onRetry, retryLabel = 'Reintentar', style }) {
  const { colors, space } = useTheme();
  return (
    <View style={[globalStyles.center, { padding: space[6] }, style]}>
      <Text style={[typo.title1, { color: colors.tertiaryLabel }, styles.icon]}>⚠️</Text>
      <Text style={[typo.headline, { color: colors.label, marginTop: space[3] }]}>Algo salió mal</Text>
      <Text style={[typo.body, { color: colors.secondaryLabel, marginTop: space[2], textAlign: 'center' }]}>{message}</Text>
      {onRetry && (
        <Pressable
          style={[globalStyles.primaryButton, { marginTop: space[4] }]}
          onPress={onRetry}
          android_ripple={{ color: colors.tintPressed }}
        >
          <Text style={[globalStyles.primaryButtonText, typo.callout]}>{retryLabel}</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  icon: { fontSize: 48 },
});