
import { useMemo } from 'react';
import { useThemeStore } from '../features/theme/store';
import {
  ColorsDark,
  ColorsLight,
  getTypography,
  type ColorPalette,
  type ThemeName,
} from './colors';

export { ColorsDark, ColorsLight, getTypography };
export type { ColorPalette, ThemeName };

export function useTheme() {
  const themeName = useThemeStore((s) => s.themeName);
  const isDark = themeName === 'dark';

  const colors: ColorPalette = useMemo(
    () => (isDark ? ColorsDark : ColorsLight),
    [isDark]
  );

  const typography = useMemo(() => getTypography(isDark), [isDark]);

  return {
    themeName,
    isDark,
    colors,
    typography,
  };
}
