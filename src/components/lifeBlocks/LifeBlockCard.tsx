import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Radius, Typography } from '../../theme';
import { LifeBlock } from '../../types/lifeBlock';

interface LifeBlockCardProps {
  block: LifeBlock;
  progressPercent: number;
  timeSpentMinutes: number;
  onEdit: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onArchive: () => void;
  canMoveUp: boolean;
  canMoveDown: boolean;
}

function formatMinutes(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  if (h > 0 && m > 0) return `${h}h${m}`;
  if (h > 0) return `${h}h`;
  return `${m}min`;
}

export function LifeBlockCard({
  block,
  progressPercent,
  timeSpentMinutes,
  onEdit,
  onMoveUp,
  onMoveDown,
  onArchive,
  canMoveUp,
  canMoveDown,
}: LifeBlockCardProps) {
  const progress = Math.min(progressPercent, 100);

  const handleArchive = () => {
    Alert.alert(
      'Archiver ce bloc ?',
      `${block.emoji} ${block.name} sera masqué mais l'historique sera conservé.`,
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Archiver', style: 'destructive', onPress: onArchive },
      ]
    );
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onEdit}
      activeOpacity={0.8}
    >
      {/* Color stripe */}
      <View style={[styles.colorStripe, { backgroundColor: block.color }]} />

      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.emoji}>{block.emoji}</Text>
          <Text style={styles.name}>{block.name}</Text>
          <View style={styles.spacer} />

          {/* Reorder buttons */}
          <View style={styles.reorderRow}>
            <TouchableOpacity
              style={[styles.reorderBtn, !canMoveUp && styles.reorderBtnDisabled]}
              onPress={onMoveUp}
              disabled={!canMoveUp}
            >
              <Ionicons name="chevron-up" size={16} color={canMoveUp ? Colors.textSecondary : Colors.textTertiary} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.reorderBtn, !canMoveDown && styles.reorderBtnDisabled]}
              onPress={onMoveDown}
              disabled={!canMoveDown}
            >
              <Ionicons name="chevron-down" size={16} color={canMoveDown ? Colors.textSecondary : Colors.textTertiary} />
            </TouchableOpacity>
          </View>

          {/* Archive */}
          <TouchableOpacity style={styles.archiveBtn} onPress={handleArchive}>
            <Ionicons name="archive-outline" size={18} color={Colors.textTertiary} />
          </TouchableOpacity>
        </View>

        {/* Goal + Progress */}
        <View style={styles.goalRow}>
          <Text style={styles.goalText}>
            {formatMinutes(timeSpentMinutes)} / {formatMinutes(block.weeklyGoalMinutes)}
          </Text>
          <Text style={styles.goalPercent}>{Math.round(progress)}%</Text>
        </View>

        {/* Progress bar */}
        <View style={styles.progressBg}>
          <View
            style={[
              styles.progressFill,
              { width: `${progress}%`, backgroundColor: block.color },
            ]}
          />
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: Colors.bgSurface,
    borderRadius: Radius.md,
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
    overflow: 'hidden',
  },
  colorStripe: {
    width: 4,
  },
  content: {
    flex: 1,
    padding: Spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  emoji: {
    fontSize: 20,
  },
  name: {
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.semibold,
    color: Colors.textPrimary,
  },
  spacer: {
    flex: 1,
  },
  reorderRow: {
    flexDirection: 'row',
    gap: 2,
  },
  reorderBtn: {
    padding: Spacing.xs,
  },
  reorderBtnDisabled: {
    opacity: 0.3,
  },
  archiveBtn: {
    padding: Spacing.xs,
    marginLeft: Spacing.xs,
  },
  goalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
  goalText: {
    fontSize: Typography.sizes.sm,
    color: Colors.textSecondary,
  },
  goalPercent: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.semibold,
    color: Colors.textSecondary,
  },
  progressBg: {
    height: 4,
    backgroundColor: Colors.bgInput,
    borderRadius: Radius.full,
    marginTop: Spacing.xs,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: Radius.full,
  },
});
