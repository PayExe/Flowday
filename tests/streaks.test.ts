import { describe, expect, it } from 'vitest';
import { calculateStreaks } from '../src/utils/streaks';

describe('streaks', () => {
  it('counts consecutive valid days and breaks on a gap', () => {
    const score = (date: string, total: number) => ({
      date, total, blocksPercent: 0, tasksPercent: 0, pomodorosPercent: 0,
      ritualsPercent: 0, pomodorosCompleted: 0, pomodorosGoal: 6,
      morningRitualDone: false, eveningWrapDone: false,
    });
    expect(calculateStreaks([
      score('2026-01-01', 60), score('2026-01-02', 70), score('2026-01-04', 90),
    ])).toEqual({ currentStreak: 0, bestStreak: 2 });
  });
});
