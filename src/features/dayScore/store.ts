import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DayScore } from '../../types/dayScore';

interface DayScoreState {
  scores: DayScore[];
  currentDayScore: DayScore | null;
  pomodoroGoal: number;
  setPomodoroGoal: (goal: number) => void;
  recalculateScore: (date: string) => void;
  getScoreForDate: (date: string) => DayScore | undefined;

  incrementPomodoro: (date: string) => void;
  setMorningRitualDone: (date: string) => void;
  setEveningWrapDone: (date: string) => void;
  updateBlockValidation: (date: string, blocksValidated: number, totalBlocks: number) => void;
  updateTasksPercent: (date: string, completed: number, total: number) => void;
}

export function computeTotal(score: DayScore, pomodoroGoal: number): number {
  const ritualsPoints =
    (score.morningRitualDone ? 5 : 0) + (score.eveningWrapDone ? 5 : 0);
  const pomodorosPercent = pomodoroGoal > 0
    ? Math.min((score.pomodorosCompleted / pomodoroGoal) * 100, 100)
    : 0;
  const blocksPercent = Math.min(Math.max(score.blocksPercent, 0), 100);
  const tasksPercent = Math.min(Math.max(score.tasksPercent, 0), 100);
  const ritualsPercent = Math.min(ritualsPoints * 10, 100);
  score.blocksPercent = blocksPercent;
  score.tasksPercent = tasksPercent;
  score.pomodorosPercent = pomodorosPercent;
  score.ritualsPercent = ritualsPercent;
  const total =
    blocksPercent * 0.4 +
    tasksPercent * 0.3 +
    pomodorosPercent * 0.2 +
    ritualsPercent * 0.1;
  return Math.min(Math.round(total), 100);
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

function updateScore(
  state: DayScoreState,
  date: string,
  updater: (score: DayScore) => void
): { scores: DayScore[]; currentDayScore: DayScore } {
  const score = getOrCreateScore(state, date);
  updater(score);
  score.total = computeTotal(score, state.pomodoroGoal);
  const existingIndex = state.scores.findIndex((s) => s.date === date);
  const scores =
    existingIndex >= 0
      ? state.scores.map((s, i) => (i === existingIndex ? score : s))
      : [...state.scores, score];
  return { scores, currentDayScore: score };
}

export const useDayScoreStore = create<DayScoreState>()(
  persist(
    (set, get) => ({
      scores: [],
      currentDayScore: null,
      pomodoroGoal: 6,

      recalculateScore: (date) =>
        set((state) => {
          const existingIndex = state.scores.findIndex((s) => s.date === date);
          if (existingIndex < 0) return state;
          const score = { ...state.scores[existingIndex] };
          score.total = computeTotal(score, state.pomodoroGoal);
          return {
            scores: state.scores.map((s, i) => (i === existingIndex ? score : s)),
            currentDayScore: score,
          };
        }),

      incrementPomodoro: (date) =>
        set((state) => updateScore(state, date, (s) => { s.pomodorosCompleted += 1; })),

      setMorningRitualDone: (date) =>
        set((state) => updateScore(state, date, (s) => { s.morningRitualDone = true; })),

      setEveningWrapDone: (date) =>
        set((state) => updateScore(state, date, (s) => { s.eveningWrapDone = true; })),

      updateBlockValidation: (date, blocksValidated, totalBlocks) =>
        set((state) =>
          updateScore(state, date, (s) => {
            s.blocksPercent = totalBlocks > 0
              ? Math.min((blocksValidated / totalBlocks) * 100, 100)
              : 0;
          })
        ),

      updateTasksPercent: (date, completed, total) =>
        set((state) =>
          updateScore(state, date, (s) => {
            s.tasksPercent = total > 0 ? Math.min((completed / total) * 100, 100) : 0;
          })
        ),

      getScoreForDate: (date) => {
        return get().scores.find((s) => s.date === date);
      },

       setPomodoroGoal: (goal) => {
         if (!Number.isFinite(goal) || goal < 0) return;
         set({ pomodoroGoal: Math.floor(goal) });
       },
    }),
    {
      name: 'flowday-dayscores',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
