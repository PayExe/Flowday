import { describe, expect, it, vi } from 'vitest';
import { computeTotal, useDayScoreStore } from '../src/features/dayScore/store';
import { dateKey } from '../src/utils/dates';

vi.mock('@react-native-async-storage/async-storage', () => ({
  default: {
    getItem: vi.fn().mockResolvedValue(null),
    setItem: vi.fn().mockResolvedValue(undefined),
    removeItem: vi.fn().mockResolvedValue(undefined),
  },
}));

describe('day score', () => {
  it('applies weights and caps percentages at 100', () => {
    const score = {
      date: '2026-01-02', total: 0, blocksPercent: 120, tasksPercent: 100,
      pomodorosPercent: 0, ritualsPercent: 0, pomodorosCompleted: 8,
      pomodorosGoal: 6, morningRitualDone: true, eveningWrapDone: true,
    };
    expect(computeTotal(score, 6)).toBe(100);
  });

  it('updates and stores a score when a pomodoro completes', () => {
    useDayScoreStore.setState({ scores: [], currentDayScore: null, pomodoroGoal: 6 });
    useDayScoreStore.getState().incrementPomodoro('2026-01-02');
    expect(useDayScoreStore.getState().getScoreForDate('2026-01-02')?.pomodorosCompleted).toBe(1);
  });

  it('rejects a negative Pomodoro goal', () => {
    useDayScoreStore.setState({ scores: [], currentDayScore: null, pomodoroGoal: 6 });

    useDayScoreStore.getState().setPomodoroGoal(-1);

    expect(useDayScoreStore.getState().pomodoroGoal).toBe(6);
  });

  it('normalizes scores persisted with missing fields before displaying them', () => {
    useDayScoreStore.setState({
      scores: [{ date: '2026-01-02', total: 999 } as never],
      currentDayScore: null,
      pomodoroGoal: 6,
    });

    expect(useDayScoreStore.getState().getScoreForDate('2026-01-02')).toMatchObject({
      total: 0,
      tasksPercent: 0,
      blocksPercent: 0,
      morningRitualDone: false,
    });
  });

  describe('parts with nothing to measure', () => {
    const base = {
      date: '2026-01-02', total: 0, blocksPercent: 0, tasksPercent: 0,
      pomodorosPercent: 0, ritualsPercent: 0, pomodorosCompleted: 0,
      pomodorosGoal: 6, morningRitualDone: true, eveningWrapDone: true,
    };

    it('reaches 100 without any block to track', () => {
      const score = { ...base, blocksTracked: 0, tasksTotal: 3, tasksPercent: 100, pomodorosCompleted: 6 };
      expect(computeTotal(score, 6)).toBe(100);
    });

    it('shares the weight of an empty part instead of scoring it 0', () => {
      // Tasks 100% (0.3) + rituals 100% (0.1) over 0.6 of counted weight.
      const score = { ...base, blocksTracked: 0, tasksTotal: 2, tasksPercent: 100 };
      expect(computeTotal(score, 6)).toBe(67);
    });

    it('leaves Focus out when the goal is 0', () => {
      const score = { ...base, blocksTracked: 1, blocksPercent: 100, tasksTotal: 1, tasksPercent: 100 };
      expect(computeTotal(score, 0)).toBe(100);
    });

    it('keeps every part for scores saved before the counts existed', () => {
      expect(computeTotal({ ...base, tasksPercent: 100 }, 6)).toBe(40);
    });

    it('records the counts and recomputes today when the Focus goal changes', () => {
      useDayScoreStore.setState({ scores: [], currentDayScore: null, pomodoroGoal: 6 });
      const key = dateKey();
      const store = useDayScoreStore.getState();
      store.updateTasksPercent(key, 1, 1);
      store.updateBlockValidation(key, 0, 0);
      expect(store.getScoreForDate(key)).toMatchObject({ tasksTotal: 1, blocksTracked: 0 });

      useDayScoreStore.getState().setPomodoroGoal(0);
      // Only tasks (100%) and rituals (0%) remain: 30 / 40.
      expect(useDayScoreStore.getState().scores[0].total).toBe(75);
    });
  });
});
