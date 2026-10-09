import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { persistOptions } from '../../utils/persistence';
import { DayScore } from '../../types/dayScore';
import { dateKey } from '../../utils/dates';

interface DayScoreState {
  scores: DayScore[];
  currentDayScore: DayScore | null;
  pomodoroGoal: number;
  setPomodoroGoal: (goal: number) => void;
  recalculateScore: (date: string) => void;
  getScoreForDate: (date: string) => DayScore | undefined;
  getAllScores: () => DayScore[];

  incrementPomodoro: (date: string) => void;
  setMorningRitualDone: (date: string) => void;
  setEveningWrapDone: (date: string) => void;
  updateBlockValidation: (date: string, blocksValidated: number, totalBlocks: number) => void;
  updateTasksPercent: (date: string, completed: number, total: number) => void;
}

export const SCORE_WEIGHTS = { blocks: 0.4, tasks: 0.3, pomodoros: 0.2, rituals: 0.1 } as const;

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
  const parts = [
    { weight: SCORE_WEIGHTS.blocks, percent: blocksPercent, counts: score.blocksTracked !== 0 },
    { weight: SCORE_WEIGHTS.tasks, percent: tasksPercent, counts: score.tasksTotal !== 0 },
    { weight: SCORE_WEIGHTS.pomodoros, percent: pomodorosPercent, counts: pomodoroGoal > 0 },
    { weight: SCORE_WEIGHTS.rituals, percent: ritualsPercent, counts: true },
  ].filter((part) => part.counts);
  const weight = parts.reduce((sum, part) => sum + part.weight, 0);
  const total = parts.reduce((sum, part) => sum + part.percent * part.weight, 0) / weight;
  return Math.min(Math.round(total), 100);
}

function getOrCreateScore(state: DayScoreState, date: string): DayScore {
  const defaults: DayScore = {
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
  const existing = state.scores.find((s) => s.date === date);
  return existing ? { ...defaults, ...existing } : defaults;
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
            s.blocksTracked = totalBlocks;
            s.blocksPercent = totalBlocks > 0
              ? Math.min((blocksValidated / totalBlocks) * 100, 100)
              : 0;
          })
        ),

      updateTasksPercent: (date, completed, total) =>
        set((state) =>
          updateScore(state, date, (s) => {
            s.tasksTotal = total;
            s.tasksPercent = total > 0 ? Math.min((completed / total) * 100, 100) : 0;
          })
        ),

      getScoreForDate: (date) => {
        const score = get().scores.find((s) => s.date === date);
        if (!score) return undefined;
        const normalized = getOrCreateScore(get(), date);
        normalized.total = computeTotal(normalized, get().pomodoroGoal);
        return normalized;
      },

      getAllScores: () => {
        return get().scores.map((score) => {
          const normalized = getOrCreateScore(get(), score.date);
          normalized.total = computeTotal(normalized, get().pomodoroGoal);
          return normalized;
        });
      },

      setPomodoroGoal: (goal) => {
        if (!Number.isFinite(goal) || goal < 0) return;
        set((state) => {
          const pomodoroGoal = Math.floor(goal);
          const today = dateKey();
          const scores = state.scores.map((s) => {
            if (s.date !== today) return s;
            const next = { ...s, pomodorosGoal: pomodoroGoal };
            next.total = computeTotal(next, pomodoroGoal);
            return next;
          });
          return { pomodoroGoal, scores };
        });
      },
    }),
    persistOptions<DayScoreState>('flowday-dayscores', { version: 1 })
  )
);
