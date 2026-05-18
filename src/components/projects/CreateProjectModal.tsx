import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Radius, Typography } from '../../theme';
import { Priority } from '../../types/task';

const PROJECT_COLORS = [
  '#1D9BF0', '#00BA7C', '#FFAD1F', '#F4212E',
  '#7856FF', '#FF6B00', '#E91E8C', '#17BF63',
];

const PRIORITY_CONFIG = {
  high: { color: Colors.priorityHigh, bg: Colors.dangerLight, label: 'Haute' },
  medium: { color: Colors.priorityMedium, bg: Colors.warningLight, label: 'Moyenne' },
  low: { color: Colors.priorityLow, bg: Colors.successLight, label: 'Basse' },
};

interface CreateProjectModalProps {
  visible: boolean;
  onClose: () => void;
  onCreate: (name: string, color: string, priority: Priority) => void;
}

export function CreateProjectModal({ visible, onClose, onCreate }: CreateProjectModalProps) {
  const [name, setName] = useState('');
  const [color, setColor] = useState(PROJECT_COLORS[0]);
  const [priority, setPriority] = useState<Priority>('medium');

  const handleCreate = () => {
    if (name.trim() === '') return;
    onCreate(name.trim(), color, priority);
    setName('');
    setColor(PROJECT_COLORS[0]);
    setPriority('medium');
    onClose();
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>Nouveau projet</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={Colors.gray500} />
            </TouchableOpacity>
          </View>

          <TextInput
            style={styles.input}
            placeholder="Nom du projet"
            placeholderTextColor={Colors.gray500}
            value={name}
            onChangeText={setName}
            autoFocus
          />

          <Text style={styles.label}>Couleur</Text>
          <View style={styles.colorPicker}>
            {PROJECT_COLORS.map((c) => (
              <TouchableOpacity
                key={c}
                style={[
                  styles.colorOption,
                  { backgroundColor: c },
                  color === c && styles.colorOptionSelected,
                ]}
                onPress={() => setColor(c)}
              >
                {color === c && (
                  <Ionicons name="checkmark" size={16} color={Colors.white} />
                )}
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>Priorité</Text>
          <View style={styles.priorityPicker}>
            {(['high', 'medium', 'low'] as Priority[]).map((p) => (
              <TouchableOpacity
                key={p}
                style={[
                  styles.priorityOption,
                  priority === p && {
                    backgroundColor: PRIORITY_CONFIG[p].bg,
                    borderColor: PRIORITY_CONFIG[p].color,
                  },
                ]}
                onPress={() => setPriority(p)}
              >
                <View
                  style={[
                    styles.priorityOptionDot,
                    { backgroundColor: PRIORITY_CONFIG[p].color },
                  ]}
                />
                <Text
                  style={[
                    styles.priorityOptionText,
                    priority === p && {
                      color: PRIORITY_CONFIG[p].color,
                      fontWeight: Typography.weights.semibold,
                    },
                  ]}
                >
                  {PRIORITY_CONFIG[p].label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity
            style={[styles.createButton, !name.trim() && styles.createButtonDisabled]}
            onPress={handleCreate}
            disabled={!name.trim()}
          >
            <Text style={styles.createButtonText}>Créer le projet</Text>
          </TouchableOpacity>
        </View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  content: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: Radius.xxl,
    borderTopRightRadius: Radius.xxl,
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.xxxl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  title: {
    fontSize: Typography.sizes.xxl,
    fontWeight: Typography.weights.bold,
    color: Colors.black,
  },
  input: {
    fontSize: Typography.sizes.base,
    color: Colors.black,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray200,
    marginBottom: Spacing.lg,
  },
  label: {
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
