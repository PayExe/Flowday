
import { useMemo } from 'react';
import { useThemeStore } from '../features/theme/store';
import {
  ColorsDark,
  ColorsLight,
  getTypography,
  LifeBlockColors,
  Spacing,
  Space,
  Radius,
  type ColorPalette,
  type ThemeName,
  type LifeBlockColor,
} from './colors';

export {
  LifeBlockColors,
  Spacing,
  Space,
  Radius,
  ColorsDark,
  ColorsLight,
  getTypography,
};
export type { ColorPalette, ThemeName, LifeBlockColor };

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

export const Typography = getTypography(true);
