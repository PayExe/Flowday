import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  DAY_SCORE_MIGRATIONS,
  fidelityPercent,
  normalizeScore,
  useDayScoreStore,
} from '../src/features/dayScore/store';
import { runMigrations } from '../src/utils/persistence';

vi.mock('@react-native-async-storage/async-storage', () => ({
  default: {
    getItem: vi.fn().mockResolvedValue(null),
    setItem: vi.fn().mockResolvedValue(undefined),
    removeItem: vi.fn().mockResolvedValue(undefined),
  },
}));

describe('fidelity', () => {
  it('is the share of the tracked plan that was lived', () => {
    expect(fidelityPercent(1.5, 2)).toBe(75);
    expect(fidelityPercent(0, 3)).toBe(0);
    expect(fidelityPercent(4, 3)).toBe(100);
  });

  it('measures nothing when nothing was tracked', () => {
    expect(fidelityPercent(0, 0)).toBe(0);
    expect(normalizeScore({ date: '2026-10-05', fidelity: 80, blocksTracked: 0 })).toEqual({
      date: '2026-10-05',
      fidelity: 0,
      blocksTracked: 0,
    });
  });
});

describe('day score store', () => {
  beforeEach(() => {
    useDayScoreStore.setState({ scores: [], pomodoroGoal: 6 });
  });

  it('records the fidelity of a day and replaces it when it changes', () => {
    const store = useDayScoreStore.getState();
    store.updateFidelity('2026-10-05', 1, 2);
    store.updateFidelity('2026-10-05', 2, 2);
    expect(useDayScoreStore.getState().scores).toEqual([{ date: '2026-10-05', fidelity: 100, blocksTracked: 2 }]);
  });

  it('keeps the same state when nothing changed', () => {
    useDayScoreStore.getState().updateFidelity('2026-10-05', 1, 2);
    const before = useDayScoreStore.getState().scores;
    useDayScoreStore.getState().updateFidelity('2026-10-05', 1, 2);
    expect(useDayScoreStore.getState().scores).toBe(before);
  });

  it('rejects a negative Pomodoro goal', () => {
    useDayScoreStore.getState().setPomodoroGoal(-1);
    expect(useDayScoreStore.getState().pomodoroGoal).toBe(6);
  });

  it('normalizes scores persisted with missing fields before displaying them', () => {
    useDayScoreStore.setState({ scores: [{ date: '2026-01-02', fidelity: 999 } as never] });
    expect(useDayScoreStore.getState().getScoreForDate('2026-01-02')).toEqual({
      date: '2026-01-02',
      fidelity: 0,
      blocksTracked: 0,
    });
  });
});

describe('migration to fidelity', () => {
  const v1 = {
    pomodoroGoal: 4,
    currentDayScore: null,
    scores: [
      { date: '2026-10-05', total: 72, blocksPercent: 50, blocksTracked: 4, tasksPercent: 100, tasksTotal: 2 },
      { date: '2026-10-06', total: 40, blocksPercent: 0, blocksTracked: 0, tasksPercent: 100 },
      { date: '2026-05-01', total: 65, blocksPercent: 100, tasksPercent: 0 },
      { total: 10 },
    ],
  };

  it('keeps the share of the plan lived, and drops the weighted total', () => {
    expect(runMigrations(v1, 1, 2, DAY_SCORE_MIGRATIONS)).toEqual({
      pomodoroGoal: 4,
      scores: [
        { date: '2026-10-05', fidelity: 50, blocksTracked: 4 },
        { date: '2026-10-06', fidelity: 0, blocksTracked: 0 },
        { date: '2026-05-01', fidelity: 0, blocksTracked: 0 },
      ],
    });
  });
});
