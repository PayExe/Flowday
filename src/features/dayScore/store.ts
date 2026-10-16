import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { persistOptions, type Migrations } from '../../utils/persistence';
import { DayScore } from '../../types/dayScore';

interface DayScoreState {
  scores: DayScore[];
  pomodoroGoal: number;
  setPomodoroGoal: (goal: number) => void;
  getScoreForDate: (date: string) => DayScore | undefined;
  updateFidelity: (date: string, validated: number, tracked: number) => void;
}

export function fidelityPercent(validated: number, tracked: number): number {
  if (!(tracked > 0) || !Number.isFinite(validated)) return 0;
  return Math.round(Math.min(Math.max(validated / tracked, 0), 1) * 100);
}

export function normalizeScore(raw: Partial<DayScore> & { date: string }): DayScore {
  const blocksTracked = Number.isFinite(raw.blocksTracked) ? Math.max(0, raw.blocksTracked as number) : 0;
  const fidelity = Number.isFinite(raw.fidelity) ? Math.min(Math.max(raw.fidelity as number, 0), 100) : 0;
  return { date: raw.date, fidelity: blocksTracked > 0 ? fidelity : 0, blocksTracked };
}

export const DAY_SCORE_MIGRATIONS: Migrations = {
  // v2: the score keeps only the fidelity to the plan. The old weighted total mixed
  // tasks, Focus and rituals; `blocksPercent` was already the share of the plan lived.
  2: (state) => {
    const scores = Array.isArray(state.scores) ? state.scores : [];
    return {
      pomodoroGoal: state.pomodoroGoal,
      scores: scores
        .filter((score): score is Record<string, unknown> & { date: string } =>
          !!score && typeof (score as { date?: unknown }).date === 'string'
        )
        .map((score) =>
          normalizeScore({
            date: score.date,
            fidelity: score.blocksPercent as number,
            blocksTracked: score.blocksTracked as number,
          })
        ),
    };
  },
};

export const useDayScoreStore = create<DayScoreState>()(
  persist(
    (set, get) => ({
      scores: [],
      pomodoroGoal: 6,

      updateFidelity: (date, validated, tracked) =>
        set((state) => {
          const score = normalizeScore({ date, fidelity: fidelityPercent(validated, tracked), blocksTracked: tracked });
          const existing = state.scores.find((candidate) => candidate.date === date);
          if (existing && existing.fidelity === score.fidelity && existing.blocksTracked === score.blocksTracked) {
            return state;
          }
          return {
            scores: existing
              ? state.scores.map((candidate) => (candidate.date === date ? score : candidate))
              : [...state.scores, score],
          };
        }),

      getScoreForDate: (date) => {
        const score = get().scores.find((candidate) => candidate.date === date);
        return score ? normalizeScore(score) : undefined;
      },

      setPomodoroGoal: (goal) => {
        if (!Number.isFinite(goal) || goal < 0) return;
        set({ pomodoroGoal: Math.floor(goal) });
      },
    }),
    persistOptions<DayScoreState>('flowday-dayscores', { version: 2, migrations: DAY_SCORE_MIGRATIONS })
  )
);
