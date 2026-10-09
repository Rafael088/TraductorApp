import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme, globalStyles, css } from '../../utils/theme';

/**
 * Botón principal (relleno con tint)
 */
export function PrimaryButton({ children, onPress, disabled, loading, style, accessibilityLabel, ...props }) {
  const { colors, space, radius, typo } = useTheme();
  const bg = disabled ? colors.systemGray4 : loading ? colors.tintPressed : colors.tint;
  const textColor = colors.systemBackground;

  return (
    <Pressable
      style={[
        globalStyles.primaryButton,
        { backgroundColor: bg, borderRadius: radius.pill },
        style,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      accessibilityLabel={accessibilityLabel}
      android_ripple={{ color: colors.tintPressed }}
      {...props}
    >
      {loading ? (
        <View style={styles.spinner} />
      ) : (
        <Text style={[globalStyles.primaryButtonText, { color: textColor }, typo.callout]}>{children}</Text>
      )}
    </Pressable>
  );
}

/**
 * Botón secundario (outline con tint)
 * Acepta `textColor` opcional para sobrescribir el color del texto (útil cuando el fondo se llena con tint).
 */
export function SecondaryButton({ children, onPress, disabled, style, textColor: customTextColor, ...props }) {
  const { colors, space, radius, typo } = useTheme();
  const borderColor = disabled ? colors.systemGray4 : colors.tint;
  const textColor = disabled ? colors.systemGray3 : customTextColor ?? colors.tint;

  return (
    <Pressable
      style={[
        globalStyles.secondaryButton,
        { backgroundColor: 'transparent', borderColor, borderWidth: 1, borderRadius: radius.pill },
        style,
      ]}
      onPress={onPress}
      disabled={disabled}
      android_ripple={{ color: colors.tint }}
      {...props}
    >
      <Text style={[globalStyles.secondaryButtonText, { color: textColor }, typo.callout]}>{children}</Text>
    </Pressable>
  );
}

/**
 * Botón destructivo (relleno rojo)
 */
export function DestructiveButton({ children, onPress, disabled, loading, style, ...props }) {
  const { colors, space, radius, typo } = useTheme();
  const bg = disabled ? colors.systemGray4 : loading ? colors.systemRedPressed : colors.systemRed;

  return (
    <Pressable
      style={[
        globalStyles.destructiveButton,
        { backgroundColor: bg, borderRadius: radius.pill },
        style,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      android_ripple={{ color: colors.systemRedPressed }}
      {...props}
    >
      {loading ? (
        <View style={styles.spinner} />
      ) : (
        <Text style={[globalStyles.destructiveButtonText, { color: colors.systemBackground }, typo.callout]}>{children}</Text>
      )}
    </Pressable>
  );
}

/**
 * Botón de texto plano (sin fondo, solo tint)
 */
export function TextButton({ children, onPress, disabled, style, ...props }) {
  const { colors, typo } = useTheme();
  return (
    <Pressable
      style={[{ paddingVertical: 8, paddingHorizontal: 4 }, style]}
      onPress={onPress}
      disabled={disabled}
      android_ripple={{ color: colors.tint }}
      {...props}
    >
      <Text style={[typo.callout, { color: disabled ? colors.systemGray3 : colors.tint }]}>{children}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  spinner: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: 'transparent',
    borderTopColor: 'white',
    // Animación se haría con Animated o useNativeDriver
  },
});