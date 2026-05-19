import { useState, useEffect, useMemo } from 'react';
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
  Alert,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { TemplateBlock } from '../../types/template';
import { LifeBlock } from '../../types/lifeBlock';

interface EditTemplateBlockModalProps {
  visible: boolean;
  block: TemplateBlock | null;
  lifeBlocks: LifeBlock[];
  existingBlocks: TemplateBlock[];
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
            <Pressable onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={24} color="#EBEBF599" />
            </Pressable>
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
                    <Pressable
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
                    </Pressable>
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
                    placeholderTextColor="#3C3C4399"
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
                    placeholderTextColor="#3C3C4399"
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
                placeholderTextColor="#3C3C4399"
                value={title}
                onChangeText={setTitle}
              />
            </View>

            {/* Flexible */}
            <View style={styles.section}>
              <Pressable
                style={styles.toggleRow}
                onPress={() => setIsFlexible(!isFlexible)}
              >
                <Switch
                  value={isFlexible}
                  onValueChange={setIsFlexible}
                  trackColor={{ false: '#38383A', true: '#30D158' }}
                  thumbColor="#FFFFFF"
                  ios_backgroundColor="#38383A"
                />
                <Text style={{ fontSize: 17, color: '#FFFFFF', letterSpacing: -0.41, marginLeft: 10 }}>
                  Créneau flexible
                </Text>
              </Pressable>
            </View>

            {/* Notes */}
            <View style={styles.section}>
              <Text style={styles.label}>Notes (optionnel)</Text>
              <TextInput
                style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
                placeholder="Ajouter des notes..."
                placeholderTextColor="#3C3C4399"
                value={notes}
                onChangeText={setNotes}
                multiline
              />
            </View>

            {/* Actions */}
            <View style={styles.actions}>
              <Pressable
                style={[
                  styles.saveBtn,
                  validationError && { backgroundColor: '#2C2C2E' },
                ]}
                onPress={handleSave}
                disabled={!!validationError}
              >
                <Text style={styles.saveBtnText}>
                  {isEditing ? 'Enregistrer' : 'Créer'}
                </Text>
              </Pressable>

              {isEditing && onDelete && (
                <Pressable style={styles.deleteBtn} onPress={handleDelete}>
                  <Ionicons name="trash-outline" size={18} color="#FF453A" />
                  <Text style={styles.deleteBtnText}>Supprimer</Text>
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
  dayText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: -0.41,
  },
  lifeBlockRow: {
    flexDirection: 'row',
    gap: 8,
  },
  lifeBlockChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#38383A',
    backgroundColor: '#2C2C2E',
    gap: 6,
  },
  lifeBlockEmoji: {
    fontSize: 16,
  },
  lifeBlockName: {
    fontSize: 13,
    color: '#EBEBF599',
    fontWeight: '500',
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 12,
  },
  timeInputWrapper: {
    flex: 1,
  },
  timeLabel: {
    fontSize: 12,
    color: '#EBEBF54D',
    marginBottom: 4,
  },
  timeInput: {
    backgroundColor: '#2C2C2E',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 17,
    color: '#FFFFFF',
    textAlign: 'center',
    letterSpacing: -0.41,
  },
  timeSeparator: {
    fontSize: 20,
    color: '#EBEBF599',
    paddingBottom: 12,
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
  errorText: {
    fontSize: 13,
    color: '#FF453A',
    marginTop: 8,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
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
  deleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
  },
  deleteBtnText: {
    fontSize: 17,
    fontWeight: '400',
    color: '#FF453A',
  },
});
