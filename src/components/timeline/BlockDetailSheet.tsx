import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Task } from '../../types/task';
import { useTheme, withAlpha } from '../../theme';
import type { BlockStatus } from '../../types/blockLog';
import { BLOCK_STATUSES, STATUS_META } from './BlockStatusIcon';
import { useTranslation } from '../../i18n';
import { hapticLight } from '../../utils/haptics';
import { Checkbox } from '../ui/Checkbox';
import { Card, IconTile, List, SectionHeader } from '../ui/List';
import { Sheet } from '../ui/Sheet';
import { Symbol, SymbolNames } from '../ui/Symbol';

interface BlockDetailSheetProps {
  title: string;
  timeRange: string;
  color: string;
  emoji?: string;
  tasks: Task[];
  visible: boolean;
  onClose: () => void;
  onToggleTask: (id: string) => void;
  onFocusTask?: (task: Task) => void;
  validation?: {
    status?: BlockStatus;
    /** False for days still ahead: nothing has been lived yet. */
    canValidate: boolean;
    /** null clears the log. */
    onChange: (status: BlockStatus | null) => void;
  };
}

export function BlockDetailSheet({ title, timeRange, color, emoji, tasks, visible, onClose, onToggleTask, onFocusTask, validation }: BlockDetailSheetProps) {
  const { colors, typography } = useTheme();
  const { t } = useTranslation();

  return (
    <Sheet visible={visible} title={t('Bloc')} onClose={onClose}>
      <Card padded>
        <View style={styles.header}>
          <IconTile color={color} emoji={emoji} size={48} />
          <View style={styles.headerText}>
            <Text style={typography.title3}>{title}</Text>
            <Text style={[typography.subheadline, styles.time]}>{timeRange}</Text>
          </View>
        </View>
      </Card>

      {validation && (
        <>
          <SectionHeader title={t('Comment ça s’est passé ?')} />
          {validation.canValidate ? (
            <View style={styles.statuses}>
              {BLOCK_STATUSES.map((status) => {
                const meta = STATUS_META[status];
                const tint = meta.color(colors);
                const selected = validation.status === status;
                return (
                  <Pressable
                    key={status}
                    accessibilityRole="button"
                    accessibilityState={{ selected }}
                    accessibilityLabel={t(meta.label)}
                    onPress={() => {
                      hapticLight();
                      // Tapping the current answer again takes it back.
                      validation.onChange(selected ? null : status);
                    }}
                    style={({ pressed }) => [
                      styles.status,
                      {
                        backgroundColor: selected ? withAlpha(tint, 0.18) : colors.bg.secondary,
                        borderColor: selected ? tint : 'transparent',
                        opacity: pressed ? 0.7 : 1,
                      },
                    ]}
                  >
                    <Symbol
                      name={meta.symbol}
                      size={26}
                      color={selected ? tint : colors.text.tertiary}
                      animationSpec={selected ? { effect: { type: 'bounce', wholeSymbol: true } } : undefined}
                    />
                    <Text
                      style={[
                        typography.subheadline,
                        { color: colors.text.primary, fontWeight: selected ? '600' : '400' },
                      ]}
                    >
                      {t(meta.label)}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          ) : (
            <Card padded>
              <Text style={typography.subheadline}>{t('Tu pourras le valider le jour venu.')}</Text>
            </Card>
          )}
        </>
      )}

      <SectionHeader title={t('Tâches')} />
      {tasks.length === 0 ? (
        <Card padded>
          <Text style={typography.subheadline}>{t('Aucune tâche dans ce bloc.')}</Text>
        </Card>
      ) : (
        <List separatorInset={52}>
          {tasks.map((task) => (
            <Pressable
              key={task.id}
              onPress={() => onToggleTask(task.id)}
              style={({ pressed }) => [
                styles.task,
                { backgroundColor: pressed ? colors.bg.hover : 'transparent' },
              ]}
            >
              <Checkbox
                checked={task.completed}
                onToggle={() => onToggleTask(task.id)}
                accessibilityLabel={task.title}
              />
              <Text
                style={[
                  typography.body,
                  styles.taskTitle,
                  task.completed && { color: colors.text.tertiary, textDecorationLine: 'line-through' },
                ]}
              >
                {task.title}
              </Text>
              {onFocusTask && !task.completed && (
                <Pressable
                  hitSlop={10}
                  accessibilityRole="button"
                  accessibilityLabel={`${t('Démarrer Focus pour')} ${task.title}`}
                  onPress={() => {
                    hapticLight();
                    onFocusTask(task);
                  }}
                >
                  <Symbol name={SymbolNames.timer} size={20} color={colors.accent} />
                </Pressable>
              )}
            </Pressable>
          ))}
        </List>
      )}
    </Sheet>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  headerText: {
    flex: 1,
  },
  time: {
    marginTop: 2,
  },
  task: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minHeight: 52,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  taskTitle: {
    flex: 1,
  },
  statuses: {
    flexDirection: 'row',
    gap: 10,
    marginHorizontal: 16,
  },
  status: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
    paddingVertical: 14,
    borderRadius: 14,
    borderCurve: 'continuous',
    borderWidth: 1.5,
  },
});
