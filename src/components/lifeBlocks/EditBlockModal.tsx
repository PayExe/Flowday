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
        style={styles.overlay}
      >
        <View style={styles.modal}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>
              {isEditing ? 'Modifier le bloc' : 'Nouveau bloc'}
            </Text>
            <Pressable onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={24} color="#EBEBF599" />
            </Pressable>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Nom */}
            <View style={styles.section}>
              <Text style={styles.label}>Nom</Text>
              <TextInput
                style={styles.input}
                placeholder="Ex: Deep Work, Sport..."
                placeholderTextColor="#3C3C4399"
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
                  <Pressable
                    key={emoji}
                    style={[
                      styles.emojiItem,
                      selectedEmoji === emoji && {
                        backgroundColor: '#2C2C2E',
                        borderColor: '#0A84FF',
                      },
                    ]}
                    onPress={() => setSelectedEmoji(emoji)}
                  >
                    <Text style={styles.emojiText}>{emoji}</Text>
                  </Pressable>
                ))}
              </View>
            </View>

            {/* Couleur */}
            <View style={styles.section}>
              <Text style={styles.label}>Couleur</Text>
              <View style={styles.colorGrid}>
                {LifeBlockColors.map((color) => (
                  <Pressable
                    key={color}
                    style={[
                      styles.colorItem,
                      { backgroundColor: color },
                      selectedColor === color && {
                        borderWidth: 3,
                        borderColor: '#FFFFFF',
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
                placeholderTextColor="#3C3C4399"
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
              <Pressable
                style={[
                  styles.saveBtn,
                  !name.trim() && { backgroundColor: '#2C2C2E' },
                ]}
                onPress={handleSave}
                disabled={!name.trim()}
              >
                <Text style={styles.saveBtnText}>
                  {isEditing ? 'Enregistrer' : 'Créer'}
                </Text>
              </Pressable>

              {isEditing && block && !block.isArchived && onArchive && (
                <Pressable style={styles.archiveBtn} onPress={onArchive}>
                  <Ionicons name="archive-outline" size={18} color="#FF9F0A" />
                  <Text style={[styles.archiveBtnText, { color: '#FF9F0A' }]}>Archiver</Text>
                </Pressable>
              )}

              {isEditing && block && block.isArchived && onUnarchive && (
                <Pressable style={styles.archiveBtn} onPress={onUnarchive}>
                  <Ionicons name="refresh-outline" size={18} color="#30D158" />
                  <Text style={[styles.archiveBtnText, { color: '#30D158' }]}>
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
    backgroundColor: '#000000CC',
    justifyContent: 'flex-end',
  },
  modal: {
    backgroundColor: '#1C1C1E',
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
    color: '#FFFFFF',
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
    color: '#EBEBF599',
    textTransform: 'uppercase',
    letterSpacing: -0.08,
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#2C2C2E',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 17,
    color: '#FFFFFF',
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
    borderColor: '#38383A',
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
    color: '#EBEBF54D',
    marginTop: 6,
  },
  actions: {
    marginTop: 8,
    gap: 12,
  },
  saveBtn: {
    backgroundColor: '#0A84FF',
    borderRadius: 13,
    paddingVertical: 14,
    alignItems: 'center',
  },
  saveBtnText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FFFFFF',
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
    color: '#FF9F0A',
  },
});
