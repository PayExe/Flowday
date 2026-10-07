import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { persistOptions } from '../../utils/persistence';
import type { ThemePreference } from '../../theme/colors';

interface ThemeState {
  themeName: ThemePreference;
  setTheme: (name: ThemePreference) => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      themeName: 'system',

      setTheme: (name) =>
        set({
          themeName: name,
        }),
    }),
    persistOptions<ThemeState>('flowday-theme', { version: 1 })
  )
);
