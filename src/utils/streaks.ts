import { DayScore } from '../types/dayScore';

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

  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

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
        const prevDate = new Date(prev.date);
        const currDate = new Date(score.date);
        const diffDays = Math.round(
          (currDate.getTime() - prevDate.getTime()) / 86400000
        );
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
