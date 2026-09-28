import { useEffect, useState } from 'react';
import { Alert, Modal, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { Task } from '../../types/task';
import { LifeBlock } from '../../types/lifeBlock';
import { useTheme } from '../../theme';

interface TaskDetailSheetProps {
  task?: Task;
  blocks: LifeBlock[];
  onClose: () => void;
  onUpdate: (id: string, updates: Partial<Omit<Task, 'id' | 'createdAt'>>) => void;
  onDelete: (id: string) => void;
}

export function TaskDetailSheet({ task, blocks, onClose, onUpdate, onDelete }: TaskDetailSheetProps) {
  const { colors, typography } = useTheme();
  const [title, setTitle] = useState(task?.title || '');

  useEffect(() => {
    setTitle(task?.title || '');
  }, [task?.id, task?.title]);

  if (!task) return null;

  const updateTitle = (value: string) => {
    setTitle(value);
    onUpdate(task.id, { title: value });
  };

  const confirmDelete = () => {
    Alert.alert('Supprimer cette tâche ?', undefined, [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Supprimer', style: 'destructive', onPress: () => { onDelete(task.id); onClose(); } },
    ]);
  };

  return (
    <Modal visible transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: '#00000088' }} onPress={onClose}>
        <Pressable style={{ backgroundColor: colors.bg.secondary, borderTopLeftRadius: 16, borderTopRightRadius: 16, padding: 20, paddingBottom: 34, gap: 16 }} onPress={() => {}}>
          <Text style={{ fontSize: typography.sizes.lg, fontWeight: typography.weights.medium, color: colors.text.primary }}>Détail de la tâche</Text>
          <TextInput
            value={title}
            onChangeText={updateTitle}
            style={{ backgroundColor: colors.bg.tertiary, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, color: colors.text.primary, fontSize: typography.sizes.base }}
            placeholder="Titre"
            placeholderTextColor={colors.text.secondary}
          />
          <Pressable onPress={() => onUpdate(task.id, { completed: !task.completed })} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <Text style={{ color: colors.text.primary, fontSize: typography.sizes.base }}>État</Text>
            <Text style={{ color: task.completed ? colors.system.green : colors.text.secondary, fontSize: typography.sizes.base }}>{task.completed ? 'Fait' : 'À faire'}</Text>
          </Pressable>
          <Text style={{ color: colors.text.secondary, fontSize: typography.sizes.sm }}>Bloc lié</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
            <Pressable onPress={() => onUpdate(task.id, { lifeBlockId: undefined })} style={[styles.choice, { backgroundColor: !task.lifeBlockId ? colors.bg.hover : colors.bg.tertiary }]}>
              <Text style={{ color: colors.text.primary }}>Sans bloc</Text>
            </Pressable>
            {blocks.map((block) => (
              <Pressable key={block.id} onPress={() => onUpdate(task.id, { lifeBlockId: block.id })} style={[styles.choice, { backgroundColor: task.lifeBlockId === block.id ? colors.bg.hover : colors.bg.tertiary }]}>
                <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: block.color }} />
                <Text style={{ color: colors.text.primary }}>{block.name}</Text>
              </Pressable>
            ))}
          </ScrollView>
          <Pressable onPress={confirmDelete} style={{ paddingVertical: 10 }}>
            <Text style={{ textAlign: 'center', color: colors.system.red, fontSize: typography.sizes.base }}>Supprimer</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = {
  choice: { flexDirection: 'row' as const, alignItems: 'center' as const, gap: 5, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 8 },
};
