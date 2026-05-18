import { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useProjectStore } from '../../../src/features/projects/store';
import { useTaskStore } from '../../../src/features/tasks/store';
import { Project } from '../../../src/types/project';
import { Priority } from '../../../src/types/task';
import { Colors, Spacing, Typography } from '../../../src/theme';
import { ProjectCard } from '../../../src/components/projects/ProjectCard';
import { CreateProjectModal } from '../../../src/components/projects/CreateProjectModal';
import { EmptyState } from '../../../src/components/shared/EmptyState';
import { Divider } from '../../../src/components/ui/Divider';

export default function ProjectsScreen() {
  const [modalVisible, setModalVisible] = useState(false);

  const projects = useProjectStore((state) => state.projects);
  const addProject = useProjectStore((state) => state.addProject);
  const deleteProject = useProjectStore((state) => state.deleteProject);
  const tasks = useTaskStore((state) => state.tasks);

  const getProjectStats = useCallback(
    (projectId: string) => {
      const projectTasks = tasks.filter((t) => t.projectId === projectId);
      return {
        completed: projectTasks.filter((t) => t.completed).length,
        total: projectTasks.length,
      };
    },
    [tasks]
  );

  const handleCreate = useCallback(
    (name: string, color: string, priority: Priority) => {
      addProject({ name, color, priority });
    },
    [addProject]
  );

  const renderProject = useCallback(
    ({ item }: { item: Project }) => {
      const stats = getProjectStats(item.id);
      return (
        <ProjectCard
          project={item}
          completed={stats.completed}
          total={stats.total}
          onDelete={deleteProject}
        />
      );
    },
    [getProjectStats, deleteProject]
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.headerTitle}>Projets</Text>
            <Text style={styles.headerSubtitle}>
              {projects.length} projet{projects.length !== 1 ? 's' : ''}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setModalVisible(true)}
          >
            <Ionicons name="add" size={22} color={Colors.white} />
          </TouchableOpacity>
        </View>
      </View>

      <Divider />

      {/* Projects List */}
      <FlatList
        data={projects}
        keyExtractor={(item) => item.id}
        renderItem={renderProject}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <EmptyState
            icon="folder-open-outline"
            title="Aucun projet"
            subtitle="Créez votre premier projet pour organiser vos tâches"
          />
        }
      />

      {/* Create Project Modal */}
      <CreateProjectModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onCreate={handleCreate}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.gray100,
  },
  header: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.md,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: Typography.sizes.xxxl,
    fontWeight: Typography.weights.bold,
    color: Colors.black,
  },
  headerSubtitle: {
    fontSize: Typography.sizes.base,
    color: Colors.gray500,
    marginTop: Spacing.xs,
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 999,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContent: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.xxl,
  },
});
