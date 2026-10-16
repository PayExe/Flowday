import { describe, expect, it } from 'vitest';
import { calculateStreaks } from '../src/utils/streaks';

const day = (date: string, fidelity: number, blocksTracked = 3) => ({ date, fidelity, blocksTracked });

describe('streaks', () => {
  it('counts consecutive days at 60% fidelity and breaks on a gap', () => {
    expect(
      calculateStreaks([day('2026-01-01', 60), day('2026-01-02', 70), day('2026-01-04', 90)], 60, '2026-01-10')
    ).toEqual({ currentStreak: 0, bestStreak: 2 });
  });

  it('breaks on a day below the threshold', () => {
    expect(
      calculateStreaks([day('2026-01-01', 80), day('2026-01-02', 40), day('2026-01-03', 90)], 60, '2026-01-03')
    ).toEqual({ currentStreak: 1, bestStreak: 1 });
  });

  it('does not let a day with nothing planned break or extend the streak', () => {
    expect(
      calculateStreaks([day('2026-01-01', 80), day('2026-01-02', 0, 0), day('2026-01-03', 90)], 60, '2026-01-03')
    ).toEqual({ currentStreak: 2, bestStreak: 2 });
  });

  it('waits for today to be over before breaking the streak', () => {
    expect(
      calculateStreaks([day('2026-01-01', 80), day('2026-01-02', 90), day('2026-01-03', 20)], 60, '2026-01-03')
    ).toEqual({ currentStreak: 2, bestStreak: 2 });
  });

  it('ends the current streak when the last day is older than yesterday', () => {
    expect(calculateStreaks([day('2026-01-01', 80)], 60, '2026-01-03')).toEqual({ currentStreak: 0, bestStreak: 1 });
  });
});
