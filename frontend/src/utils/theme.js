import { useColorScheme, StyleSheet } from 'react-native';

// ============================================================
// PALETA SEMÁNTICA (iOS / Apple HIG)
// ============================================================
export const light = {
  // Texto
  label: '#000000',
  secondaryLabel: '#3C3C4399',     // 60%
  tertiaryLabel: '#3C3C434D',      // 30%
  quaternaryLabel: '#3C3C432E',    // 18%

  // Fondos
  systemBackground: '#FFFFFF',
  secondarySystemBackground: '#F2F2F7',
  tertiarySystemBackground: '#FFFFFF',

  // Separadores
  separator: '#3C3C432E',
  opaqueSeparator: '#C6C6C8',

  // Tinta de marca (tint)
  tint: '#007AFF',
  tintPressed: '#0056CC',

  // Semánticos
  systemRed: '#FF3B30',
  systemRedPressed: '#CC2E26',
  systemGreen: '#34C759',
  systemOrange: '#FF9500',
  systemBlue: '#007AFF',
  systemPurple: '#AF52DE',
  systemPink: '#FF2D92',
  systemYellow: '#FFCC00',
  systemGray: '#8E8E93',
  systemGray2: '#AEAEB2',
  systemGray3: '#C7C7CC',
  systemGray4: '#D1D1D6',
  systemGray5: '#E5E5EA',
  systemGray6: '#F2F2F7',

  // Overlay
  overlay: 'rgba(0,0,0,0.4)',
};

export const dark = {
  label: '#FFFFFF',
  secondaryLabel: '#EBEBF599',
  tertiaryLabel: '#EBEBF54D',
  quaternaryLabel: '#EBEBF52E',

  systemBackground: '#000000',
  secondarySystemBackground: '#1C1C1E',
  tertiarySystemBackground: '#2C2C2E',

  separator: '#54545880',
  opaqueSeparator: '#38383A',

  tint: '#0A84FF',
  tintPressed: '#0060DF',

  systemRed: '#FF453A',
  systemRedPressed: '#D73A2E',
  systemGreen: '#32D74B',
  systemOrange: '#FF9F0A',
  systemBlue: '#0A84FF',
  systemPurple: '#BF5AF2',
  systemPink: '#FF379F',
  systemYellow: '#FFD60A',
  systemGray: '#8E8E93',
  systemGray2: '#636366',
  systemGray3: '#48484A',
  systemGray4: '#3A3A3C',
  systemGray5: '#2C2C2E',
  systemGray6: '#1C1C1E',

  overlay: 'rgba(0,0,0,0.6)',
};

// ============================================================
// TIPOGRAFÍA (escala Apple SF Pro → mapeada a sistema nativo)
// ============================================================
export const typo = {
  largeTitle: { fontSize: 34, fontWeight: '700', lineHeight: 41, letterSpacing: 0.37 },
  title1: { fontSize: 28, fontWeight: '700', lineHeight: 34, letterSpacing: 0.36 },
  title2: { fontSize: 22, fontWeight: '700', lineHeight: 28, letterSpacing: 0.35 },
  title3: { fontSize: 20, fontWeight: '600', lineHeight: 25, letterSpacing: 0.38 },
  headline: { fontSize: 17, fontWeight: '600', lineHeight: 22, letterSpacing: -0.43 },
  body: { fontSize: 17, fontWeight: '400', lineHeight: 22, letterSpacing: -0.43 },
  callout: { fontSize: 16, fontWeight: '400', lineHeight: 21, letterSpacing: -0.32 },
  subheadline: { fontSize: 15, fontWeight: '400', lineHeight: 20, letterSpacing: -0.24 },
  footnote: { fontSize: 13, fontWeight: '400', lineHeight: 18, letterSpacing: -0.08 },
  caption1: { fontSize: 12, fontWeight: '400', lineHeight: 16, letterSpacing: 0 },
  caption2: { fontSize: 11, fontWeight: '400', lineHeight: 13, letterSpacing: 0.06 },
};

// ============================================================
// ESPACIADO (múltiplos de 4)
// ============================================================
export const space = {
  0: 0,
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  7: 28,
  8: 32,
  9: 36,
  10: 40,
  12: 48,
  14: 56,
  16: 64,
};

// ============================================================
// RADIOS
// ============================================================
export const radius = {
  xs: 6,
  sm: 8,
  md: 10,
  lg: 12,
  xl: 16,
  xxl: 22,
  pill: 999,
};

// ============================================================
// SOMBRAS (3 niveles, iOS + Android)
// ============================================================
const makeShadow = (ios, elevation) => ({
  ...ios,
  elevation,
  shadowColor: ios.shadowColor || '#000',
});

export const shadows = {
  none: {},
  level1: makeShadow({ shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2 }, 1),
  level2: makeShadow({ shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 8 }, 3),
  level3: makeShadow({ shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.1, shadowRadius: 16 }, 6),
  level4: makeShadow({ shadowOffset: { width: 0, height: 16 }, shadowOpacity: 0.12, shadowRadius: 24 }, 9),
};

// ============================================================
// HOOK PRINCIPAL
// ============================================================
export function useTheme() {
  const scheme = useColorScheme() ?? 'light';
  const palette = scheme === 'dark' ? dark : light;
  return { scheme, colors: palette, typo, space, radius, shadows };
}

// Helper para estilos que dependen del tema
export function makeThemedStyles(styleFn) {
  const { colors, typo, space, radius, shadows } = useTheme();
  return styleFn({ colors, typo, space, radius, shadows });
}

// ============================================================
// ESTILOS GLOBALES COMUNES (no dependen del hook)
// ============================================================
export const globalStyles = StyleSheet.create({
  // Contenedores
  safeArea: { flex: 1 },
  screen: { flex: 1 },
  scrollContent: { flexGrow: 1 },

  // Pantalla con fondo del sistema
  screenBackground: {
    flex: 1,
    // backgroundColor se asigna en cada pantalla via theme.colors.systemBackground
  },

  // Botón principal (tint)
  primaryButton: {
    borderRadius: radius.pill,
    paddingVertical: space[3],
    paddingHorizontal: space[6],
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
  primaryButtonText: {
    ...typo.callout,
    fontWeight: '600',
    // color: theme.colors.systemBackground (blanco/negro según modo)
  },

  // Botón secundario (outline)
  secondaryButton: {
    borderRadius: radius.pill,
    paddingVertical: space[3],
    paddingHorizontal: space[6],
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
    borderWidth: 1,
  },
  secondaryButtonText: {
    ...typo.callout,
    fontWeight: '600',
    // color: theme.colors.tint
  },

  // Botón destructivo
  destructiveButton: {
    borderRadius: radius.pill,
    paddingVertical: space[3],
    paddingHorizontal: space[6],
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
  destructiveButtonText: {
    ...typo.callout,
    fontWeight: '600',
    // color: theme.colors.systemBackground
  },

  // Tarjeta estándar
  card: {
    borderRadius: radius.xl,
    padding: space[4],
  },

  // Separador horizontal
  hairline: {
    height: StyleSheet.hairlineWidth,
    // backgroundColor: theme.colors.separator
  },

  // Row alineado centro
  rowCenter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  // Centrado absoluto
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Texto truncado
  truncate: {
    flex: 1,
    flexWrap: 'noWrap',
  },

  // Área táctil mínima 44x44
  hitArea44: {
    minHeight: 44,
    minWidth: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

// ============================================================
// UTILIDADES DE ESTILO (para usar dentro de makeThemedStyles)
// ============================================================
export const css = {
  // Texto con color semántico
  label: (colors) => ({ color: colors.label }),
  secondaryLabel: (colors) => ({ color: colors.secondaryLabel }),
  tertiaryLabel: (colors) => ({ color: colors.tertiaryLabel }),
  tint: (colors) => ({ color: colors.tint }),
  destructive: (colors) => ({ color: colors.systemRed }),

  // Fondos
  bgPrimary: (colors) => ({ backgroundColor: colors.systemBackground }),
  bgSecondary: (colors) => ({ backgroundColor: colors.secondarySystemBackground }),
  bgTertiary: (colors) => ({ backgroundColor: colors.tertiarySystemBackground }),
  bgTint: (colors) => ({ backgroundColor: colors.tint }),
  bgDestructive: (colors) => ({ backgroundColor: colors.systemRed }),

  // Sombras
  shadow1: (shadows) => shadows.level1,
  shadow2: (shadows) => shadows.level2,
  shadow3: (shadows) => shadows.level3,
  shadow4: (shadows) => shadows.level4,

  // Radio
  r: (radius, size) => ({ borderRadius: radius[size] }),

  // Espaciado
  p: (space, size) => ({ padding: space[size] }),
  px: (space, size) => ({ paddingHorizontal: space[size] }),
  py: (space, size) => ({ paddingVertical: space[size] }),
  m: (space, size) => ({ margin: space[size] }),
  mx: (space, size) => ({ marginHorizontal: space[size] }),
  my: (space, size) => ({ marginVertical: space[size] }),
  gap: (space, size) => ({ gap: space[size] }),

  // Flex
  flex1: { flex: 1 },
  flexRow: { flexDirection: 'row' },
  alignCenter: { alignItems: 'center' },
  justifyCenter: { justifyContent: 'center' },
  justifyBetween: { justifyContent: 'space-between' },
};

export default { light, dark, typo, space, radius, shadows, globalStyles, css };