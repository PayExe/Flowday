import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemeName } from '../../theme';

interface ThemeState {
  themeName: ThemeName;
  setTheme: (name: ThemeName) => void;
  toggleTheme: () => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      themeName: 'dark',

      setTheme: (name) =>
        set({
          themeName: name,
        }),

      toggleTheme: () =>
        set((state) => {
          const next = state.themeName === 'dark' ? 'light' : 'dark';
          return { themeName: next };
        }),
    }),
    {
      name: 'flowday-theme',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
