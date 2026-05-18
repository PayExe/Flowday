import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Radius, Typography } from '../../theme';
import { Project } from '../../types/project';
import { PriorityBadge } from '../shared/PriorityBadge';
import { ProgressBar } from '../shared/ProgressBar';

interface ProjectCardProps {
  project: Project;
  completed: number;
  total: number;
  onDelete: (id: string) => void;
}

export function ProjectCard({ project, completed, total, onDelete }: ProjectCardProps) {
  const progress = total > 0 ? completed / total : 0;

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.identity}>
          <View style={[styles.colorDot, { backgroundColor: project.color }]} />
          <View style={styles.info}>
            <Text style={styles.name}>{project.name}</Text>
            <View style={styles.meta}>
              <PriorityBadge priority={project.priority} />
              <Text style={styles.taskCount}>
                {completed}/{total} tâches
              </Text>
            </View>
          </View>
        </View>

        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => onDelete(project.id)}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="trash-outline" size={18} color={Colors.danger} />
        </TouchableOpacity>
      </View>

      {total > 0 && (
        <View style={styles.progressContainer}>
          <ProgressBar progress={progress} color={project.color} />
          <Text style={styles.progressText}>
            {Math.round(progress * 100)}%
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.gray200,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  identity: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
  },
  colorDot: {
    width: 16,
    height: 16,
    borderRadius: Radius.full,
    marginTop: Spacing.xs,
    marginRight: Spacing.md,
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.semibold,
    color: Colors.black,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.xs,
    gap: Spacing.sm,
  },
  taskCount: {
    fontSize: Typography.sizes.sm,
    color: Colors.gray500,
  },
  deleteButton: {
    padding: Spacing.sm,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.md,
  },
  progressText: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.semibold,
    color: Colors.gray500,
    marginLeft: Spacing.md,
    minWidth: 40,
    textAlign: 'right',
  },
});
