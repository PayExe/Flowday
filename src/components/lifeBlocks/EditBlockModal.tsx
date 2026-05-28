import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  Modal,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LifeBlock, LifeBlockColors, LifeBlockColor } from '../../types/lifeBlock';
import { useTheme } from '../../theme';
import { hapticSuccess } from '../../utils/haptics';

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
  const { colors, typography } = useTheme();
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
    hapticSuccess();
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
        style={[styles.overlay, { backgroundColor: colors.bg.primary + 'CC' }]}
      >
        <View style={[styles.modal, { backgroundColor: colors.bg.elevated }]}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.text.primary }]}>
              {isEditing ? 'Modifier le bloc' : 'Nouveau bloc'}
            </Text>
            <Pressable onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={24} color={colors.text.secondary} />
            </Pressable>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.section}>
              <Text style={[styles.label, { color: colors.text.secondary }]}>Nom</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.bg.input, color: colors.text.primary }]}
                placeholder="Ex: Deep Work, Sport..."
                placeholderTextColor={colors.text.placeholder}
                value={name}
                onChangeText={setName}
                autoFocus={!isEditing}
              />
            </View>

            <View style={styles.section}>
              <Text style={[styles.label, { color: colors.text.secondary }]}>Emoji</Text>
              <TextInput
                style={{
                  backgroundColor: colors.bg.input,
                  borderRadius: 10,
                  fontSize: typography.sizes.xxxl,
                  color: colors.text.primary,
                  textAlign: 'center',
                  paddingVertical: 12,
                }}
                value={selectedEmoji}
                onChangeText={(text) => setSelectedEmoji(text.slice(0, 2))}
                maxLength={2}
                keyboardType="default"
              />
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 10, justifyContent: 'center' }}>
                {EMOJIS.map((emoji) => (
                  <Pressable
                    key={emoji}
                    style={{
                      width: 38,
                      height: 38,
                      borderRadius: 9,
                      backgroundColor: selectedEmoji === emoji ? colors.bg.hover : 'transparent',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                    onPress={() => setSelectedEmoji(emoji)}
                  >
                    <Text style={{ fontSize: typography.sizes.xxl }}>{emoji}</Text>
                  </Pressable>
                ))}
              </View>
            </View>

            <View style={styles.section}>
              <Text style={[styles.label, { color: colors.text.secondary }]}>Couleur</Text>
              <View style={styles.colorGrid}>
                {LifeBlockColors.map((color) => (
                  <Pressable
                    key={color}
                    style={[
                      styles.colorItem,
                      { backgroundColor: color },
                      selectedColor === color && {
                        borderWidth: 3,
                        borderColor: colors.text.inverse,
                      },
                    ]}
                    onPress={() => setSelectedColor(color)}
                  />
                ))}
              </View>
            </View>

            <View style={styles.section}>
              <Text style={[styles.label, { color: colors.text.secondary }]}>Objectif hebdomadaire</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.bg.input, color: colors.text.primary }]}
                placeholder="Ex: 5h, 1h30, 90min..."
                placeholderTextColor={colors.text.placeholder}
                value={goalInput}
                onChangeText={setGoalInput}
                keyboardType="default"
              />
              <Text style={[styles.goalHint, { color: colors.text.quaternary }]}>
                {goalInput ? formatGoal(parseGoalInput(goalInput)) + ' / semaine' : '...'}
              </Text>
            </View>

            <View style={styles.actions}>
              <Pressable
                style={[
                  styles.saveBtn,
                  { backgroundColor: name.trim() ? colors.system.blue : colors.bg.hover },
                ]}
                onPress={handleSave}
                disabled={!name.trim()}
              >
                <Text style={[styles.saveBtnText, { color: colors.text.inverse }]}>
                  {isEditing ? 'Enregistrer' : 'Créer'}
                </Text>
              </Pressable>

              {isEditing && block && !block.isArchived && onArchive && (
                <Pressable style={styles.archiveBtn} onPress={onArchive}>
                  <Ionicons name="archive-outline" size={18} color={colors.system.orange} />
                  <Text style={[styles.archiveBtnText, { color: colors.system.orange }]}>Archiver</Text>
                </Pressable>
              )}

              {isEditing && block && block.isArchived && onUnarchive && (
                <Pressable style={styles.archiveBtn} onPress={onUnarchive}>
                  <Ionicons name="refresh-outline" size={18} color={colors.system.green} />
                  <Text style={[styles.archiveBtnText, { color: colors.system.green }]}>
                    Restaurer
                  </Text>
                </Pressable>
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
    justifyContent: 'flex-end',
  },
  modal: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 16,
    paddingBottom: 44,
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
  },
  closeBtn: {
    padding: 8,
  },
  section: {
    marginBottom: 20,
  },
  label: {
    fontSize: 13,
    fontWeight: '400',
    textTransform: 'uppercase',
    letterSpacing: -0.08,
    marginBottom: 8,
  },
  input: {
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 17,
    letterSpacing: -0.41,
  },
  emojiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  emojiItem: {
    width: 48,
    height: 48,
    borderRadius: 10,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emojiText: {
    fontSize: 24,
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  colorItem: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  goalHint: {
    fontSize: 13,
    marginTop: 6,
  },
  actions: {
    marginTop: 8,
    gap: 12,
  },
  saveBtn: {
    borderRadius: 13,
    paddingVertical: 14,
    alignItems: 'center',
  },
  saveBtnText: {
    fontSize: 17,
    fontWeight: '600',
  },
  archiveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
  },
  archiveBtnText: {
    fontSize: 17,
    fontWeight: '400',
  },
});
