import { useRef, useMemo } from 'react';
import { View, Text, Pressable, Alert, PanResponder, Animated } from 'react-native';
import { LifeBlock } from '../../types/lifeBlock';
import { hapticWarning } from '../../utils/haptics';
import { useTheme } from '../../theme';
import { Symbol, SymbolNames } from '../ui/Symbol';
import { ContextMenu } from '../ui/ContextMenu';

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
  const { colors, typography } = useTheme();
  const progress = Math.min(progressPercent, 100);
  const CARD_HEIGHT = 130;

  const panY = useRef(new Animated.Value(0)).current;

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dy) > 8,
        onPanResponderMove: (_, g) => {
          panY.setValue(g.dy);
        },
        onPanResponderRelease: (_, g) => {
          Animated.spring(panY, { toValue: 0, useNativeDriver: false }).start();
          const threshold = CARD_HEIGHT / 3;
          if (g.dy < -threshold && canMoveUp) {
            onMoveUp();
          } else if (g.dy > threshold && canMoveDown) {
            onMoveDown();
          }
        },
      }),
    [canMoveUp, canMoveDown, onMoveUp, onMoveDown]
  );

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

  const cardContent = (
    <View
      style={{
        backgroundColor: colors.bg.secondary,
        borderRadius: 13,
        padding: 16,
        marginHorizontal: 16,
        marginBottom: 12,
      }}
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
          <Text style={{ fontSize: typography.sizes.xl }}>{block.emoji}</Text>
        </View>

        <View style={{ flex: 1 }}>
            <Text style={{ fontSize: typography.sizes.lg, fontWeight: typography.weights.semibold, color: colors.text.primary, letterSpacing: -0.41 }}>
            {block.name}
          </Text>
            <Text style={{ fontSize: typography.sizes.sm, color: colors.text.secondary, marginTop: 1 }}>
            {formatMinutes(timeSpentMinutes)} cette semaine
          </Text>
        </View>

        {/* Reorder + Archive */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
          <View {...panResponder.panHandlers} style={{ padding: 6 }}>
            <Symbol name={SymbolNames.menu} size={16} color={colors.text.tertiary} />
          </View>
          <Pressable onPress={handleArchive} hitSlop={6} style={{ padding: 6 }}>
            <Symbol name={SymbolNames.archive} size={16} color={colors.text.tertiary} />
          </Pressable>
        </View>
      </View>

      {/* Progress bar */}
      <View style={{ height: 4, backgroundColor: colors.bg.hover, borderRadius: 2, overflow: 'hidden' }}>
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
        <Text style={{ fontSize: typography.sizes.xs, color: colors.text.quaternary }}>
          {formatMinutes(timeSpentMinutes)}
        </Text>
        <Text style={{ fontSize: typography.sizes.xs, color: colors.text.quaternary }}>
          objectif {formatMinutes(block.weeklyGoalMinutes)}
        </Text>
      </View>
    </View>
  );

  return (
    <ContextMenu
      actions={[
        { title: 'Modifier', systemIcon: 'pencil' },
        { title: 'Monter', systemIcon: 'arrow.up', disabled: !canMoveUp },
        { title: 'Descendre', systemIcon: 'arrow.down', disabled: !canMoveDown },
        { title: 'Archiver', systemIcon: 'archivebox', destructive: true },
      ]}
      onPress={(name) => {
        if (name === 'Modifier') onEdit();
        else if (name === 'Monter') canMoveUp && onMoveUp();
        else if (name === 'Descendre') canMoveDown && onMoveDown();
        else if (name === 'Archiver') handleArchive();
      }}
    >
      {cardContent}
    </ContextMenu>
  );
}
