// ============================================================
// THEME / DESIGN SYSTEM
// ============================================================
// Tout le design de l'app est centralisé ici.
// Tu veux changer une couleur ? Un espacement ? Viens ici.
// ============================================================

export const Colors = {
  // Primary
  primary: '#1D9BF0',
  primaryDark: '#1A8CD8',
  primaryLight: '#E8F5FE',

  // Neutrals
  black: '#0F1419',
  white: '#FFFFFF',

  // Grays
  gray100: '#F7F9FA',
  gray200: '#EFF3F4',
  gray300: '#E7E9EA',
  gray400: '#CFD9DE',
  gray500: '#536471',

  // Semantic
  success: '#00BA7C',
  successLight: '#E5F9F1',
  warning: '#FFAD1F',
  warningLight: '#FFF5E1',
  danger: '#F4212E',
  dangerLight: '#FEE8EA',

  // Priority colors
  priorityHigh: '#F4212E',
  priorityMedium: '#FFAD1F',
  priorityLow: '#00BA7C',
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const Radius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
};

export const Typography = {
  sizes: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    xxxl: 32,
  },
  weights: {
    normal: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
};
