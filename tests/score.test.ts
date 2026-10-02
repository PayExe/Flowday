import { describe, expect, it, vi } from 'vitest';
import { computeTotal, useDayScoreStore } from '../src/features/dayScore/store';

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
});
