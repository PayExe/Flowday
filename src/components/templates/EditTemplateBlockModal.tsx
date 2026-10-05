import { useState, useEffect, useMemo } from 'react';
import { View, Text, TextInput, StyleSheet, Alert, Switch } from 'react-native';
import { TemplateBlock } from '../../types/template';
import { LifeBlock } from '../../types/lifeBlock';
import { useTheme } from '../../theme';
import { SymbolNames } from '../ui/Symbol';
import { useTranslation } from '../../i18n';
import { timeToMinutes } from '../../utils/time';
import { Button } from '../ui/Glass';
import { Card, Chip, List } from '../ui/List';
import { FieldLabel, Sheet } from '../ui/Sheet';
import { TimeField } from '../ui/TimeField';

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
  const { colors, typography } = useTheme();
  const { t } = useTranslation();
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

  const validationError = useMemo(() => {
    const start = timeToMinutes(startTime);
    const end = timeToMinutes(endTime);

    if (end <= start) return t("L'heure de fin doit être après l'heure de début");
    if (end - start < 15) return t('Minimum 15 minutes');

    const otherBlocks = isEditing
      ? existingBlocks.filter((b) => b.id !== block!.id && b.dayOfWeek === dayOfWeek)
      : existingBlocks.filter((b) => b.dayOfWeek === dayOfWeek);

    for (const other of otherBlocks) {
      const otherStart = timeToMinutes(other.startTime);
      const otherEnd = timeToMinutes(other.endTime);
      if (start < otherEnd && end > otherStart) {
        return t('Chevauchement avec {timeRange}', { timeRange: `${other.startTime}–${other.endTime}` });
      }
    }

    return null;
  }, [startTime, endTime, existingBlocks, dayOfWeek, isEditing, block]);

  const handleSave = () => {
    if (!selectedLifeBlockId) return;
    if (validationError) {
      Alert.alert(t('Erreur'), validationError);
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
      t('Supprimer ce bloc ?'),
      t('Cette action est irréversible.'),
      [
        { text: t('Annuler'), style: 'cancel' },
        { text: t('Supprimer'), style: 'destructive', onPress: () => onDelete?.() },
      ]
    );
  };

  return (
    <Sheet
      visible={visible}
      title={isEditing ? t('Modifier le créneau') : t('Nouveau créneau')}
      onClose={onClose}
      onConfirm={handleSave}
      confirmLabel={isEditing ? t('Enregistrer') : t('Créer')}
      confirmDisabled={!!validationError || !selectedLifeBlockId}
    >
      <FieldLabel>{t('Life Block')}</FieldLabel>
      <View style={styles.chips}>
        {lifeBlocks.map((lb) => (
          <Chip
            key={lb.id}
            label={lb.name}
            emoji={lb.emoji}
            color={lb.color}
            selected={selectedLifeBlockId === lb.id}
            onPress={() => setSelectedLifeBlockId(lb.id)}
          />
        ))}
      </View>

      <FieldLabel>{t('Horaires')}</FieldLabel>
      <List>
        <View style={styles.row}>
          <Text style={[typography.body, styles.rowLabel]}>{t('Jour')}</Text>
          <Text style={[typography.body, { color: colors.text.secondary }]}>{t(DAY_LABELS[dayOfWeek])}</Text>
        </View>
        <View style={styles.row}>
          <Text style={[typography.body, styles.rowLabel]}>{t('Début')}</Text>
          <TimeField value={startTime} onChange={setStartTime} accessibilityLabel={t('Début')} />
        </View>
        <View style={styles.row}>
          <Text style={[typography.body, styles.rowLabel]}>{t('Fin')}</Text>
          <TimeField value={endTime} onChange={setEndTime} accessibilityLabel={t('Fin')} />
        </View>
        <View style={styles.row}>
          <Text style={[typography.body, styles.rowLabel]}>{t('Créneau flexible')}</Text>
          <Switch
            value={isFlexible}
            onValueChange={setIsFlexible}
            trackColor={{ true: colors.system.green }}
          />
        </View>
      </List>
      {validationError && (
        <Text style={[typography.footnote, styles.error, { color: colors.system.red }]}>
          {validationError}
        </Text>
      )}

      <FieldLabel>{t('Titre (optionnel)')}</FieldLabel>
      <Card>
        <TextInput
          style={[typography.body, styles.input]}
          placeholder={t('Ex: Deep Work, Chest day...')}
          placeholderTextColor={colors.text.placeholder}
          value={title}
          onChangeText={setTitle}
        />
      </Card>

      <FieldLabel>{t('Notes (optionnel)')}</FieldLabel>
      <Card>
        <TextInput
          style={[typography.body, styles.input, styles.notes]}
          placeholder={t('Ajouter des notes...')}
          placeholderTextColor={colors.text.placeholder}
          value={notes}
          onChangeText={setNotes}
          multiline
        />
      </Card>

      {isEditing && onDelete && (
        <Button
          title={t('Supprimer')}
          symbol={SymbolNames.trash}
          variant="destructive"
          onPress={handleDelete}
          style={styles.action}
        />
      )}
    </Sheet>
  );
}

const styles = StyleSheet.create({
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginHorizontal: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 52,
    paddingHorizontal: 16,
  },
  rowLabel: {
    flex: 1,
  },
  error: {
    paddingHorizontal: 32,
    paddingTop: 8,
  },
  input: {
    paddingHorizontal: 16,
    paddingVertical: 15,
  },
  notes: {
    minHeight: 96,
    textAlignVertical: 'top',
  },
  action: {
    marginTop: 32,
    marginHorizontal: 16,
  },
});
