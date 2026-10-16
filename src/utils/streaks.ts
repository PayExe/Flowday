import { DayScore } from '../types/dayScore';
import { calendarDayDifference, dateKey, shiftDateKey } from './dates';

export const STREAK_FIDELITY = 60;

export interface StreakResult {
  currentStreak: number;
  bestStreak: number;
}

export function calculateStreaks(
  scores: readonly DayScore[],
  threshold = STREAK_FIDELITY,
  today = dateKey()
): StreakResult {
  const sorted = [...scores].sort((a, b) => a.date.localeCompare(b.date));

  let streak = 0;
  let bestStreak = 0;
  let previous: string | null = null;

  for (const score of sorted) {
    if (previous !== null && calendarDayDifference(previous, score.date) > 1) streak = 0;
    previous = score.date;

    // Nothing planned that day, or today is not over yet: the day neither counts nor breaks.
    if (score.blocksTracked === 0) continue;
    if (score.fidelity < threshold && score.date === today) continue;

    streak = score.fidelity >= threshold ? streak + 1 : 0;
    bestStreak = Math.max(bestStreak, streak);
  }

  const alive = previous === today || previous === shiftDateKey(today, -1);
  return { currentStreak: alive ? streak : 0, bestStreak };
}
