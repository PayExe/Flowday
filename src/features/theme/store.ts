import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
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
    {
      name: 'flowday-theme',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
