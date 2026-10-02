import { DayScore } from '../types/dayScore';
import { addDays, calendarDayDifference, dateKey } from './dates';

export interface StreakResult {
  currentStreak: number;
  bestStreak: number;
}

export function calculateStreaks(
  scores: DayScore[],
  threshold = 60,
  maxGapDays = 0
): StreakResult {
  if (scores.length === 0) {
    return { currentStreak: 0, bestStreak: 0 };
  }

  const sorted = [...scores].sort((a, b) => a.date.localeCompare(b.date));

  let currentStreak = 0;
  let bestStreak = 0;
  let tempStreak = 0;

  const today = dateKey();
  const yesterday = dateKey(addDays(new Date(), -1));

  for (let i = 0; i < sorted.length; i++) {
    const score = sorted[i];
    const isValid = score.total >= threshold;

    if (!isValid) {
      tempStreak = 0;
      continue;
    }

    if (i > 0 && tempStreak > 0) {
      const prev = sorted[i - 1];
      if (prev.total >= threshold) {
        const diffDays = calendarDayDifference(prev.date, score.date);
        if (diffDays > maxGapDays + 1) {
          tempStreak = 0;
        }
      }
    }

    tempStreak += 1;
    if (tempStreak > bestStreak) {
      bestStreak = tempStreak;
    }

    if (i === sorted.length - 1) {
      if (score.date === today || score.date === yesterday) {
        currentStreak = tempStreak;
      } else {
        currentStreak = 0;
      }
    }
  }

  return { currentStreak, bestStreak };
}
