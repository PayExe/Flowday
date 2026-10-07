import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Task } from '../../types/task';
import { useTheme } from '../../theme';
import { useTranslation } from '../../i18n';
import { offerTaskUndo } from '../../features/tasks/undo';
import { hapticLight, hapticWarning } from '../../utils/haptics';
import { calendarDayDifference, dateKey } from '../../utils/dates';
import { Card } from '../ui/List';

interface OverdueTasksProps {
  tasks: Task[];
  onReschedule: (id: string, date: string) => void;
  onDelete: (id: string) => void;
}

/**
 * Overdue tasks used to exist only in the store: nothing in the app ever read
 * `getOverdueTasks`, so a task pushed to a past day became invisible forever.
 */
export function OverdueTasks({ tasks, onReschedule, onDelete }: OverdueTasksProps) {
  const { colors, typography } = useTheme();
  const { t } = useTranslation();

  const today = dateKey();
  const tomorrow = (() => {
    const date = new Date();
    date.setDate(date.getDate() + 1);
    return dateKey(date);
  })();

  if (tasks.length === 0) return null;

  return (
    <View style={styles.list}>
      {tasks.map((task) => {
        const lateBy = Math.abs(calendarDayDifference(today, task.scheduledDate ?? today));

        return (
          <Card key={task.id} padded>
            <Text style={typography.headline} numberOfLines={2}>
              {task.title}
            </Text>
            <Text style={[typography.footnote, styles.late, { color: colors.system.orange }]}>
              {t('lateByDays', { count: lateBy })}
            </Text>

            <View style={styles.actions}>
              {[
                { label: t('Aujourd’hui'), onPress: () => onReschedule(task.id, today) },
                { label: t('Demain'), onPress: () => onReschedule(task.id, tomorrow) },
              ].map((action) => (
                <Pressable
                  key={action.label}
                  accessibilityRole="button"
                  accessibilityLabel={`${task.title} — ${action.label}`}
                  onPress={() => {
                    hapticLight();
                    action.onPress();
                  }}
                  style={({ pressed }) => [
                    styles.action,
                    { backgroundColor: pressed ? colors.bg.hover : colors.bg.tertiary },
                  ]}
                >
                  <Text style={[typography.footnote, styles.actionLabel, { color: colors.accent }]}>
                    {action.label}
                  </Text>
                </Pressable>
              ))}
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`${task.title} — ${t('Supprimer')}`}
                onPress={() => {
                  hapticWarning();
                  onDelete(task.id);
                  offerTaskUndo(task, t);
                }}
                style={({ pressed }) => [
                  styles.action,
                  { backgroundColor: pressed ? colors.bg.hover : colors.bg.tertiary },
                ]}
              >
                <Text style={[typography.footnote, styles.actionLabel, { color: colors.system.red }]}>
                  {t('Supprimer')}
                </Text>
              </Pressable>
            </View>
          </Card>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: 10,
  },
  late: {
    marginTop: 2,
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  action: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 14,
    borderCurve: 'continuous',
  },
  actionLabel: {
    fontWeight: '600',
  },
});
