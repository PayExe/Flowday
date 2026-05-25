import { DayScore } from '../types/dayScore';

export interface StreakResult {
  currentStreak: number;
  bestStreak: number;
}

/**
 * Calcule les streaks à partir de l'historique des scores.
 * Un streak est une séquence de jours consécutifs avec un score >= threshold.
 */
export function calculateStreaks(
  scores: DayScore[],
  threshold = 60
): StreakResult {
  if (scores.length === 0) {
    return { currentStreak: 0, bestStreak: 0 };
  }

  // Trier par date croissante
  const sorted = [...scores].sort((a, b) => a.date.localeCompare(b.date));

  let currentStreak = 0;
  let bestStreak = 0;
  let tempStreak = 0;

  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

  for (let i = 0; i < sorted.length; i++) {
    const score = sorted[i];
    const isValid = score.total >= threshold;

    if (isValid) {
      tempStreak += 1;
      if (tempStreak > bestStreak) {
        bestStreak = tempStreak;
      }
    } else {
      tempStreak = 0;
    }

    // Déterminer si c'est le streak actuel (le dernier streak en date)
    if (i === sorted.length - 1) {
      if (isValid && (score.date === today || score.date === yesterday)) {
        currentStreak = tempStreak;
      } else if (!isValid) {
        currentStreak = 0;
      } else {
        // Dernier score valide mais pas aujourd'hui ni hier
        currentStreak = 0;
      }
    }
  }

  return { currentStreak, bestStreak };
}
