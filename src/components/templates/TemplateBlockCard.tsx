import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors, Spacing, Radius, Typography } from '../../theme';
import { TemplateBlock } from '../../types/template';
import { LifeBlock } from '../../types/lifeBlock';

interface TemplateBlockCardProps {
  block: TemplateBlock;
  lifeBlock: LifeBlock | undefined;
  onPress: () => void;
}

function timeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

function formatDuration(start: string, end: string): string {
  const min = timeToMinutes(end) - timeToMinutes(start);
  const h = Math.floor(min / 60);
  const m = min % 60;
  if (h > 0 && m > 0) return `${h}h${m}`;
  if (h > 0) return `${h}h`;
  return `${m}min`;
}

export function TemplateBlockCard({ block, lifeBlock, onPress }: TemplateBlockCardProps) {
  return (
    <TouchableOpacity
      style={[
        styles.container,
        { borderLeftColor: lifeBlock?.color || Colors.textTertiary },
      ]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.header}>
        <Text style={styles.emoji}>{lifeBlock?.emoji || '⬜'}</Text>
        <View style={styles.info}>
          <Text style={styles.name}>
            {block.title || lifeBlock?.name || 'Bloc'}
          </Text>
          <Text style={styles.time}>
            {block.startTime} – {block.endTime} · {formatDuration(block.startTime, block.endTime)}
          </Text>
        </View>
        {block.isFlexible && (
          <View style={styles.flexibleBadge}>
            <Text style={styles.flexibleText}>Flex</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.bgSurface,
    borderRadius: Radius.md,
    borderLeftWidth: 3,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  emoji: {
    fontSize: 20,
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.semibold,
    color: Colors.textPrimary,
  },
  time: {
    fontSize: Typography.sizes.sm,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  flexibleBadge: {
    backgroundColor: Colors.accentYellow + '20',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: Radius.sm,
  },
  flexibleText: {
    fontSize: Typography.sizes.xs,
    color: Colors.accentYellow,
    fontWeight: Typography.weights.semibold,
  },
});
