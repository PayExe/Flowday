import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Radius, Typography } from '../../theme';
import { Task } from '../../types/task';

interface TimelineBlockProps {
  emoji: string;
  name: string;
  title?: string;
  color: string;
  startTime: string;
  endTime: string;
  height: number;
  tasks: Task[];
  isActive: boolean;
  onToggleTask: (taskId: string) => void;
}

export function TimelineBlock({
  emoji,
  name,
  title,
  color,
  startTime,
  endTime,
  height,
  tasks,
  isActive,
  onToggleTask,
}: TimelineBlockProps) {
  const displayTitle = title || name;
  const duration = `${startTime}–${endTime}`;

  return (
    <View
      style={[
        styles.container,
        {
          height,
          backgroundColor: color + '22',
          borderLeftColor: color,
          borderLeftWidth: 3,
        },
        isActive && styles.active,
      ]}
    >
      <View style={styles.header}>
        <Text style={styles.emoji}>{emoji}</Text>
        <View style={styles.headerText}>
          <Text style={[styles.name, { color }]}>{displayTitle}</Text>
          <Text style={styles.duration}>{duration}</Text>
        </View>
      </View>

      {tasks.length > 0 && (
        <View style={styles.tasks}>
          {tasks.map((task) => (
            <TouchableOpacity
              key={task.id}
              style={styles.taskRow}
              onPress={() => onToggleTask(task.id)}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.taskCheckbox,
                  task.completed && { backgroundColor: color, borderColor: color },
                ]}
              >
                {task.completed && (
                  <Ionicons name="checkmark" size={10} color={Colors.bgPrimary} />
                )}
              </View>
              <Text
                style={[
                  styles.taskTitle,
                  task.completed && styles.taskCompleted,
                ]}
                numberOfLines={1}
              >
                {task.title}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginLeft: 56,
    marginRight: 16,
    borderRadius: Radius.md,
    padding: Spacing.md,
    justifyContent: 'flex-start',
  },
  active: {
    backgroundColor: Colors.bgBlockActive + '88',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  emoji: {
    fontSize: 16,
  },
  headerText: {
    flex: 1,
  },
  name: {
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.semibold,
  },
  duration: {
    fontSize: Typography.sizes.xs,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  tasks: {
    marginTop: Spacing.sm,
    gap: Spacing.xs,
  },
  taskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  taskCheckbox: {
    width: 16,
    height: 16,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: Colors.textTertiary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  taskTitle: {
    fontSize: Typography.sizes.sm,
    color: Colors.textSecondary,
    flex: 1,
  },
  taskCompleted: {
    textDecorationLine: 'line-through',
    color: Colors.textTertiary,
  },
});
