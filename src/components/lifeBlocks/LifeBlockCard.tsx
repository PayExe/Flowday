import { View, Text, Pressable, Alert } from 'react-native';
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
    <Pressable
      onPress={onEdit}
      style={{
        backgroundColor: colors.bg.secondary,
        borderRadius: 13,
        padding: 16,
        marginHorizontal: 16,
        marginBottom: 12,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 14 }}>
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

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
          <Pressable
            onPress={canMoveUp ? (event) => { event.stopPropagation(); onMoveUp(); } : undefined}
            disabled={!canMoveUp}
            hitSlop={6}
            style={[styles.iconBtn, !canMoveUp && styles.iconBtnDisabled]}
          >
            <Symbol name={SymbolNames.chevronUp} size={16} color={colors.text.tertiary} />
          </Pressable>
          <Pressable
            onPress={canMoveDown ? (event) => { event.stopPropagation(); onMoveDown(); } : undefined}
            disabled={!canMoveDown}
            hitSlop={6}
            style={[styles.iconBtn, !canMoveDown && styles.iconBtnDisabled]}
          >
            <Symbol name={SymbolNames.chevronDown} size={16} color={colors.text.tertiary} />
          </Pressable>
          <Pressable onPress={(event) => { event.stopPropagation(); handleArchive(); }} hitSlop={6} style={styles.iconBtn}>
            <Symbol name={SymbolNames.archive} size={16} color={colors.text.tertiary} />
          </Pressable>
        </View>
      </View>

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

      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 }}>
        <Text style={{ fontSize: typography.sizes.xs, color: colors.text.quaternary }}>
          {formatMinutes(timeSpentMinutes)}
        </Text>
        <Text style={{ fontSize: typography.sizes.xs, color: colors.text.quaternary }}>
          objectif {formatMinutes(block.weeklyGoalMinutes)}
        </Text>
      </View>
    </Pressable>
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

const styles = {
  iconBtn: {
    padding: 6,
  },
  iconBtnDisabled: {
    opacity: 0.3,
  },
};
