
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

export const ColorsDark = {
  bg: {
    primary: '#000000',           // systemBackground dark
    secondary: '#1C1C1E',         // secondarySystemBackground dark
    tertiary: '#2C2C2E',           // tertiarySystemBackground dark
    grouped: '#000000',            // systemGroupedBackground dark
    groupedSecondary: '#1C1C1E',  // secondarySystemGroupedBackground
    elevated: '#1C1C1E',           // elevated systemBackground (modals, sheets)
    input: '#2C2C2E',              // input / hover
    hover: '#2C2C2E',              // pressed state
    blockActive: '#2C2C2E',        // bloc actif timeline
  },

  separator: {
    default: '#38383A',            // opaque separator Apple
    hairline: '#54545899',           // non-opaque separator Apple
  },

  text: {
    primary: '#FFFFFF',            // label
    secondary: '#EBEBF599',        // secondaryLabel (60%)
    tertiary: '#EBEBF54D',         // tertiaryLabel (30%)
    quaternary: '#EBEBF52E',       // quaternaryLabel (18%)
    placeholder: '#3C3C4399',      // placeholderText
    link: '#0A84FF',               // link
    inverse: '#000000',            // text sur fond clair/accent
  },

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

export const ColorsLight = {
  bg: {
    primary: '#FFFFFF',            // systemBackground light
    secondary: '#F2F2F7',          // secondarySystemBackground light
    tertiary: '#FFFFFF',           // tertiarySystemBackground light
    grouped: '#F2F2F7',            // systemGroupedBackground light
    groupedSecondary: '#FFFFFF',   // secondarySystemGroupedBackground light
    elevated: '#FFFFFF',           // elevated
    input: '#FFFFFF',              // input / hover (avec bordure)
    hover: '#E5E5EA',              // pressed state
    blockActive: '#E5E5EA',        // bloc actif timeline
  },

  separator: {
    default: '#C6C6C8',            // opaque separator light
    hairline: '#3C3C4340',         // non-opaque separator light
  },

  text: {
    primary: '#000000',            // label
    secondary: '#3C3C4399',        // secondaryLabel (60% noir)
    tertiary: '#3C3C434D',         // tertiaryLabel (30% noir)
    quaternary: '#3C3C432E',       // quaternaryLabel (18% noir)
    placeholder: '#3C3C4399',      // placeholderText
    link: '#007AFF',               // link — Apple blue light
    inverse: '#FFFFFF',            // text sur fond foncé/accent
  },

  system: {
    blue: '#007AFF',
    green: '#34C759',
    red: '#FF3B30',
    orange: '#FF9500',
    yellow: '#FFCC00',
    purple: '#AF52DE',
    pink: '#FF2D55',
    teal: '#5AC8FA',
    indigo: '#5856D6',
    gray: '#8E8E93',
    gray2: '#AEAEB2',
    gray3: '#C7C7CC',
    gray4: '#D1D1D6',
    gray5: '#E5E5EA',
    gray6: '#F2F2F7',
  },

  bgPrimary: '#FFFFFF',
  bgSurface: '#F2F2F7',
  bgInput: '#FFFFFF',
  bgHover: '#E5E5EA',
  bgBlockActive: '#E5E5EA',
  border: '#C6C6C8',
  textPrimary: '#000000',
  textSecondary: '#3C3C4399',
  textTertiary: '#3C3C434D',
  textInverse: '#FFFFFF',
  accentPrimary: '#007AFF',
  accentSubtle: '#E5E5EA',
  success: '#34C759',
  danger: '#FF3B30',
  warning: '#FF9500',
  info: '#007AFF',
  nowLine: '#FF3B30',
} as const;

export interface ColorPalette {
  bg: {
    primary: string;
    secondary: string;
    tertiary: string;
    grouped: string;
    groupedSecondary: string;
    elevated: string;
    input: string;
    hover: string;
    blockActive: string;
  };
  separator: {
    default: string;
    hairline: string;
  };
  text: {
    primary: string;
    secondary: string;
    tertiary: string;
    quaternary: string;
    placeholder: string;
    link: string;
    inverse: string;
  };
  system: {
    blue: string;
    green: string;
    red: string;
    orange: string;
    yellow: string;
    purple: string;
    pink: string;
    teal: string;
    indigo: string;
    gray: string;
    gray2: string;
    gray3: string;
    gray4: string;
    gray5: string;
    gray6: string;
  };
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

export type ThemeName = 'dark' | 'light';

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  huge: 44,
} as const;

export const Space = Spacing;

export const Radius = {
  sm: 6,
  md: 10,
  lg: 13,
  xl: 20,
  xxl: 24,
  full: 9999,
} as const;

export function getTypography(isDark: boolean) {
  const textPrimary = isDark ? '#FFFFFF' : '#000000';
  const textSecondary = isDark ? '#EBEBF599' : '#3C3C4399';
  const textTertiary = isDark ? '#EBEBF54D' : '#3C3C434D';

  return {
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
    largeTitle: {
      fontSize: 34,
      fontWeight: '700' as const,
      letterSpacing: 0.37,
      color: textPrimary,
    },
    title1: {
      fontSize: 28,
      fontWeight: '700' as const,
      letterSpacing: 0.36,
      color: textPrimary,
    },
    title2: {
      fontSize: 22,
      fontWeight: '700' as const,
      letterSpacing: 0.35,
      color: textPrimary,
    },
    title3: {
      fontSize: 20,
      fontWeight: '600' as const,
      letterSpacing: 0.38,
      color: textPrimary,
    },
    headline: {
      fontSize: 17,
      fontWeight: '600' as const,
      letterSpacing: -0.41,
      color: textPrimary,
    },
    body: {
      fontSize: 17,
      fontWeight: '400' as const,
      letterSpacing: -0.41,
      color: textPrimary,
    },
    callout: {
      fontSize: 16,
      fontWeight: '400' as const,
      letterSpacing: -0.32,
      color: textPrimary,
    },
    subheadline: {
      fontSize: 15,
      fontWeight: '400' as const,
      letterSpacing: -0.24,
      color: textSecondary,
    },
    footnote: {
      fontSize: 13,
      fontWeight: '400' as const,
      letterSpacing: -0.08,
      color: textSecondary,
    },
    caption1: {
      fontSize: 12,
      fontWeight: '400' as const,
      letterSpacing: 0,
      color: textSecondary,
    },
    sectionHeader: {
      fontSize: 13,
      fontWeight: '400' as const,
      letterSpacing: -0.08,
      color: textSecondary,
      textTransform: 'uppercase' as const,
    },
    screenTitle: {
      fontSize: 34,
      fontWeight: '700' as const,
      letterSpacing: 0.37,
      color: textPrimary,
    },
    sectionTitle: {
      fontSize: 13,
      fontWeight: '400' as const,
      letterSpacing: -0.08,
      textTransform: 'uppercase' as const,
      color: textSecondary,
    },
    score: {
      fontSize: 56,
      fontWeight: '700' as const,
      letterSpacing: -2,
      color: textPrimary,
    },
    timer: {
      fontSize: 46,
      fontWeight: '300' as const,
      letterSpacing: -1,
      color: textPrimary,
    },
  } as const;
}

export const Typography = getTypography(true);
