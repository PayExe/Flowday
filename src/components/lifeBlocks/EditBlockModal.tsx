import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Radius, Typography } from '../../theme';
import { LifeBlock, LifeBlockColors, LifeBlockColor } from '../../types/lifeBlock';

interface EditBlockModalProps {
  visible: boolean;
  block: LifeBlock | null;
  onClose: () => void;
  onSave: (data: {
    name: string;
    emoji: string;
    color: LifeBlockColor;
    weeklyGoalMinutes: number;
  }) => void;
  onArchive?: () => void;
  onUnarchive?: () => void;
}

const EMOJIS = [
  '💻', '🏃', '🍳', '📚', '🧘',
  '🎸', '✍️', '🌱', '🎨', '🎮',
  '💤', '💰', '🧹', '🎯', '🧠',
  '🏠', '✈️', '🐕', '📸', '🎧',
];

function parseGoalInput(input: string): number {
  const trimmed = input.trim().toLowerCase();
  const hMatch = trimmed.match(/(\d+)\s*h\s*(\d*)?/);
  if (hMatch) {
    const hours = parseInt(hMatch[1], 10);
    const minutes = hMatch[2] ? parseInt(hMatch[2], 10) : 0;
    return hours * 60 + minutes;
  }
  const minMatch = trimmed.match(/(\d+)\s*min/);
  if (minMatch) {
    return parseInt(minMatch[1], 10);
  }
  const num = parseInt(trimmed, 10);
  return isNaN(num) ? 0 : num;
}

function formatGoal(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h > 0 && m > 0) return `${h}h${m}`;
  if (h > 0) return `${h}h`;
  return `${m}min`;
}

export function EditBlockModal({
  visible,
  block,
  onClose,
  onSave,
  onArchive,
  onUnarchive,
}: EditBlockModalProps) {
  const isEditing = block !== null;

  const [name, setName] = useState('');
  const [selectedEmoji, setSelectedEmoji] = useState('💻');
  const [selectedColor, setSelectedColor] = useState<LifeBlockColor>(LifeBlockColors[0]);
  const [goalInput, setGoalInput] = useState('');

  useEffect(() => {
    if (block) {
      setName(block.name);
      setSelectedEmoji(block.emoji);
      setSelectedColor(block.color);
      setGoalInput(formatGoal(block.weeklyGoalMinutes));
    } else {
      setName('');
      setSelectedEmoji('💻');
      setSelectedColor(LifeBlockColors[0]);
      setGoalInput('');
    }
  }, [block, visible]);

  const handleSave = () => {
    if (!name.trim()) return;
    const weeklyGoalMinutes = parseGoalInput(goalInput) || 0;
    onSave({
      name: name.trim(),
      emoji: selectedEmoji,
      color: selectedColor,
      weeklyGoalMinutes,
    });
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.overlay}
      >
        <View style={styles.modal}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>
              {isEditing ? 'Modifier le bloc' : 'Nouveau bloc'}
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={24} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Nom */}
            <View style={styles.section}>
              <Text style={styles.label}>Nom</Text>
              <TextInput
                style={styles.input}
                placeholder="Ex: Deep Work, Sport..."
                placeholderTextColor={Colors.textTertiary}
                value={name}
                onChangeText={setName}
                autoFocus={!isEditing}
              />
            </View>

            {/* Emoji */}
            <View style={styles.section}>
              <Text style={styles.label}>Emoji</Text>
              <View style={styles.emojiGrid}>
                {EMOJIS.map((emoji) => (
                  <TouchableOpacity
                    key={emoji}
                    style={[
                      styles.emojiItem,
                      selectedEmoji === emoji && {
                        backgroundColor: Colors.bgInput,
                        borderColor: Colors.accentCyan,
                      },
                    ]}
                    onPress={() => setSelectedEmoji(emoji)}
                  >
                    <Text style={styles.emojiText}>{emoji}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Couleur */}
            <View style={styles.section}>
              <Text style={styles.label}>Couleur</Text>
              <View style={styles.colorGrid}>
                {LifeBlockColors.map((color) => (
                  <TouchableOpacity
                    key={color}
                    style={[
                      styles.colorItem,
                      { backgroundColor: color },
                      selectedColor === color && {
                        borderWidth: 3,
                        borderColor: Colors.textPrimary,
                      },
                    ]}
                    onPress={() => setSelectedColor(color)}
                  />
                ))}
              </View>
            </View>

            {/* Objectif hebdo */}
            <View style={styles.section}>
              <Text style={styles.label}>Objectif hebdomadaire</Text>
              <TextInput
                style={styles.input}
                placeholder="Ex: 5h, 1h30, 90min..."
                placeholderTextColor={Colors.textTertiary}
                value={goalInput}
                onChangeText={setGoalInput}
                keyboardType="default"
              />
              <Text style={styles.goalHint}>
                {goalInput ? formatGoal(parseGoalInput(goalInput)) + ' / semaine' : '...'}
              </Text>
            </View>

            {/* Actions */}
            <View style={styles.actions}>
              <TouchableOpacity
                style={[styles.saveBtn, !name.trim() && styles.saveBtnDisabled]}
                onPress={handleSave}
                disabled={!name.trim()}
              >
                <Text style={styles.saveBtnText}>
                  {isEditing ? 'Enregistrer' : 'Créer'}
                </Text>
              </TouchableOpacity>

              {isEditing && block && !block.isArchived && onArchive && (
                <TouchableOpacity style={styles.archiveBtn} onPress={onArchive}>
                  <Ionicons name="archive-outline" size={18} color={Colors.accentYellow} />
                  <Text style={styles.archiveBtnText}>Archiver</Text>
                </TouchableOpacity>
              )}

              {isEditing && block && block.isArchived && onUnarchive && (
                <TouchableOpacity style={styles.archiveBtn} onPress={onUnarchive}>
                  <Ionicons name="refresh-outline" size={18} color={Colors.accentGreen} />
                  <Text style={[styles.archiveBtnText, { color: Colors.accentGreen }]}>
                    Restaurer
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: Colors.bgPrimary + 'CC',
    justifyContent: 'flex-end',
  },
  modal: {
    backgroundColor: Colors.bgSurface,
    borderTopLeftRadius: Radius.xxl,
    borderTopRightRadius: Radius.xxl,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xxl + 20,
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.lg,
  },
  title: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
  },
  closeBtn: {
    padding: Spacing.sm,
  },
  section: {
    marginBottom: Spacing.lg,
  },
  label: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.semibold,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: Spacing.sm,
  },
  input: {
    backgroundColor: Colors.bgInput,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    fontSize: Typography.sizes.base,
    color: Colors.textPrimary,
  },
  emojiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  emojiItem: {
    width: 48,
    height: 48,
    borderRadius: Radius.md,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emojiText: {
    fontSize: 24,
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  colorItem: {
    width: 40,
    height: 40,
    borderRadius: Radius.full,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  goalHint: {
    fontSize: Typography.sizes.sm,
    color: Colors.textTertiary,
    marginTop: Spacing.xs,
  },
  actions: {
    marginTop: Spacing.md,
    gap: Spacing.md,
  },
  saveBtn: {
    backgroundColor: Colors.accentCyan,
    borderRadius: Radius.md,
    paddingVertical: Spacing.md,
    alignItems: 'center',
  },
  saveBtnDisabled: {
    backgroundColor: Colors.bgInput,
  },
  saveBtnText: {
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.semibold,
    color: Colors.bgPrimary,
  },
  archiveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
  },
  archiveBtnText: {
    fontSize: Typography.sizes.base,
    color: Colors.accentYellow,
    fontWeight: Typography.weights.medium,
  },
});
