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
  '#22D3EE', '#3FB950', '#D29922', '#F85149',
  '#A371F7', '#FF6B00', '#E91E8C', '#58A6FF',
];

const PRIORITY_CONFIG = {
  high: { color: Colors.priorityHigh, label: 'Haute' },
  medium: { color: Colors.priorityMedium, label: 'Moyenne' },
  low: { color: Colors.priorityLow, label: 'Basse' },
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
            <TouchableOpacity onPress={onClose} activeOpacity={0.7}>
              <Ionicons name="close" size={24} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <TextInput
            style={styles.input}
            placeholder="Nom du projet"
            placeholderTextColor={Colors.textTertiary}
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
                activeOpacity={0.8}
              >
                {color === c && (
                  <Ionicons name="checkmark" size={16} color={Colors.bgPrimary} />
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
                    backgroundColor: PRIORITY_CONFIG[p].color + '18',
                    borderColor: PRIORITY_CONFIG[p].color,
                  },
                ]}
                onPress={() => setPriority(p)}
                activeOpacity={0.7}
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
            activeOpacity={0.8}
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
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  content: {
    backgroundColor: Colors.bgSurface,
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.xxxl,
    borderWidth: 1,
    borderBottomWidth: 0,
    borderColor: Colors.border,
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
    color: Colors.textPrimary,
  },
  input: {
    fontSize: Typography.sizes.base,
    color: Colors.textPrimary,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    marginBottom: Spacing.lg,
  },
  label: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.semibold,
    color: Colors.textSecondary,
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
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  colorOptionSelected: {
    borderWidth: 2,
    borderColor: Colors.textPrimary,
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
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.xs,
  },
  priorityOptionDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  priorityOptionText: {
    fontSize: Typography.sizes.sm,
    color: Colors.textSecondary,
  },
  createButton: {
    backgroundColor: Colors.accentCyan,
    paddingVertical: Spacing.lg,
    borderRadius: Radius.md,
    alignItems: 'center',
  },
  createButtonDisabled: {
    backgroundColor: Colors.bgInput,
  },
  createButtonText: {
    color: Colors.bgPrimary,
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.semibold,
  },
});
