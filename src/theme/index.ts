// ============================================================
// THEME / DESIGN SYSTEM — Obsidian & Cyan
// ============================================================
// Nouvelle DA : Developer Dark
// ============================================================

export const Colors = {
  // Backgrounds
  bgPrimary: '#0D1117',
  bgSurface: '#161B22',
  bgInput: '#21262D',
  bgHover: '#1C2128',

  // Borders
  border: '#30363D',

  // Text
  textPrimary: '#E6EDF3',
  textSecondary: '#8B949E',
  textTertiary: '#484F58',

  // Accents
  accentCyan: '#22D3EE',
  accentViolet: '#A371F7',
  accentGreen: '#3FB950',
  accentRed: '#F85149',
  accentYellow: '#D29922',

  // Legacy aliases
  primary: '#22D3EE',
  white: '#E6EDF3',
  black: '#0D1117',

  // Priority
  priorityHigh: '#F85149',
  priorityMedium: '#D29922',
  priorityLow: '#3FB950',

  // Semantic
  success: '#3FB950',
  danger: '#F85149',
  warning: '#D29922',

  // Legacy mapping for smooth migration
  gray100: '#0D1117',
  gray200: '#21262D',
  gray300: '#30363D',
  gray400: '#484F58',
  gray500: '#8B949E',
  successLight: '#3FB95018',
  dangerLight: '#F8514918',
  warningLight: '#D2992218',
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
  sm: 6,
  md: 10,
  lg: 14,
  xl: 20,
  xxl: 24,
  full: 9999,
};

export const Typography = {
  sizes: {
    xs: 11,
    sm: 13,
    base: 15,
    lg: 17,
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
