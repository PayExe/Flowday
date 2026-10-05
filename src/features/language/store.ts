import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type Language = 'fr' | 'en';

interface LanguageState {
  language: Language;
  setLanguage: (language: Language) => void;
}

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set) => ({ language: 'fr', setLanguage: (language) => set({ language }) }),
    { name: 'flowday-language', storage: createJSONStorage(() => AsyncStorage) },
  ),
);
