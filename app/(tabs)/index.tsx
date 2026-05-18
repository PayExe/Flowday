import { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTaskStore } from '../../src/features/tasks/store';
import { useProjectStore } from '../../src/features/projects/store';
import { Task, Priority } from '../../src/types/task';
import { Colors, Spacing, Typography } from '../../src/theme';
import { TaskCard } from '../../src/components/tasks/TaskCard';
import { EmptyState } from '../../src/components/shared/EmptyState';
import { PrioritySelector } from '../../src/components/shared/PrioritySelector';
import { Divider } from '../../src/components/ui/Divider';

export default function TodayScreen() {
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [selectedPriority, setSelectedPriority] = useState<Priority>('medium');
  const [selectedProjectId, setSelectedProjectId] = useState<string | undefined>(undefined);

  const tasks = useTaskStore((state) => state.tasks);
  const addTask = useTaskStore((state) => state.addTask);
  const toggleTask = useTaskStore((state) => state.toggleTask);
  const deleteTask = useTaskStore((state) => state.deleteTask);
  const projects = useProjectStore((state) => state.projects);

  const sortedTasks = [...tasks].sort((a, b) => {
    if (a.completed !== b.completed) return a.completed ? 1 : -1;
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });

  const handleAddTask = useCallback(() => {
    if (newTaskTitle.trim() === '') return;
    addTask({
      title: newTaskTitle.trim(),
      completed: false,
      priority: selectedPriority,
      projectId: selectedProjectId,
    });
    setNewTaskTitle('');
    setSelectedPriority('medium');
    setSelectedProjectId(undefined);
  }, [newTaskTitle, selectedPriority, selectedProjectId, addTask]);

  const renderTask = useCallback(
    ({ item }: { item: Task }) => (
      <TaskCard task={item} onToggle={toggleTask} onDelete={deleteTask} />
    ),
    [toggleTask, deleteTask]
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Aujourd'hui</Text>
          <Text style={styles.headerSubtitle}>
            {tasks.filter((t) => !t.completed).length} tâche(s) restante(s)
          </Text>
        </View>

        <Divider />

        {/* Input */}
        <View style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              placeholder="Qu'avez-vous à faire ?"
              placeholderTextColor={Colors.gray500}
              value={newTaskTitle}
              onChangeText={setNewTaskTitle}
              onSubmitEditing={handleAddTask}
              returnKeyType="done"
            />
          </View>

          <PrioritySelector
            selected={selectedPriority}
            onSelect={setSelectedPriority}
          />

          <TouchableOpacity
            style={[
              styles.addButton,
              !newTaskTitle.trim() && styles.addButtonDisabled,
            ]}
            onPress={handleAddTask}
            disabled={!newTaskTitle.trim()}
          >
            <Ionicons name="add" size={22} color={Colors.white} />
          </TouchableOpacity>
        </View>

        {/* Project Selector */}
        {projects.length > 0 && (
          <View style={styles.projectSelector}>
            <Text style={styles.projectSelectorLabel}>Projet</Text>
            <View style={styles.projectList}>
              <TouchableOpacity
                style={[
                  styles.projectChip,
                  !selectedProjectId && styles.projectChipSelected,
                ]}
                onPress={() => setSelectedProjectId(undefined)}
              >
                <Text
                  style={[
                    styles.projectChipText,
                    !selectedProjectId && styles.projectChipTextSelected,
                  ]}
                >
                  Aucun
                </Text>
              </TouchableOpacity>
              {projects.map((project) => (
                <TouchableOpacity
                  key={project.id}
                  style={[
                    styles.projectChip,
                    selectedProjectId === project.id && {
                      backgroundColor: project.color + '20',
                      borderColor: project.color,
                    },
                  ]}
                  onPress={() =>
                    setSelectedProjectId(
                      selectedProjectId === project.id ? undefined : project.id
                    )
                  }
                >
                  <View
                    style={[
                      styles.projectChipDot,
                      { backgroundColor: project.color },
                    ]}
                  />
                  <Text
                    style={[
                      styles.projectChipText,
                      selectedProjectId === project.id && { color: project.color },
                    ]}
                  >
                    {project.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Task List */}
        <FlatList
          data={sortedTasks}
          keyExtractor={(item) => item.id}
          renderItem={renderTask}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <EmptyState
              icon="sunny-outline"
              title="Pas de tâches pour aujourd'hui"
              subtitle="Ajoutez votre première tâche ci-dessus"
            />
          }
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.gray100,
  },
  flex: {
    flex: 1,
  },
  header: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.md,
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
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.white,
    marginHorizontal: Spacing.xl,
    marginVertical: Spacing.md,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.gray200,
  },
  inputWrapper: {
    flex: 1,
  },
  input: {
    fontSize: Typography.sizes.base,
    color: Colors.black,
    paddingVertical: Spacing.sm,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 999,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: Spacing.md,
  },
  addButtonDisabled: {
    backgroundColor: Colors.gray300,
  },
  projectSelector: {
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing.md,
  },
  projectSelectorLabel: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.semibold,
    color: Colors.gray500,
    marginBottom: Spacing.sm,
  },
  projectList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  projectChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: Colors.gray200,
    backgroundColor: Colors.white,
    gap: Spacing.xs,
  },
  projectChipSelected: {
    backgroundColor: Colors.gray200,
    borderColor: Colors.gray400,
  },
  projectChipText: {
    fontSize: Typography.sizes.sm,
    color: Colors.gray500,
  },
  projectChipTextSelected: {
    color: Colors.black,
    fontWeight: Typography.weights.medium,
  },
  projectChipDot: {
    width: 8,
    height: 8,
    borderRadius: 999,
  },
  listContent: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.xxl,
  },
});
