export const ColorsDark = {
  bg: {
    primary: '#000000',
    secondary: '#1C1C1E',
    tertiary: '#7676803D',
    hover: '#3A3A3C',
  },

  separator: {
    default: '#38383A',
    hairline: '#54545899',
  },

  text: {
    primary: '#FFFFFF',
    secondary: '#EBEBF599',
    tertiary: '#EBEBF54D',
    quaternary: '#EBEBF52E',
    placeholder: '#EBEBF54D',
    link: '#0A84FF',
    inverse: '#FFFFFF',
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

  accent: '#0A84FF',
} as const;

export const ColorsLight = {
  bg: {
    primary: '#F2F2F7',
    secondary: '#FFFFFF',
    tertiary: '#7676801F',
    hover: '#E5E5EA',
  },

  separator: {
    default: '#C6C6C8',
    hairline: '#3C3C4340',
  },

  text: {
    primary: '#000000',
    secondary: '#3C3C4399',
    tertiary: '#3C3C434D',
    quaternary: '#3C3C432E',
    placeholder: '#3C3C434D',
    link: '#007AFF',
    inverse: '#FFFFFF',
  },

  system: {
    blue: '#007AFF',
    green: '#34C759',
    red: '#FF3B30',
    orange: '#FF9500',
    yellow: '#FFCC00',
    purple: '#AF52DE',
    pink: '#FF2D55',
    teal: '#30B0C7',
    indigo: '#5856D6',
    gray: '#8E8E93',
    gray2: '#AEAEB2',
    gray3: '#C7C7CC',
    gray4: '#D1D1D6',
    gray5: '#E5E5EA',
    gray6: '#F2F2F7',
  },

  accent: '#007AFF',
} as const;

export interface ColorPalette {
  bg: {
    /** Screen background (grouped). */
    primary: string;
    /** Cards and grouped rows. */
    secondary: string;
    /** Translucent fill for controls sitting on a card or on the background. */
    tertiary: string;
    /** Pressed state of a row. */
    hover: string;
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
  accent: string;
}

export type ThemeName = 'dark' | 'light';
export type ThemePreference = ThemeName | 'system';

export const radius = {
  sm: 10,
  md: 14,
  lg: 22,
  xl: 28,
  pill: 999,
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 28,
} as const;

/** Adds an alpha channel to a `#RRGGBB` color. */
export function withAlpha(hex: string, alpha: number): string {
  const base = hex.length === 9 ? hex.slice(0, 7) : hex;
  const channel = Math.round(Math.max(0, Math.min(1, alpha)) * 255)
    .toString(16)
    .padStart(2, '0');
  return `${base}${channel}`;
}

/** Life blocks can be pure white, which disappears on a light card. */
export function resolveBlockColor(color: string | undefined, isDark: boolean): string {
  if (!color) return '#8E8E93';
  if (!isDark && color.toUpperCase() === '#FFFFFF') return '#8E8E93';
  return color;
}

export function getTypography(isDark: boolean) {
  const textPrimary = isDark ? '#FFFFFF' : '#000000';
  const textSecondary = isDark ? '#EBEBF599' : '#3C3C4399';
  return {
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
    caption: {
      fontSize: 12,
      fontWeight: '400' as const,
      letterSpacing: 0,
      color: textSecondary,
    },
    eyebrow: {
      fontSize: 13,
      fontWeight: '600' as const,
      letterSpacing: 0.2,
      textTransform: 'uppercase' as const,
      color: textSecondary,
    },
  } as const;
}
