// ============================================================
// THEME / DESIGN SYSTEM — Flowday
// ============================================================
// 3 thèmes : Dark, OLED, Tinted
// 12 couleurs Apple pour les Life Blocks
// ============================================================

export const LifeBlockColors = [
  '#30D158', // vert Apple
  '#FF453A', // rouge Apple
  '#FFD60A', // jaune Apple
  '#BF5AF2', // violet Apple
  '#0A84FF', // bleu Apple
  '#FF9F0A', // orange Apple
  '#FF375F', // rose Apple
  '#5E5CE6', // indigo Apple
  '#32ADE6', // cyan Apple
  '#AC8E68', // marron Apple
  '#6C6C70', // gris Apple
  '#FFFFFF', // blanc
] as const;

export type LifeBlockColor = (typeof LifeBlockColors)[number];

// ---------------------------------------------------------------
// Thème DARK (Obsidian + Cyan — par défaut)
// ---------------------------------------------------------------
export const DarkTheme = {
  name: 'dark' as const,
  // Backgrounds
  bgPrimary: '#0D1117',
  bgSurface: '#161B22',
  bgInput: '#21262D',
  bgHover: '#1C2128',
  bgBlockActive: '#222222',

  // Borders
  border: '#30363D',

  // Text
  textPrimary: '#E6EDF3',
  textSecondary: '#8B949E',
  textTertiary: '#484F58',

  // Accents système
  accentCyan: '#22D3EE',
  accentViolet: '#A371F7',
  accentGreen: '#3FB950',
  accentRed: '#F85149',
  accentYellow: '#D29922',

  // Priority
  priorityHigh: '#F85149',
  priorityMedium: '#D29922',
  priorityLow: '#3FB950',

  // Semantic
  success: '#3FB950',
  danger: '#F85149',
  warning: '#D29922',

  // Now line
  nowLine: '#F85149',
};

// ---------------------------------------------------------------
// Thème OLED (vrai noir pour les écrans OLED)
// ---------------------------------------------------------------
export const OledTheme = {
  name: 'oled' as const,
  bgPrimary: '#000000',
  bgSurface: '#0A0A0A',
  bgInput: '#141414',
  bgHover: '#1A1A1A',
  bgBlockActive: '#1F1F1F',

  border: '#2A2A2A',

  textPrimary: '#FFFFFF',
  textSecondary: '#9A9A9A',
  textTertiary: '#555555',

  accentCyan: '#22D3EE',
  accentViolet: '#A371F7',
  accentGreen: '#3FB950',
  accentRed: '#F85149',
  accentYellow: '#D29922',

  priorityHigh: '#F85149',
  priorityMedium: '#D29922',
  priorityLow: '#3FB950',

  success: '#3FB950',
  danger: '#F85149',
  warning: '#D29922',

  nowLine: '#F85149',
};

// ---------------------------------------------------------------
// Thème TINTED (accent coloré sur fond sombre)
// L'utilisateur choisit une couleur d'accent → tout le UI s'adapte
// ---------------------------------------------------------------
export const TintedTheme = {
  name: 'tinted' as const,
  bgPrimary: '#0D1117',
  bgSurface: '#161B22',
  bgInput: '#21262D',
  bgHover: '#1C2128',
  bgBlockActive: '#222222',

  border: '#30363D',

  textPrimary: '#E6EDF3',
  textSecondary: '#8B949E',
  textTertiary: '#484F58',

  // Seront remplacés dynamiquement par la couleur d'accent choisie
  accentCyan: '#0A84FF',
  accentViolet: '#BF5AF2',
  accentGreen: '#30D158',
  accentRed: '#FF453A',
  accentYellow: '#FF9F0A',

  priorityHigh: '#FF453A',
  priorityMedium: '#FF9F0A',
  priorityLow: '#30D158',

  success: '#30D158',
  danger: '#FF453A',
  warning: '#FF9F0A',

  nowLine: '#FF453A',
};

export type ThemeName = 'dark' | 'oled' | 'tinted';

export interface Theme {
  name: ThemeName;
  bgPrimary: string;
  bgSurface: string;
  bgInput: string;
  bgHover: string;
  bgBlockActive: string;
  border: string;
  textPrimary: string;
  textSecondary: string;
  textTertiary: string;
  accentCyan: string;
  accentViolet: string;
  accentGreen: string;
  accentRed: string;
  accentYellow: string;
  priorityHigh: string;
  priorityMedium: string;
  priorityLow: string;
  success: string;
  danger: string;
  warning: string;
  nowLine: string;
}

export const Themes: Record<ThemeName, Theme> = {
  dark: DarkTheme as Theme,
  oled: OledTheme as Theme,
  tinted: TintedTheme as Theme,
};

// Legacy alias pour compatibilité avec les composants existants
export const Colors = DarkTheme;

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
    score: 56,
    timer: 46,
  },
  weights: {
    normal: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
};
