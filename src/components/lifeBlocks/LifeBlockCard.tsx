import { View, Text, Pressable, Alert, StyleSheet } from 'react-native';
import { LifeBlock } from '../../types/lifeBlock';
import { hapticLight, hapticWarning } from '../../utils/haptics';
import { useTheme } from '../../theme';
import { Symbol, SymbolNames } from '../ui/Symbol';
import { useActionMenu, type ContextMenuAction } from '../ui/ContextMenu';
import { Card, IconTile, ProgressBar } from '../ui/List';
import { useTranslation } from '../../i18n';
import { formatDuration } from '../../utils/time';

interface LifeBlockCardProps {
  block: LifeBlock;
  progressPercent: number;
  livedMinutes: number;
  plannedMinutes: number;
  onEdit: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onArchive: () => void;
  canMoveUp: boolean;
  canMoveDown: boolean;
}

export function LifeBlockCard({
  block,
  progressPercent,
  livedMinutes,
  plannedMinutes,
  onEdit,
  onMoveUp,
  onMoveDown,
  onArchive,
  canMoveUp,
  canMoveDown,
}: LifeBlockCardProps) {
  const { colors, typography } = useTheme();
  const { t } = useTranslation();
  const openMenu = useActionMenu();
  const hasGoal = block.weeklyGoalMinutes > 0;
  const hasTarget = hasGoal || plannedMinutes > 0;

  const handleArchive = () => {
    hapticWarning();
    Alert.alert(
      t('Archiver ce bloc ?'),
      `${block.emoji} ${block.name} ${t('sera masqué mais l\'historique sera conservé.')}`,
      [
        { text: t('Annuler'), style: 'cancel' },
        { text: t('Archiver'), style: 'destructive', onPress: onArchive },
      ]
    );
  };

  const actions: ContextMenuAction[] = [
    { id: 'edit', title: t('Modifier'), systemIcon: 'pencil' },
    { id: 'up', title: t('Monter'), systemIcon: 'arrow.up', disabled: !canMoveUp },
    { id: 'down', title: t('Descendre'), systemIcon: 'arrow.down', disabled: !canMoveDown },
    { id: 'archive', title: t('Archiver'), systemIcon: 'archivebox', destructive: true },
  ];

  const showMenu = () => {
    hapticLight();
    openMenu(actions, (id) => {
      if (id === 'edit') onEdit();
      else if (id === 'up') onMoveUp();
      else if (id === 'down') onMoveDown();
      else if (id === 'archive') handleArchive();
    });
  };

  return (
    <Card style={styles.card}>
      <Pressable
        onPress={onEdit}
        onLongPress={showMenu}
        accessibilityRole="button"
        accessibilityLabel={`${t('Modifier')} ${block.name}`}
        style={({ pressed }) => [
          styles.content,
          { backgroundColor: pressed ? colors.bg.hover : 'transparent' },
        ]}
      >
        <View style={styles.header}>
          <IconTile color={block.color} emoji={block.emoji} size={44} />

          <View style={styles.headerText}>
            <Text style={typography.headline} numberOfLines={1}>
              {block.name}
            </Text>
            <Text style={[typography.footnote, styles.subtitle]}>
              {hasGoal
                ? t('livedOfGoal', {
                    lived: formatDuration(livedMinutes),
                    goal: formatDuration(block.weeklyGoalMinutes),
                    planned: formatDuration(plannedMinutes),
                  })
                : plannedMinutes > 0
                  ? t('livedOfPlanned', {
                      lived: formatDuration(livedMinutes),
                      planned: formatDuration(plannedMinutes),
                    })
                  : t('Rien de prévu cette semaine')}
            </Text>
          </View>

          <View style={styles.moreSpacer} />
        </View>

        {hasTarget && <ProgressBar value={progressPercent} color={block.color} />}
      </Pressable>

      <Pressable
        onPress={showMenu}
        hitSlop={10}
        accessibilityRole="button"
        accessibilityLabel={`${t('Actions')} ${block.name}`}
        style={[styles.more, { backgroundColor: colors.bg.tertiary }]}
      >
        <Symbol name={SymbolNames.more} size={16} weight="semibold" color={colors.text.secondary} />
      </Pressable>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 12,
  },
  content: {
    padding: 16,
    gap: 14,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerText: {
    flex: 1,
  },
  subtitle: {
    marginTop: 2,
  },
  moreSpacer: {
    width: 30,
  },
  more: {
    position: 'absolute',
    top: 23,
    right: 16,
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
