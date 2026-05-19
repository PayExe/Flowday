import { View, Text, StyleSheet } from 'react-native';
import { Colors, Spacing, Typography } from '../../theme';

interface DayScoreHeaderProps {
  score: number;
}

function getScoreLabel(score: number): string {
  if (score >= 90) return 'Journée parfaite. 🔥';
  if (score >= 75) return 'Bonne journée.';
  if (score >= 60) return 'Journée correcte.';
  if (score >= 45) return 'Journée mitigée.';
  if (score >= 30) return 'Journée difficile.';
  return 'Ça arrive.';
}

export function DayScoreHeader({ score }: DayScoreHeaderProps) {
  const label = getScoreLabel(score);

  return (
    <View style={styles.container}>
      <Text style={styles.score}>{score}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
  },
  score: {
    fontSize: Typography.sizes.score,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
    letterSpacing: -1,
  },
  label: {
    fontSize: Typography.sizes.lg,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
});
