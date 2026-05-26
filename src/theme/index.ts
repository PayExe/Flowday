// ============================================================
// THEME / DESIGN SYSTEM — Flowday v4
// Entry point
// ============================================================

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

// ─── useTheme hook (dynamique dark / light) ──────────────────
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

// ─── Legacy static exports (compatibilité) ───────────────────
// ⚠️  Ces imports sont figés en dark mode.
//    Préférez useTheme() dans les nouveaux composants.
export const Typography = getTypography(true);
