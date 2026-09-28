import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RitualLog, MorningRitualConfig, EveningWrapConfig, Mood } from '../../types/ritual';
import { dateKey } from '../../utils/dates';

interface RitualState {
  logs: RitualLog[];
  morningConfig: MorningRitualConfig;
  eveningConfig: EveningWrapConfig;
  hasDoneMorningToday: () => boolean;
  hasDoneEveningToday: () => boolean;
  logMorningRitual: (data: { mood?: Mood; intention?: string }) => void;
  logEveningWrap: (data: { note?: string }) => void;
  updateMorningConfig: (config: Partial<MorningRitualConfig>) => void;
  updateEveningConfig: (config: Partial<EveningWrapConfig>) => void;
  getTodayLog: (type: 'morning' | 'evening') => RitualLog | undefined;
}

function todayISO(): string {
  return dateKey();
}

export const useRitualStore = create<RitualState>()(
  persist(
    (set, get) => ({
      logs: [],
      morningConfig: {
        enabled: true,
        time: '08:00',
        fastMode: false,
        steps: {
          mood: true,
          overview: true,
          priorities: true,
          intention: true,
        },
      },
      eveningConfig: {
        enabled: true,
        time: '20:00',
      },

      hasDoneMorningToday: () => {
        return get().logs.some(
          (log) => log.date === todayISO() && log.type === 'morning'
        );
      },

      hasDoneEveningToday: () => {
        return get().logs.some(
          (log) => log.date === todayISO() && log.type === 'evening'
        );
      },

      logMorningRitual: (data) =>
        set((state) => {
          const date = todayISO();
          const log: RitualLog = {
            date,
            type: 'morning',
            mood: data.mood,
            intention: data.intention,
            completedAt: new Date().toISOString(),
          };
          const filtered = state.logs.filter(
            (l) => !(l.date === date && l.type === 'morning')
          );
          return { logs: [...filtered, log] };
        }),

      logEveningWrap: (data) =>
        set((state) => {
          const date = todayISO();
          const log: RitualLog = {
            date,
            type: 'evening',
            note: data.note,
            completedAt: new Date().toISOString(),
          };
          const filtered = state.logs.filter(
            (l) => !(l.date === date && l.type === 'evening')
          );
          return { logs: [...filtered, log] };
        }),

      updateMorningConfig: (config) =>
        set((state) => ({
          morningConfig: { ...state.morningConfig, ...config },
        })),

      updateEveningConfig: (config) =>
        set((state) => ({
          eveningConfig: { ...state.eveningConfig, ...config },
        })),

      getTodayLog: (type) => {
        return get().logs.find(
          (log) => log.date === todayISO() && log.type === type
        );
      },
    }),
    {
      name: 'flowday-rituals',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
