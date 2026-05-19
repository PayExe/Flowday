import { View, Text, Pressable, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LifeBlock } from '../../types/lifeBlock';
import { hapticWarning } from '../../utils/haptics';

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
    hapticWarning();
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
    <Pressable
      onPress={onEdit}
      style={({ pressed }) => ({
        backgroundColor: pressed ? '#2C2C2E' : '#1C1C1E',
        borderRadius: 13,
        padding: 16,
        marginHorizontal: 16,
        marginBottom: 12,
      })}
    >
      {/* Header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 14 }}>
        {/* Icône colorée */}
        <View
          style={{
            width: 40,
            height: 40,
            borderRadius: 10,
            backgroundColor: block.color,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text style={{ fontSize: 20 }}>{block.emoji}</Text>
        </View>

        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 17, fontWeight: '600', color: '#FFFFFF', letterSpacing: -0.41 }}>
            {block.name}
          </Text>
          <Text style={{ fontSize: 13, color: '#EBEBF599', marginTop: 1 }}>
            {formatMinutes(timeSpentMinutes)} cette semaine
          </Text>
        </View>

        {/* Reorder + Archive */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
          <Pressable
            onPress={onMoveUp}
            disabled={!canMoveUp}
            hitSlop={6}
            style={{ padding: 6, opacity: canMoveUp ? 1 : 0.2 }}
          >
            <Ionicons name="chevron-up" size={16} color="#EBEBF599" />
          </Pressable>
          <Pressable
            onPress={onMoveDown}
            disabled={!canMoveDown}
            hitSlop={6}
            style={{ padding: 6, opacity: canMoveDown ? 1 : 0.2 }}
          >
            <Ionicons name="chevron-down" size={16} color="#EBEBF599" />
          </Pressable>
          <Pressable onPress={handleArchive} hitSlop={6} style={{ padding: 6 }}>
            <Ionicons name="archive-outline" size={16} color="#EBEBF54D" />
          </Pressable>
        </View>
      </View>

      {/* Progress bar */}
      <View style={{ height: 4, backgroundColor: '#2C2C2E', borderRadius: 2, overflow: 'hidden' }}>
        <View
          style={{
            height: '100%',
            width: `${progress}%`,
            backgroundColor: block.color,
            borderRadius: 2,
          }}
        />
      </View>

      {/* Footer */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 }}>
        <Text style={{ fontSize: 12, color: '#EBEBF54D' }}>
          {formatMinutes(timeSpentMinutes)}
        </Text>
        <Text style={{ fontSize: 12, color: '#EBEBF54D' }}>
          objectif {formatMinutes(block.weeklyGoalMinutes)}
        </Text>
      </View>
    </Pressable>
  );
}
