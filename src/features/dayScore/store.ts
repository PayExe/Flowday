import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DayScore } from '../../types/dayScore';

interface DayScoreState {
  scores: DayScore[];
  currentDayScore: DayScore | null;
  pomodoroGoal: number;
  addOrUpdateScore: (score: Partial<DayScore> & { date: string }) => void;
  incrementPomodoro: (date: string) => void;
  setMorningRitualDone: (date: string) => void;
  setEveningWrapDone: (date: string) => void;
  calculateDayScore: (date: string) => number;
  getScoreForDate: (date: string) => DayScore | undefined;
  setPomodoroGoal: (goal: number) => void;
}

function getOrCreateScore(state: DayScoreState, date: string): DayScore {
  const existing = state.scores.find((s) => s.date === date);
  if (existing) return { ...existing };
  return {
    date,
    total: 0,
    blocksPercent: 0,
    tasksPercent: 0,
    pomodorosPercent: 0,
    ritualsPercent: 0,
    pomodorosCompleted: 0,
    pomodorosGoal: state.pomodoroGoal,
    morningRitualDone: false,
    eveningWrapDone: false,
  };
}

export const useDayScoreStore = create<DayScoreState>()(
  persist(
    (set, get) => ({
      scores: [],
      currentDayScore: null,
      pomodoroGoal: 6,

      addOrUpdateScore: (data) =>
        set((state) => {
          const existingIndex = state.scores.findIndex((s) => s.date === data.date);
          const base =
            existingIndex >= 0
              ? { ...state.scores[existingIndex] }
              : {
                  date: data.date,
                  total: 0,
                  blocksPercent: 0,
                  tasksPercent: 0,
                  pomodorosPercent: 0,
                  ritualsPercent: 0,
                  pomodorosCompleted: 0,
                  pomodorosGoal: state.pomodoroGoal,
                  morningRitualDone: false,
                  eveningWrapDone: false,
                };
          const updated = { ...base, ...data };
          const scores =
            existingIndex >= 0
              ? state.scores.map((s, i) => (i === existingIndex ? updated : s))
              : [...state.scores, updated];
          return { scores, currentDayScore: updated };
        }),

      incrementPomodoro: (date) =>
        set((state) => {
          const score = getOrCreateScore(get(), date);
          score.pomodorosCompleted += 1;
          const scores = state.scores.some((s) => s.date === date)
            ? state.scores.map((s) => (s.date === date ? score : s))
            : [...state.scores, score];
          return { scores, currentDayScore: score };
        }),

      setMorningRitualDone: (date) =>
        set((state) => {
          const score = getOrCreateScore(get(), date);
          score.morningRitualDone = true;
          const scores = state.scores.some((s) => s.date === date)
            ? state.scores.map((s) => (s.date === date ? score : s))
            : [...state.scores, score];
          return { scores, currentDayScore: score };
        }),

      setEveningWrapDone: (date) =>
        set((state) => {
          const score = getOrCreateScore(get(), date);
          score.eveningWrapDone = true;
          const scores = state.scores.some((s) => s.date === date)
            ? state.scores.map((s) => (s.date === date ? score : s))
            : [...state.scores, score];
          return { scores, currentDayScore: score };
        }),

      calculateDayScore: (date) => {
        const score = get().scores.find((s) => s.date === date);
        if (!score) return 0;
        // Blocs 40% + Tâches 30% + Pomodoros 20% + Rituals 10%
        const rituals =
          (score.morningRitualDone ? 5 : 0) + (score.eveningWrapDone ? 5 : 0);
        const pomodoros = Math.min(
          (score.pomodorosCompleted / score.pomodorosGoal) * 100,
          100
        );
        const total =
          score.blocksPercent * 0.4 +
          score.tasksPercent * 0.3 +
          pomodoros * 0.2 +
          rituals;
        return Math.round(total);
      },

      getScoreForDate: (date) => {
        return get().scores.find((s) => s.date === date);
      },

      setPomodoroGoal: (goal) => set({ pomodoroGoal: goal }),
    }),
    {
      name: 'flowday-dayscores',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
