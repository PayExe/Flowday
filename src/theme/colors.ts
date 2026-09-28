export const ColorsDark = {
  bg: {
    primary: '#000000',
    secondary: '#1C1C1E',
    tertiary: '#2C2C2E',
    grouped: '#000000',
    groupedSecondary: '#1C1C1E',
    elevated: '#1C1C1E',
    input: '#2C2C2E',
    hover: '#2C2C2E',
    blockActive: '#2C2C2E',
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
    placeholder: '#3C3C4399',
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
} as const;

export const ColorsLight = {
  bg: {
    primary: '#FFFFFF',
    secondary: '#F2F2F7',
    tertiary: '#FFFFFF',
    grouped: '#F2F2F7',
    groupedSecondary: '#FFFFFF',
    elevated: '#FFFFFF',
    input: '#FFFFFF',
    hover: '#E5E5EA',
    blockActive: '#E5E5EA',
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
    placeholder: '#3C3C4399',
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
}

export type ThemeName = 'dark' | 'light';

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
