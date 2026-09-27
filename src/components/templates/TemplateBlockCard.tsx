import { View, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { TemplateBlock } from '../../types/template';
import { LifeBlock } from '../../types/lifeBlock';
import { useTheme } from '../../theme';

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
  const { colors, typography } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 11,
        backgroundColor: pressed ? colors.bg.hover : 'transparent',
        minHeight: 44,
      })}
    >
      <View
        style={{
          width: 29,
          height: 29,
          borderRadius: 7,
          backgroundColor: lifeBlock?.color || colors.system.gray,
          alignItems: 'center',
          justifyContent: 'center',
          marginRight: 12,
        }}
      >
        <Text style={{ fontSize: typography.sizes.base }}>{lifeBlock?.emoji || '⬜'}</Text>
      </View>

      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: typography.sizes.lg, color: colors.text.primary, letterSpacing: -0.41 }}>
          {block.title || lifeBlock?.name || 'Bloc'}
        </Text>
        <Text style={{ fontSize: typography.sizes.sm, color: colors.text.secondary, marginTop: 1 }}>
          {block.startTime} – {block.endTime} · {formatDuration(block.startTime, block.endTime)}
        </Text>
      </View>

      {block.isFlexible && (
        <Text style={{ fontSize: typography.sizes.xs, color: colors.text.quaternary, marginRight: 4 }}>Flex</Text>
      )}
      <Ionicons name="chevron-forward" size={14} color={colors.text.quaternary} />
    </Pressable>
  );
}
