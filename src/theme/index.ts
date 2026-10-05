
import { useMemo } from 'react';
import { useColorScheme } from 'react-native';
import { useThemeStore } from '../features/theme/store';
import {
  ColorsDark,
  ColorsLight,
  getTypography,
  radius,
  resolveBlockColor,
  spacing,
  withAlpha,
  type ColorPalette,
  type ThemeName,
  type ThemePreference,
} from './colors';

export { ColorsDark, ColorsLight, getTypography, radius, resolveBlockColor, spacing, withAlpha };
export type { ColorPalette, ThemeName, ThemePreference };

export function useTheme() {
  const preference = useThemeStore((s) => s.themeName);
  const systemScheme = useColorScheme();
  const isDark = preference === 'system' ? systemScheme === 'dark' : preference === 'dark';
  const themeName: ThemeName = isDark ? 'dark' : 'light';

  const colors: ColorPalette = useMemo(
    () => (isDark ? ColorsDark : ColorsLight),
    [isDark]
  );

  const typography = useMemo(() => getTypography(isDark), [isDark]);

  return {
    themeName,
    preference,
    isDark,
    colors,
    typography,
  };
}
