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
import { Task, Priority } from '../../src/types/task';
import { Colors, Spacing, Typography } from '../../src/theme';
import { TaskCard } from '../../src/components/tasks/TaskCard';
import { EmptyState } from '../../src/components/shared/EmptyState';
import { PrioritySelector } from '../../src/components/shared/PrioritySelector';
import { Divider } from '../../src/components/ui/Divider';

export default function TodayScreen() {
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [selectedPriority, setSelectedPriority] = useState<Priority>('medium');

  const tasks = useTaskStore((state) => state.tasks);
  const addTask = useTaskStore((state) => state.addTask);
  const toggleTask = useTaskStore((state) => state.toggleTask);
  const deleteTask = useTaskStore((state) => state.deleteTask);

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
    });
    setNewTaskTitle('');
    setSelectedPriority('medium');
  }, [newTaskTitle, selectedPriority, addTask]);

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

        <Divider indent={Spacing.lg} />

        {/* Input */}
        <View style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              placeholder="Qu'avez-vous à faire ?"
              placeholderTextColor={Colors.textTertiary}
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
            activeOpacity={0.8}
          >
            <Ionicons name="add" size={22} color={Colors.bgPrimary} />
          </TouchableOpacity>
        </View>

        {/* Task List */}
        <FlatList
          data={sortedTasks}
          keyExtractor={(item) => item.id}
          renderItem={renderTask}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <EmptyState
              icon="code-slash-outline"
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
    backgroundColor: Colors.bgPrimary,
  },
  flex: {
    flex: 1,
  },
  header: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  headerTitle: {
    fontSize: Typography.sizes.xxxl,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: Typography.sizes.base,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    gap: Spacing.sm,
  },
  inputWrapper: {
    flex: 1,
  },
  input: {
    fontSize: Typography.sizes.base,
    color: Colors.textPrimary,
    backgroundColor: Colors.bgInput,
    borderRadius: 10,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: Colors.accentCyan,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonDisabled: {
    backgroundColor: Colors.bgInput,
  },
  listContent: {
    paddingBottom: Spacing.xxl,
  },
});
