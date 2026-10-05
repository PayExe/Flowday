import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Task } from '../../types/task';
import { useTheme } from '../../theme';
import { useTranslation } from '../../i18n';
import { Checkbox } from '../ui/Checkbox';
import { Card, IconTile, List, SectionHeader } from '../ui/List';
import { Sheet } from '../ui/Sheet';

interface BlockDetailSheetProps {
  title: string;
  timeRange: string;
  color: string;
  emoji?: string;
  tasks: Task[];
  visible: boolean;
  onClose: () => void;
  onToggleTask: (id: string) => void;
}

export function BlockDetailSheet({ title, timeRange, color, emoji, tasks, visible, onClose, onToggleTask }: BlockDetailSheetProps) {
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
});
