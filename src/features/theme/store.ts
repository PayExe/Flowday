import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemeName, Themes, Theme } from '../../theme';

interface ThemeState {
  themeName: ThemeName;
  theme: Theme;
  setTheme: (name: ThemeName) => void;
  toggleTheme: () => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      themeName: 'dark',
      theme: Themes.dark,

      setTheme: (name) =>
        set({
          themeName: name,
          theme: Themes[name],
        }),

      toggleTheme: () =>
        set((state) => {
          const order: ThemeName[] = ['dark', 'oled', 'tinted'];
          const nextIndex = (order.indexOf(state.themeName) + 1) % order.length;
          const next = order[nextIndex];
          return { themeName: next, theme: Themes[next] };
        }),
    }),
    {
      name: 'flowday-theme',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
