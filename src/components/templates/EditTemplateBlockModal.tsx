import { useState, useEffect, useMemo, useRef } from 'react';
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
import { Picker } from '@react-native-picker/picker';
import { TemplateBlock } from '../../types/template';
import { LifeBlock } from '../../types/lifeBlock';
import { useTheme } from '../../theme';
import { Symbol, SymbolNames } from '../ui/Symbol';

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

const DAY_LABELS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];

const TIME_OPTIONS = Array.from({ length: 48 }, (_, i) => {
  const h = Math.floor(i / 2);
  const m = (i % 2) * 30;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
});

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
  const { colors } = useTheme();
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

  const pickerStyle = {
    color: colors.text.primary,
    backgroundColor: colors.bg.input,
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
        <View style={[styles.modal, { backgroundColor: colors.bg.elevated }]}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.text.primary }]}>
              {isEditing ? 'Modifier le créneau' : 'Nouveau créneau'}
            </Text>
            <Pressable onPress={onClose} style={styles.closeBtn}>
              <Symbol name={SymbolNames.close} size={24} color={colors.text.secondary} />
            </Pressable>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Jour */}
            <View style={styles.section}>
              <Text style={[styles.label, { color: colors.text.secondary }]}>Jour</Text>
              <Text style={[styles.dayText, { color: colors.text.primary }]}>{DAY_LABELS[dayOfWeek]}</Text>
            </View>

            {/* Life Block */}
            <View style={styles.section}>
              <Text style={[styles.label, { color: colors.text.secondary }]}>Life Block</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.lifeBlockRow}>
                  {lifeBlocks.map((lb) => (
                    <Pressable
                      key={lb.id}
                      style={[
                        styles.lifeBlockChip,
                        {
                          borderColor: colors.border,
                          backgroundColor: colors.bg.input,
                        },
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
                          { color: colors.text.secondary },
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

            {/* Horaires — Picker natif iOS wheel */}
            <View style={styles.section}>
              <Text style={[styles.label, { color: colors.text.secondary }]}>Horaires</Text>
              <View style={styles.timeRow}>
                <View style={styles.timeInputWrapper}>
                  <Text style={[styles.timeLabel, { color: colors.text.quaternary }]}>Début</Text>
                  <View style={[styles.pickerContainer, { backgroundColor: colors.bg.input }]}>
                    <Picker
                      selectedValue={startTime}
                      onValueChange={(itemValue) => setStartTime(itemValue)}
                      itemStyle={{ color: colors.text.primary, fontSize: 17 }}
                    >
                      {TIME_OPTIONS.map((t) => (
                        <Picker.Item key={t} label={t} value={t} />
                      ))}
                    </Picker>
                  </View>
                </View>
                <Text style={[styles.timeSeparator, { color: colors.text.secondary }]}>→</Text>
                <View style={styles.timeInputWrapper}>
                  <Text style={[styles.timeLabel, { color: colors.text.quaternary }]}>Fin</Text>
                  <View style={[styles.pickerContainer, { backgroundColor: colors.bg.input }]}>
                    <Picker
                      selectedValue={endTime}
                      onValueChange={(itemValue) => setEndTime(itemValue)}
                      itemStyle={{ color: colors.text.primary, fontSize: 17 }}
                    >
                      {TIME_OPTIONS.map((t) => (
                        <Picker.Item key={t} label={t} value={t} />
                      ))}
                    </Picker>
                  </View>
                </View>
              </View>
              {validationError && (
                <Text style={[styles.errorText, { color: colors.system.red }]}>{validationError}</Text>
              )}
            </View>

            {/* Titre optionnel */}
            <View style={styles.section}>
              <Text style={[styles.label, { color: colors.text.secondary }]}>Titre (optionnel)</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.bg.input, color: colors.text.primary }]}
                placeholder="Ex: Deep Work, Chest day..."
                placeholderTextColor={colors.text.placeholder}
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
                  trackColor={{ false: colors.separator.default, true: colors.system.green }}
                    thumbColor={colors.text.inverse}
                  ios_backgroundColor={colors.separator.default}
                />
                <Text style={{ fontSize: 17, color: colors.text.primary, letterSpacing: -0.41, marginLeft: 10 }}>
                  Créneau flexible
                </Text>
              </Pressable>
            </View>

            {/* Notes */}
            <View style={styles.section}>
              <Text style={[styles.label, { color: colors.text.secondary }]}>Notes (optionnel)</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.bg.input, color: colors.text.primary, height: 80, textAlignVertical: 'top' }]}
                placeholder="Ajouter des notes..."
                placeholderTextColor={colors.text.placeholder}
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
                  { backgroundColor: colors.system.blue },
                  validationError && { backgroundColor: colors.bg.hover },
                ]}
                onPress={handleSave}
                disabled={!!validationError}
              >
                <Text style={[styles.saveBtnText, { color: colors.text.inverse }]}>
                  {isEditing ? 'Enregistrer' : 'Créer'}
                </Text>
              </Pressable>

              {isEditing && onDelete && (
                <Pressable style={styles.deleteBtn} onPress={handleDelete}>
                  <Symbol name={SymbolNames.trash} size={18} color={colors.system.red} />
                  <Text style={[styles.deleteBtnText, { color: colors.system.red }]}>Supprimer</Text>
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
  dayText: {
    fontSize: 17,
    fontWeight: '600',
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
    gap: 6,
  },
  lifeBlockEmoji: {
    fontSize: 16,
  },
  lifeBlockName: {
    fontSize: 13,
    fontWeight: '500',
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  timeInputWrapper: {
    flex: 1,
  },
  timeLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  pickerContainer: {
    borderRadius: 10,
    overflow: 'hidden',
    height: 140,
    justifyContent: 'center',
  },
  timeSeparator: {
    fontSize: 20,
    paddingTop: 32,
  },
  input: {
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 17,
    letterSpacing: -0.41,
  },
  errorText: {
    fontSize: 13,
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
    borderRadius: 13,
    paddingVertical: 14,
    alignItems: 'center',
  },
  saveBtnText: {
    fontSize: 17,
    fontWeight: '600',
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
  },
});
