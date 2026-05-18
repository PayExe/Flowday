import { useState } from 'react';
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
import { useTaskStore } from '../../store/taskStore';
import { Priority, Task } from '../../types/task';
import { Colors, Spacing, Radius, Typography } from '../../constants/design';

const PRIORITY_CONFIG = {
  high: { color: Colors.priorityHigh, bg: Colors.dangerLight, label: 'Haute' },
  medium: { color: Colors.priorityMedium, bg: Colors.warningLight, label: 'Moyenne' },
  low: { color: Colors.priorityLow, bg: Colors.successLight, label: 'Basse' },
};

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

  const handleAddTask = () => {
    if (newTaskTitle.trim() === '') return;
    addTask({
      title: newTaskTitle.trim(),
      completed: false,
      priority: selectedPriority,
    });
    setNewTaskTitle('');
    setSelectedPriority('medium');
  };

  const renderTask = ({ item }: { item: Task }) => {
    const priority = PRIORITY_CONFIG[item.priority];
    return (
      <View style={styles.taskCard}>
        <TouchableOpacity
          style={styles.checkbox}
          onPress={() => toggleTask(item.id)}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons
            name={item.completed ? 'checkmark-circle' : 'ellipse-outline'}
            size={24}
            color={item.completed ? Colors.success : Colors.gray400}
          />
        </TouchableOpacity>

        <View style={styles.taskContent}>
          <Text
            style={[
              styles.taskTitle,
              item.completed && styles.taskTitleCompleted,
            ]}
          >
            {item.title}
          </Text>
          <View style={styles.taskMeta}>
            <View style={[styles.priorityBadge, { backgroundColor: priority.bg }]}>
              <View style={[styles.priorityDot, { backgroundColor: priority.color }]} />
              <Text style={[styles.priorityText, { color: priority.color }]}>
                {priority.label}
              </Text>
            </View>
          </View>
        </View>

        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => deleteTask(item.id)}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="trash-outline" size={20} color={Colors.danger} />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Aujourd'hui</Text>
          <Text style={styles.headerSubtitle}>
            {tasks.filter((t) => !t.completed).length} tâche(s) restante(s)
          </Text>
        </View>

        {/* Divider */}
        <View style={styles.divider} />

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

          <View style={styles.prioritySelector}>
            {(['high', 'medium', 'low'] as Priority[]).map((priority) => (
              <TouchableOpacity
                key={priority}
                style={[
                  styles.priorityButton,
                  selectedPriority === priority && {
                    backgroundColor: PRIORITY_CONFIG[priority].bg,
                    borderColor: PRIORITY_CONFIG[priority].color,
                  },
                ]}
                onPress={() => setSelectedPriority(priority)}
              >
                <View
                  style={[
                    styles.prioritySelectorDot,
                    { backgroundColor: PRIORITY_CONFIG[priority].color },
                  ]}
                />
              </TouchableOpacity>
            ))}
          </View>

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

        {/* Task List */}
        <FlatList
          data={sortedTasks}
          keyExtractor={(item) => item.id}
          renderItem={renderTask}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <View style={styles.emptyStateIcon}>
                <Ionicons name="sunny-outline" size={48} color={Colors.gray400} />
              </View>
              <Text style={styles.emptyStateTitle}>
                Pas de tâches pour aujourd'hui
              </Text>
              <Text style={styles.emptyStateSubtitle}>
                Ajoutez votre première tâche ci-dessus
              </Text>
            </View>
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
  keyboardView: {
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
  divider: {
    height: 1,
    backgroundColor: Colors.gray200,
    marginHorizontal: Spacing.xl,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.white,
    marginHorizontal: Spacing.xl,
    marginVertical: Spacing.md,
    borderRadius: Radius.xl,
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
  prioritySelector: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginRight: Spacing.md,
  },
  priorityButton: {
    width: 32,
    height: 32,
    borderRadius: Radius.full,
    borderWidth: 1.5,
    borderColor: Colors.gray300,
    alignItems: 'center',
    justifyContent: 'center',
  },
  prioritySelectorDot: {
    width: 12,
    height: 12,
    borderRadius: Radius.full,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: Radius.full,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonDisabled: {
    backgroundColor: Colors.gray300,
  },
  listContent: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.xxl,
  },
  taskCard: {
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
  taskContent: {
    flex: 1,
  },
  taskTitle: {
    fontSize: Typography.sizes.base,
    color: Colors.black,
    fontWeight: Typography.weights.medium,
    lineHeight: 24,
  },
  taskTitleCompleted: {
    textDecorationLine: 'line-through',
    color: Colors.gray500,
  },
  taskMeta: {
    flexDirection: 'row',
    marginTop: Spacing.xs,
    gap: Spacing.sm,
  },
  priorityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.md,
    gap: Spacing.xs,
  },
  priorityDot: {
    width: 6,
    height: 6,
    borderRadius: Radius.full,
  },
  priorityText: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.semibold,
  },
  deleteButton: {
    padding: Spacing.sm,
    marginLeft: Spacing.sm,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xxxl,
  },
  emptyStateIcon: {
    width: 80,
    height: 80,
    borderRadius: Radius.full,
    backgroundColor: Colors.gray200,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
  },
  emptyStateTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.semibold,
    color: Colors.gray500,
  },
  emptyStateSubtitle: {
    fontSize: Typography.sizes.sm,
    color: Colors.gray500,
    marginTop: Spacing.xs,
  },
});
