import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Radius, Typography } from '../../theme';
import { Task } from '../../types/task';
import { useProjectStore } from '../../features/projects/store';
import { PriorityBadge } from '../shared/PriorityBadge';

interface TaskCardProps {
  task: Task;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

export function TaskCard({ task, onToggle, onDelete }: TaskCardProps) {
  const projects = useProjectStore((state) => state.projects);
  const project = task.projectId
    ? projects.find((p) => p.id === task.projectId)
    : null;

  return (
    <View style={styles.card}>
      <TouchableOpacity
        style={styles.checkbox}
        onPress={() => onToggle(task.id)}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Ionicons
          name={task.completed ? 'checkmark-circle' : 'ellipse-outline'}
          size={24}
          color={task.completed ? Colors.success : Colors.gray400}
        />
      </TouchableOpacity>

      <View style={styles.content}>
        <Text
          style={[
            styles.title,
            task.completed && styles.titleCompleted,
          ]}
        >
          {task.title}
        </Text>
        <View style={styles.meta}>
          <PriorityBadge priority={task.priority} />
          {project && (
            <View style={[styles.projectBadge, { backgroundColor: project.color + '20' }]}>
              <View style={[styles.projectDot, { backgroundColor: project.color }]} />
              <Text style={[styles.projectText, { color: project.color }]}>
                {project.name}
              </Text>
            </View>
          )}
        </View>
      </View>

      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => onDelete(task.id)}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Ionicons name="trash-outline" size={20} color={Colors.danger} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    padding: Spacing.lg,
    borderRadius: Radius.xl,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.gray200,
  },
  checkbox: {
    marginRight: Spacing.md,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: Typography.sizes.base,
    color: Colors.black,
    fontWeight: Typography.weights.medium,
    lineHeight: 24,
  },
  titleCompleted: {
    textDecorationLine: 'line-through',
    color: Colors.gray500,
  },
  meta: {
    flexDirection: 'row',
    marginTop: Spacing.xs,
    gap: Spacing.sm,
  },
  projectBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.md,
    gap: Spacing.xs,
  },
  projectDot: {
    width: 6,
    height: 6,
    borderRadius: Radius.full,
  },
  projectText: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.semibold,
  },
  deleteButton: {
    padding: Spacing.sm,
    marginLeft: Spacing.sm,
  },
});
