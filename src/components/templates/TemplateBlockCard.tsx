import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
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
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 11,
        backgroundColor: pressed ? '#2C2C2E' : 'transparent',
        minHeight: 44,
      })}
    >
      {/* Icône avec fond coloré */}
      <View
        style={{
          width: 29,
          height: 29,
          borderRadius: 7,
          backgroundColor: lifeBlock?.color || '#8E8E93',
          alignItems: 'center',
          justifyContent: 'center',
          marginRight: 12,
        }}
      >
        <Text style={{ fontSize: 14 }}>{lifeBlock?.emoji || '⬜'}</Text>
      </View>

      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 17, color: '#FFFFFF', letterSpacing: -0.41 }}>
          {block.title || lifeBlock?.name || 'Bloc'}
        </Text>
        <Text style={{ fontSize: 13, color: '#EBEBF599', marginTop: 1 }}>
          {block.startTime} – {block.endTime} · {formatDuration(block.startTime, block.endTime)}
        </Text>
      </View>

      {block.isFlexible && (
        <Text style={{ fontSize: 12, color: '#EBEBF54D', marginRight: 4 }}>Flex</Text>
      )}
      <Ionicons name="chevron-forward" size={14} color="#EBEBF54D" />
    </Pressable>
  );
}
