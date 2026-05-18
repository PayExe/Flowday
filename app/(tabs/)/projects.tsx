import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Modal,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useProjectStore } from '../../store/projectStore';
import { useTaskStore } from '../../store/taskStore';
import { Project } from '../../types/project';
import { Priority } from '../../types/task';
import { Colors, Spacing, Radius, Typography } from '../../constants/design';

const PROJECT_COLORS = [
  '#1D9BF0', // Blue
  '#00BA7C', // Green
  '#FFAD1F', // Yellow
  '#F4212E', // Red
  '#7856FF', // Purple
  '#FF6B00', // Orange
  '#E91E8C', // Pink
  '#17BF63', // Teal
];

const PRIORITY_CONFIG = {
  high: { color: Colors.priorityHigh, bg: Colors.dangerLight, label: 'Haute' },
  medium: { color: Colors.priorityMedium, bg: Colors.warningLight, label: 'Moyenne' },
  low: { color: Colors.priorityLow, bg: Colors.successLight, label: 'Basse' },
};

export default function ProjectsScreen() {
  const [modalVisible, setModalVisible] = useState(false);
  const [projectName, setProjectName] = useState('');
  const [selectedColor, setSelectedColor] = useState(PROJECT_COLORS[0]);
  const [selectedPriority, setSelectedPriority] = useState<Priority>('medium');

  const projects = useProjectStore((state) => state.projects);
  const addProject = useProjectStore((state) => state.addProject);
  const deleteProject = useProjectStore((state) => state.deleteProject);

  const tasks = useTaskStore((state) => state.tasks);

  const getProjectStats = (projectId: string) => {
    const projectTasks = tasks.filter((t) => t.projectId === projectId);
    const completed = projectTasks.filter((t) => t.completed).length;
    const total = projectTasks.length;
    const progress = total > 0 ? completed / total : 0;
    return { completed, total, progress };
  };

  const handleCreateProject = () => {
    if (projectName.trim() === '') return;
    addProject({
      name: projectName.trim(),
      color: selectedColor,
      priority: selectedPriority,
    });
    setProjectName('');
    setSelectedColor(PROJECT_COLORS[0]);
    setSelectedPriority('medium');
    setModalVisible(false);
  };

  const renderProject = ({ item }: { item: Project }) => {
    const stats = getProjectStats(item.id);
    const priority = PRIORITY_CONFIG[item.priority];

    return (
      <View style={styles.projectCard}>
        <View style={styles.projectHeader}>
          <View style={styles.projectIdentity}>
            <View
              style={[styles.colorDot, { backgroundColor: item.color }]}
            />
            <View style={styles.projectInfo}>
              <Text style={styles.projectName}>{item.name}</Text>
              <View style={styles.projectMeta}>
                <View
                  style={[
                    styles.priorityBadge,
                    { backgroundColor: priority.bg },
                  ]}
                >
                  <Text
                    style={[styles.priorityText, { color: priority.color }]}
                  >
                    {priority.label}
                  </Text>
                </View>
                <Text style={styles.taskCount}>
                  {stats.completed}/{stats.total} tâches
                </Text>
              </View>
            </View>
          </View>

          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => deleteProject(item.id)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="trash-outline" size={18} color={Colors.danger} />
          </TouchableOpacity>
        </View>

        {/* Progress Bar */}
        {stats.total > 0 && (
          <View style={styles.progressContainer}>
            <View style={styles.progressBackground}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${stats.progress * 100}%`,
                    backgroundColor: item.color,
                  },
                ]}
              />
            </View>
            <Text style={styles.progressText}>
              {Math.round(stats.progress * 100)}%
            </Text>
          </View>
        )}
      </View>
    );
  };

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
            style={styles.addProjectButton}
            onPress={() => setModalVisible(true)}
          >
            <Ionicons name="add" size={22} color={Colors.white} />
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.divider} />

      {/* Projects List */}
      <FlatList
        data={projects}
        keyExtractor={(item) => item.id}
        renderItem={renderProject}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <View style={styles.emptyStateIcon}>
              <Ionicons
                name="folder-open-outline"
                size={48}
                color={Colors.gray400}
              />
            </View>
            <Text style={styles.emptyStateTitle}>Aucun projet</Text>
            <Text style={styles.emptyStateSubtitle}>
              Créez votre premier projet pour organiser vos tâches
            </Text>
          </View>
        }
      />

      {/* Create Project Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setModalVisible(false)}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Nouveau projet</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color={Colors.gray500} />
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.modalInput}
              placeholder="Nom du projet"
              placeholderTextColor={Colors.gray500}
              value={projectName}
              onChangeText={setProjectName}
              autoFocus
            />

            <Text style={styles.modalLabel}>Couleur</Text>
            <View style={styles.colorPicker}>
              {PROJECT_COLORS.map((color) => (
                <TouchableOpacity
                  key={color}
                  style={[
                    styles.colorOption,
                    { backgroundColor: color },
                    selectedColor === color && styles.colorOptionSelected,
                  ]}
                  onPress={() => setSelectedColor(color)}
                >
                  {selectedColor === color && (
                    <Ionicons name="checkmark" size={16} color={Colors.white} />
                  )}
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.modalLabel}>Priorité</Text>
            <View style={styles.priorityPicker}>
              {(['high', 'medium', 'low'] as Priority[]).map((priority) => (
                <TouchableOpacity
                  key={priority}
                  style={[
                    styles.priorityOption,
                    selectedPriority === priority && {
                      backgroundColor: PRIORITY_CONFIG[priority].bg,
                      borderColor: PRIORITY_CONFIG[priority].color,
                    },
                  ]}
                  onPress={() => setSelectedPriority(priority)}
                >
                  <View
                    style={[
                      styles.priorityOptionDot,
                      { backgroundColor: PRIORITY_CONFIG[priority].color },
                    ]}
                  />
                  <Text
                    style={[
                      styles.priorityOptionText,
                      selectedPriority === priority && {
                        color: PRIORITY_CONFIG[priority].color,
                        fontWeight: Typography.weights.semibold,
                      },
                    ]}
                  >
                    {PRIORITY_CONFIG[priority].label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              style={[
                styles.createButton,
                !projectName.trim() && styles.createButtonDisabled,
              ]}
              onPress={handleCreateProject}
              disabled={!projectName.trim()}
            >
              <Text style={styles.createButtonText}>Créer le projet</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>
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
  addProjectButton: {
    width: 44,
    height: 44,
    borderRadius: Radius.full,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: Colors.gray200,
    marginHorizontal: Spacing.xl,
  },
  listContent: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.xxl,
  },
  projectCard: {
    backgroundColor: Colors.white,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.gray200,
  },
  projectHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  projectIdentity: {
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
  projectInfo: {
    flex: 1,
  },
  projectName: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.semibold,
    color: Colors.black,
  },
  projectMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.xs,
    gap: Spacing.sm,
  },
  priorityBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.md,
  },
  priorityText: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.semibold,
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
  progressBackground: {
    flex: 1,
    height: 6,
    backgroundColor: Colors.gray200,
    borderRadius: Radius.full,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: Radius.full,
  },
  progressText: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.semibold,
    color: Colors.gray500,
    marginLeft: Spacing.md,
    minWidth: 40,
    textAlign: 'right',
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
    textAlign: 'center',
    paddingHorizontal: Spacing.xl,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: Radius.xxl,
    borderTopRightRadius: Radius.xxl,
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.xxxl,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  modalTitle: {
    fontSize: Typography.sizes.xxl,
    fontWeight: Typography.weights.bold,
    color: Colors.black,
  },
  modalInput: {
    fontSize: Typography.sizes.base,
    color: Colors.black,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray200,
    marginBottom: Spacing.lg,
  },
  modalLabel: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.semibold,
    color: Colors.gray500,
    marginBottom: Spacing.md,
    marginTop: Spacing.md,
  },
  colorPicker: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  colorOption: {
    width: 40,
    height: 40,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  colorOptionSelected: {
    borderWidth: 3,
    borderColor: Colors.white,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  priorityPicker: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.xxl,
  },
  priorityOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.gray200,
    gap: Spacing.xs,
  },
  priorityOptionDot: {
    width: 8,
    height: 8,
    borderRadius: Radius.full,
  },
  priorityOptionText: {
    fontSize: Typography.sizes.sm,
    color: Colors.gray500,
  },
  createButton: {
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.lg,
    borderRadius: Radius.full,
    alignItems: 'center',
  },
  createButtonDisabled: {
    backgroundColor: Colors.gray300,
  },
  createButtonText: {
    color: Colors.white,
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.semibold,
  },
});
