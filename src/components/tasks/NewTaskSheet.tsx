import { useEffect, useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import { Priority } from '../../types/task';
import { LifeBlock } from '../../types/lifeBlock';
import { useTheme } from '../../theme';
import { useTranslation } from '../../i18n';
import { hapticSuccess } from '../../utils/haptics';
import { Card, Chip } from '../ui/List';
import { SegmentedControl } from '../ui/SegmentedControl';
import { FieldLabel, Sheet } from '../ui/Sheet';
import { TaskDateField } from './TaskDateField';
import { usePriorityOptions } from './TaskDetailSheet';

interface NewTaskSheetProps {
  visible: boolean;
  blocks: LifeBlock[];
  /** The day the caller is looking at, pre-selected in the date field. */
  defaultDate: string;
  onClose: () => void;
  onAdd: (task: {
    title: string;
    priority: Priority;
    lifeBlockId?: string;
    scheduledDate: string;
  }) => void;
}

export function NewTaskSheet({ visible, blocks, defaultDate, onClose, onAdd }: NewTaskSheetProps) {
  const { colors, typography } = useTheme();
  const { t } = useTranslation();
  const priorities = usePriorityOptions();
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [lifeBlockId, setLifeBlockId] = useState<string | undefined>(undefined);
  const [scheduledDate, setScheduledDate] = useState(defaultDate);

  useEffect(() => {
    if (!visible) return;
    setTitle('');
    setPriority('medium');
    setLifeBlockId(undefined);
    setScheduledDate(defaultDate);
  }, [visible, defaultDate]);

  const canSubmit = title.trim().length > 0;

  const submit = () => {
    if (!canSubmit) return;
    hapticSuccess();
    onAdd({ title: title.trim(), priority, lifeBlockId, scheduledDate });
    onClose();
  };

  return (
    <Sheet
      visible={visible}
      title={t('Nouvelle tâche')}
      onClose={onClose}
      onConfirm={submit}
      confirmLabel={t('Ajouter')}
      confirmDisabled={!canSubmit}
    >
      <Card>
        <TextInput
          value={title}
          onChangeText={setTitle}
          onSubmitEditing={submit}
          style={[typography.body, styles.input]}
          placeholder={t('Titre de la tâche')}
          placeholderTextColor={colors.text.placeholder}
          returnKeyType="done"
          autoFocus
        />
      </Card>

      <FieldLabel>{t('Date')}</FieldLabel>
      <TaskDateField value={scheduledDate} onChange={setScheduledDate} />

      <FieldLabel>{t('Priorité')}</FieldLabel>
      <View style={styles.inset}>
        <SegmentedControl options={priorities} value={priority} onChange={setPriority} />
      </View>

      {blocks.length > 0 && (
        <>
          <FieldLabel>{t('Bloc lié')}</FieldLabel>
          <View style={styles.chips}>
            <Chip
              label={t('Sans bloc')}
              selected={lifeBlockId === undefined}
              onPress={() => setLifeBlockId(undefined)}
            />
            {blocks.map((block) => (
              <Chip
                key={block.id}
                label={block.name}
                emoji={block.emoji}
                color={block.color}
                selected={lifeBlockId === block.id}
                onPress={() => setLifeBlockId(block.id)}
              />
            ))}
          </View>
        </>
      )}
    </Sheet>
  );
}

const styles = StyleSheet.create({
  input: {
    paddingHorizontal: 16,
    paddingVertical: 15,
  },
  inset: {
    marginHorizontal: 16,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginHorizontal: 16,
  },
});
