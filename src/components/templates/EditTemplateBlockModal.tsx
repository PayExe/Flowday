import { useState, useEffect, useMemo } from 'react';
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
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Radius, Typography } from '../../theme';
import { TemplateBlock } from '../../types/template';
import { LifeBlock } from '../../types/lifeBlock';

interface EditTemplateBlockModalProps {
  visible: boolean;
  block: TemplateBlock | null;
  lifeBlocks: LifeBlock[];
  existingBlocks: TemplateBlock[]; // pour vérifier chevauchement
  dayOfWeek: number;
  onClose: () => void;
  onSave: (data: Omit<TemplateBlock, 'id'>) => void;
  onDelete?: () => void;
}

function timeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

function minutesToTime(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
}

function formatTimeInput(input: string): string {
  // Accepte "9", "9:30", "09:30", "930"
  const cleaned = input.replace(/[^0-9]/g, '');
  if (cleaned.length <= 2) {
    const h = parseInt(cleaned, 10);
    return `${h.toString().padStart(2, '0')}:00`;
  }
  const h = parseInt(cleaned.slice(0, 2), 10);
  const m = parseInt(cleaned.slice(2, 4), 10);
  return `${h.toString().padStart(2, '0')}:${Math.min(m, 59).toString().padStart(2, '0')}`;
}

const DAY_LABELS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];

export function EditTemplateBlockModal({
  visible,
  block,
  lifeBlocks,
  existingBlocks,
  dayOfWeek,
  onClose,
  onSave,
  onDelete,
}: EditTemplateBlockModalProps) {
  const isEditing = block !== null;

  const [selectedLifeBlockId, setSelectedLifeBlockId] = useState('');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [isFlexible, setIsFlexible] = useState(false);

  useEffect(() => {
    if (block) {
      setSelectedLifeBlockId(block.lifeBlockId);
      setStartTime(block.startTime);
      setEndTime(block.endTime);
      setTitle(block.title || '');
      setNotes(block.notes || '');
      setIsFlexible(block.isFlexible);
    } else {
      setSelectedLifeBlockId(lifeBlocks[0]?.id || '');
      setStartTime('09:00');
      setEndTime('10:00');
      setTitle('');
      setNotes('');
      setIsFlexible(false);
    }
  }, [block, visible, lifeBlocks]);

  const selectedBlock = lifeBlocks.find((b) => b.id === selectedLifeBlockId);

  const validationError = useMemo(() => {
    const start = timeToMinutes(startTime);
    const end = timeToMinutes(endTime);

    if (end <= start) return "L'heure de fin doit être après l'heure de début";
    if (end - start < 15) return 'Minimum 15 minutes';

    // Vérifier chevauchement avec les autres blocs du même jour
    const otherBlocks = isEditing
      ? existingBlocks.filter((b) => b.id !== block!.id && b.dayOfWeek === dayOfWeek)
      : existingBlocks.filter((b) => b.dayOfWeek === dayOfWeek);

    for (const other of otherBlocks) {
      const otherStart = timeToMinutes(other.startTime);
      const otherEnd = timeToMinutes(other.endTime);
      if (start < otherEnd && end > otherStart) {
        return `Chevauchement avec ${other.startTime}–${other.endTime}`;
      }
    }

    return null;
  }, [startTime, endTime, existingBlocks, dayOfWeek, isEditing, block]);

  const handleSave = () => {
    if (!selectedLifeBlockId) return;
    if (validationError) {
      Alert.alert('Erreur', validationError);
      return;
    }
    onSave({
      lifeBlockId: selectedLifeBlockId,
      dayOfWeek: dayOfWeek as 0 | 1 | 2 | 3 | 4 | 5 | 6,
      startTime,
      endTime,
      title: title.trim() || undefined,
      notes: notes.trim() || undefined,
      isFlexible,
    });
    onClose();
  };

  const handleDelete = () => {
    Alert.alert(
      'Supprimer ce bloc ?',
      'Cette action est irréversible.',
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Supprimer', style: 'destructive', onPress: () => onDelete?.() },
      ]
    );
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
              {isEditing ? 'Modifier le créneau' : 'Nouveau créneau'}
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={24} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Jour */}
            <View style={styles.section}>
              <Text style={styles.label}>Jour</Text>
              <Text style={styles.dayText}>{DAY_LABELS[dayOfWeek]}</Text>
            </View>

            {/* Life Block */}
            <View style={styles.section}>
              <Text style={styles.label}>Life Block</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.lifeBlockRow}>
                  {lifeBlocks.map((lb) => (
                    <TouchableOpacity
                      key={lb.id}
                      style={[
                        styles.lifeBlockChip,
                        selectedLifeBlockId === lb.id && {
                          backgroundColor: lb.color + '20',
                          borderColor: lb.color,
                        },
                      ]}
                      onPress={() => setSelectedLifeBlockId(lb.id)}
                    >
                      <Text style={styles.lifeBlockEmoji}>{lb.emoji}</Text>
                      <Text
                        style={[
                          styles.lifeBlockName,
                          selectedLifeBlockId === lb.id && { color: lb.color },
                        ]}
                      >
                        {lb.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>

            {/* Horaires */}
            <View style={styles.section}>
              <Text style={styles.label}>Horaires</Text>
              <View style={styles.timeRow}>
                <View style={styles.timeInputWrapper}>
                  <Text style={styles.timeLabel}>Début</Text>
                  <TextInput
                    style={styles.timeInput}
                    value={startTime}
                    onChangeText={(text) => setStartTime(formatTimeInput(text))}
                    placeholder="09:00"
                    placeholderTextColor={Colors.textTertiary}
                    keyboardType="numbers-and-punctuation"
                  />
                </View>
                <Text style={styles.timeSeparator}>→</Text>
                <View style={styles.timeInputWrapper}>
                  <Text style={styles.timeLabel}>Fin</Text>
                  <TextInput
                    style={styles.timeInput}
                    value={endTime}
                    onChangeText={(text) => setEndTime(formatTimeInput(text))}
                    placeholder="10:00"
                    placeholderTextColor={Colors.textTertiary}
                    keyboardType="numbers-and-punctuation"
                  />
                </View>
              </View>
              {validationError && (
                <Text style={styles.errorText}>{validationError}</Text>
              )}
            </View>

            {/* Titre optionnel */}
            <View style={styles.section}>
              <Text style={styles.label}>Titre (optionnel)</Text>
              <TextInput
                style={styles.input}
                placeholder="Ex: Deep Work, Chest day..."
                placeholderTextColor={Colors.textTertiary}
                value={title}
                onChangeText={setTitle}
              />
            </View>

            {/* Flexible */}
            <View style={styles.section}>
              <TouchableOpacity
                style={styles.toggleRow}
                onPress={() => setIsFlexible(!isFlexible)}
              >
                <View
                  style={[
                    styles.toggleBox,
                    isFlexible && { backgroundColor: Colors.accentCyan, borderColor: Colors.accentCyan },
                  ]}
                >
                  {isFlexible && (
                    <Ionicons name="checkmark" size={14} color={Colors.bgPrimary} />
                  )}
                </View>
                <Text style={styles.toggleLabel}>Créneau flexible</Text>
              </TouchableOpacity>
            </View>

            {/* Notes */}
            <View style={styles.section}>
              <Text style={styles.label}>Notes (optionnel)</Text>
              <TextInput
                style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
                placeholder="Ajouter des notes..."
                placeholderTextColor={Colors.textTertiary}
                value={notes}
                onChangeText={setNotes}
                multiline
              />
            </View>

            {/* Actions */}
            <View style={styles.actions}>
              <TouchableOpacity
                style={[styles.saveBtn, validationError && styles.saveBtnDisabled]}
                onPress={handleSave}
                disabled={!!validationError}
              >
                <Text style={styles.saveBtnText}>
                  {isEditing ? 'Enregistrer' : 'Créer'}
                </Text>
              </TouchableOpacity>

              {isEditing && onDelete && (
                <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete}>
                  <Ionicons name="trash-outline" size={18} color={Colors.accentRed} />
                  <Text style={styles.deleteBtnText}>Supprimer</Text>
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
  dayText: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.semibold,
    color: Colors.textPrimary,
  },
  lifeBlockRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  lifeBlockChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.bgInput,
    gap: Spacing.xs,
  },
  lifeBlockEmoji: {
    fontSize: 16,
  },
  lifeBlockName: {
    fontSize: Typography.sizes.sm,
    color: Colors.textSecondary,
    fontWeight: Typography.weights.medium,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: Spacing.md,
  },
  timeInputWrapper: {
    flex: 1,
  },
  timeLabel: {
    fontSize: Typography.sizes.xs,
    color: Colors.textTertiary,
    marginBottom: Spacing.xs,
  },
  timeInput: {
    backgroundColor: Colors.bgInput,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    fontSize: Typography.sizes.base,
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  timeSeparator: {
    fontSize: Typography.sizes.xl,
    color: Colors.textSecondary,
    paddingBottom: Spacing.md,
  },
  input: {
    backgroundColor: Colors.bgInput,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    fontSize: Typography.sizes.base,
    color: Colors.textPrimary,
  },
  errorText: {
    fontSize: Typography.sizes.sm,
    color: Colors.accentRed,
    marginTop: Spacing.sm,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  toggleBox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: Colors.textTertiary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleLabel: {
    fontSize: Typography.sizes.base,
    color: Colors.textPrimary,
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
  deleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
  },
  deleteBtnText: {
    fontSize: Typography.sizes.base,
    color: Colors.accentRed,
    fontWeight: Typography.weights.medium,
  },
});
