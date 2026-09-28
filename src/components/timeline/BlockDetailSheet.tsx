import { Modal, Pressable, ScrollView, Text, View } from 'react-native';
import { Task } from '../../types/task';
import { useTheme } from '../../theme';

interface BlockDetailSheetProps {
  title: string;
  timeRange: string;
  color: string;
  tasks: Task[];
  visible: boolean;
  onClose: () => void;
  onToggleTask: (id: string) => void;
}

export function BlockDetailSheet({ title, timeRange, color, tasks, visible, onClose, onToggleTask }: BlockDetailSheetProps) {
  const { colors, typography } = useTheme();
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: '#00000088' }} onPress={onClose}>
        <Pressable style={{ backgroundColor: colors.bg.secondary, borderTopLeftRadius: 16, borderTopRightRadius: 16, padding: 20, paddingBottom: 34, maxHeight: '70%' }} onPress={() => {}}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: color }} />
            <Text style={{ flex: 1, color: colors.text.primary, fontSize: typography.sizes.lg, fontWeight: typography.weights.medium }}>{title}</Text>
            <Text style={{ color: colors.text.secondary, fontSize: typography.sizes.sm }}>{timeRange}</Text>
          </View>
          <ScrollView style={{ marginTop: 16 }}>
            {tasks.map((task) => (
              <Pressable key={task.id} onPress={() => onToggleTask(task.id)} style={{ flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 10 }}>
                <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: task.completed ? colors.system.green : colors.system.gray3 }} />
                <Text style={{ color: task.completed ? colors.text.quaternary : colors.text.primary, textDecorationLine: task.completed ? 'line-through' : 'none', fontSize: typography.sizes.base }}>{task.title}</Text>
              </Pressable>
            ))}
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
