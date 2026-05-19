// ============================================================
// THEME / DESIGN SYSTEM — Flowday v3
// ============================================================
// Style : Apple Dark natif (iOS UIKit)
// Référence : Things 3 + Apple Reminders + Settings dark
// ============================================================

// ─── Life Block Colors (12 couleurs Apple exactes) ───────────
export const LifeBlockColors = [
  '#30D158', // vert
  '#FF453A', // rouge
  '#FFD60A', // jaune
  '#BF5AF2', // violet
  '#0A84FF', // bleu
  '#FF9F0A', // orange
  '#FF375F', // rose
  '#5E5CE6', // indigo
  '#40CBE0', // teal
  '#AC8E68', // marron
  '#8E8E93', // gris
  '#FFFFFF', // blanc
] as const;

export type LifeBlockColor = (typeof LifeBlockColors)[number];

// ─── Palette Apple Dark ──────────────────────────────────────
export const Colors = {
  // === Fonds === (Apple UIKit dark exact)
  bg: {
    primary: '#000000', // systemBackground dark
    secondary: '#1C1C1E', // secondarySystemBackground dark
    tertiary: '#2C2C2E', // tertiarySystemBackground dark
    grouped: '#000000', // systemGroupedBackground dark
    groupedSecondary: '#1C1C1E', // secondarySystemGroupedBackground
    elevated: '#2C2C2E', // fond élevé (modales, sheets)
  },

  // === Séparateurs ===
  separator: {
    default: '#38383A', // opaque separator Apple
    hairline: '#54545899', // non-opaque separator Apple
  },

  // === Textes === (Apple label colors dark)
  text: {
    primary: '#FFFFFF', // label
    secondary: '#EBEBF599', // secondaryLabel (60% blanc)
    tertiary: '#EBEBF54D', // tertiaryLabel (30% blanc)
    quaternary: '#EBEBF52E', // quaternaryLabel (18% blanc)
    placeholder: '#3C3C4399', // placeholderText
    link: '#0A84FF', // link — Apple blue dark
  },

  // === Accents système Apple ===
  system: {
    blue: '#0A84FF',
    green: '#30D158',
    red: '#FF453A',
    orange: '#FF9F0A',
    yellow: '#FFD60A',
    purple: '#BF5AF2',
    pink: '#FF375F',
    teal: '#40CBE0',
    indigo: '#5E5CE6',
    gray: '#8E8E93',
    gray2: '#636366',
    gray3: '#48484A',
    gray4: '#3A3A3C',
    gray5: '#2C2C2E',
    gray6: '#1C1C1E',
  },

  // === Life Blocks (les seules vraies couleurs dans l'UI) ===
  blocks: LifeBlockColors,

  // === Legacy aliases (pour compatibilité migration douce) ===
  bgPrimary: '#000000',
  bgSurface: '#1C1C1E',
  bgInput: '#2C2C2E',
  bgHover: '#2C2C2E',
  bgBlockActive: '#2C2C2E',
  border: '#38383A',
  textPrimary: '#FFFFFF',
  textSecondary: '#EBEBF599',
  textTertiary: '#EBEBF54D',
  textInverse: '#000000',
  accentPrimary: '#0A84FF',
  accentSubtle: '#2C2C2E',
  success: '#30D158',
  danger: '#FF453A',
  warning: '#FF9F0A',
  info: '#0A84FF',
  nowLine: '#FF453A',
} as const;

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
  textInverse: string;
  accentPrimary: string;
  accentSubtle: string;
  success: string;
  danger: string;
  warning: string;
  info: string;
  nowLine: string;
}

// Legacy themes — maintiennent l'interface Theme mais avec les couleurs Apple
export const DarkTheme: Theme = {
  name: 'dark',
  bgPrimary: '#000000',
  bgSurface: '#1C1C1E',
  bgInput: '#2C2C2E',
  bgHover: '#2C2C2E',
  bgBlockActive: '#2C2C2E',
  border: '#38383A',
  textPrimary: '#FFFFFF',
  textSecondary: '#EBEBF599',
  textTertiary: '#EBEBF54D',
  textInverse: '#000000',
  accentPrimary: '#0A84FF',
  accentSubtle: '#2C2C2E',
  success: '#30D158',
  danger: '#FF453A',
  warning: '#FF9F0A',
  info: '#0A84FF',
  nowLine: '#FF453A',
};

export const OledTheme: Theme = {
  name: 'oled',
  bgPrimary: '#000000',
  bgSurface: '#1C1C1E',
  bgInput: '#2C2C2E',
  bgHover: '#2C2C2E',
  bgBlockActive: '#2C2C2E',
  border: '#38383A',
  textPrimary: '#FFFFFF',
  textSecondary: '#EBEBF599',
  textTertiary: '#EBEBF54D',
  textInverse: '#000000',
  accentPrimary: '#0A84FF',
  accentSubtle: '#2C2C2E',
  success: '#30D158',
  danger: '#FF453A',
  warning: '#FF9F0A',
  info: '#0A84FF',
  nowLine: '#FF453A',
};

export const TintedTheme: Theme = {
  name: 'tinted',
  bgPrimary: '#000000',
  bgSurface: '#1C1C1E',
  bgInput: '#2C2C2E',
  bgHover: '#2C2C2E',
  bgBlockActive: '#2C2C2E',
  border: '#38383A',
  textPrimary: '#FFFFFF',
  textSecondary: '#EBEBF599',
  textTertiary: '#EBEBF54D',
  textInverse: '#000000',
  accentPrimary: '#0A84FF',
  accentSubtle: '#2C2C2E',
  success: '#30D158',
  danger: '#FF453A',
  warning: '#FF9F0A',
  info: '#0A84FF',
  nowLine: '#FF453A',
};

export const Themes: Record<ThemeName, Theme> = {
  dark: DarkTheme,
  oled: OledTheme,
  tinted: TintedTheme,
};

// ─── Spacing — Apple HIG ─────────────────────────────────────
export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16, // padding horizontal standard
  xl: 20,
  xxl: 24,
  xxxl: 32,
  huge: 44, // minimum touch target Apple
} as const;

export const Space = Spacing;

// ─── Radius ──────────────────────────────────────────────────
export const Radius = {
  sm: 6,
  md: 10,
  lg: 13, // radius Apple des cellules groupées
  xl: 20, // sheets, modales
  xxl: 24,
  full: 9999,
} as const;

// ─── Typography — SF Pro natif iOS ───────────────────────────
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
  // Styles prédéfinis
  largeTitle: {
    fontSize: 34,
    fontWeight: '700' as const,
    letterSpacing: 0.37,
    color: '#FFFFFF',
  },
  title1: {
    fontSize: 28,
    fontWeight: '700' as const,
    letterSpacing: 0.36,
    color: '#FFFFFF',
  },
  title2: {
    fontSize: 22,
    fontWeight: '700' as const,
    letterSpacing: 0.35,
    color: '#FFFFFF',
  },
  title3: {
    fontSize: 20,
    fontWeight: '600' as const,
    letterSpacing: 0.38,
    color: '#FFFFFF',
  },
  headline: {
    fontSize: 17,
    fontWeight: '600' as const,
    letterSpacing: -0.41,
    color: '#FFFFFF',
  },
  body: {
    fontSize: 17,
    fontWeight: '400' as const,
    letterSpacing: -0.41,
    color: '#FFFFFF',
  },
  callout: {
    fontSize: 16,
    fontWeight: '400' as const,
    letterSpacing: -0.32,
    color: '#FFFFFF',
  },
  subheadline: {
    fontSize: 15,
    fontWeight: '400' as const,
    letterSpacing: -0.24,
    color: '#EBEBF599',
  },
  footnote: {
    fontSize: 13,
    fontWeight: '400' as const,
    letterSpacing: -0.08,
    color: '#EBEBF599',
  },
  caption1: {
    fontSize: 12,
    fontWeight: '400' as const,
    letterSpacing: 0,
    color: '#EBEBF599',
  },
  sectionHeader: {
    fontSize: 13,
    fontWeight: '400' as const,
    letterSpacing: -0.08,
    color: '#EBEBF599',
    textTransform: 'uppercase' as const,
  },
  screenTitle: { fontSize: 34, fontWeight: '700' as const, letterSpacing: 0.37 },
  sectionTitle: { fontSize: 13, fontWeight: '400' as const, letterSpacing: -0.08, textTransform: 'uppercase' as const },
  score: { fontSize: 56, fontWeight: '700' as const, letterSpacing: -2 },
  timer: { fontSize: 46, fontWeight: '300' as const, letterSpacing: -1 },
} as const;
