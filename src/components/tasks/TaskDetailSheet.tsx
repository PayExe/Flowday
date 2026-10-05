import { useEffect, useState } from 'react';
import { Alert, StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import { Priority, Task } from '../../types/task';
import { LifeBlock } from '../../types/lifeBlock';
import { useTheme } from '../../theme';
import { useTranslation } from '../../i18n';
import { Button } from '../ui/Glass';
import { Card, Chip, List } from '../ui/List';
import { SegmentedControl } from '../ui/SegmentedControl';
import { FieldLabel, Sheet } from '../ui/Sheet';
import { SymbolNames } from '../ui/Symbol';

interface TaskDetailSheetProps {
  task?: Task;
  blocks: LifeBlock[];
  onClose: () => void;
  onUpdate: (id: string, updates: Partial<Omit<Task, 'id' | 'createdAt'>>) => void;
  onDelete: (id: string) => void;
  onFocus?: (task: Task) => void;
}

export function usePriorityOptions(): { value: Priority; label: string }[] {
  const { t } = useTranslation();
  return [
    { value: 'low', label: t('Basse') },
    { value: 'medium', label: t('Moyenne') },
    { value: 'high', label: t('Haute') },
  ];
}

export function TaskDetailSheet({ task, blocks, onClose, onUpdate, onDelete, onFocus }: TaskDetailSheetProps) {
  const { colors, typography } = useTheme();
  const { t } = useTranslation();
  const priorities = usePriorityOptions();
  const [shown, setShown] = useState(task);
  const [title, setTitle] = useState(task?.title || '');

  useEffect(() => {
    if (task) setShown(task);
  }, [task]);

  useEffect(() => {
    setTitle(task?.title || '');
  }, [task?.id]);

  const current = task ?? shown;

  const updateTitle = (value: string) => {
    setTitle(value);
    if (current) onUpdate(current.id, { title: value });
  };

  const confirmDelete = () => {
    if (!current) return;
    Alert.alert(t('Supprimer cette tâche ?'), t('Cette action est irréversible.'), [
      { text: t('Annuler'), style: 'cancel' },
      { text: t('Supprimer'), style: 'destructive', onPress: () => { onDelete(current.id); onClose(); } },
    ]);
  };

  return (
    <Sheet visible={!!task} title={t('Détail de la tâche')} onClose={onClose}>
      {current && (
        <>
          <Card>
            <TextInput
              value={title}
              onChangeText={updateTitle}
              style={[typography.body, styles.input]}
              placeholder={t('Titre de la tâche')}
              placeholderTextColor={colors.text.placeholder}
              returnKeyType="done"
            />
          </Card>

          <List style={styles.group}>
            <View style={styles.row}>
              <Text style={[typography.body, styles.rowLabel]}>{t('Terminée')}</Text>
              <Switch
                value={current.completed}
                onValueChange={(completed) => onUpdate(current.id, { completed })}
                trackColor={{ true: colors.system.green }}
              />
            </View>
          </List>

          <FieldLabel>{t('Priorité')}</FieldLabel>
          <View style={styles.inset}>
            <SegmentedControl
              options={priorities}
              value={current.priority}
              onChange={(priority) => onUpdate(current.id, { priority })}
            />
          </View>

          <FieldLabel>{t('Bloc lié')}</FieldLabel>
          <View style={styles.chips}>
            <Chip
              label={t('Sans bloc')}
              selected={!current.lifeBlockId}
              onPress={() => onUpdate(current.id, { lifeBlockId: undefined })}
            />
            {blocks.map((block) => (
              <Chip
                key={block.id}
                label={block.name}
                emoji={block.emoji}
                color={block.color}
                selected={current.lifeBlockId === block.id}
                onPress={() => onUpdate(current.id, { lifeBlockId: block.id })}
              />
            ))}
          </View>

          <View style={styles.actions}>
            {onFocus && !current.completed && (
              <Button
                title={t('Démarrer une session Focus')}
                symbol={SymbolNames.timer}
                onPress={() => onFocus(current)}
              />
            )}
            <Button title={t('Supprimer la tâche')} variant="destructive" onPress={confirmDelete} />
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
  group: {
    marginTop: 16,
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
  inset: {
    marginHorizontal: 16,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginHorizontal: 16,
  },
  actions: {
    marginTop: 32,
    marginHorizontal: 16,
    gap: 12,
  },
});
