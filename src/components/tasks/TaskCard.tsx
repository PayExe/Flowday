import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Task } from '../../types/task';
import { hapticLight } from '../../utils/haptics';

interface TaskCardProps {
  task: Task;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

function priorityColor(priority: string): string {
  switch (priority) {
    case 'high': return '#FF453A';
    case 'medium': return '#FFD60A';
    case 'low': return '#8E8E93';
    default: return '#8E8E93';
  }
}

export function TaskCard({ task, onToggle, onDelete }: TaskCardProps) {
  const done = task.completed;
  const pColor = priorityColor(task.priority);

  return (
    <Pressable
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'flex-start',
        paddingHorizontal: 16,
        paddingVertical: 10,
        backgroundColor: pressed ? '#2C2C2E' : 'transparent',
        gap: 12,
      })}
    >
      {/* Cercle checkbox — Things 3 */}
      <Pressable
        onPress={() => { hapticLight(); onToggle(task.id); }}
        hitSlop={8}
        style={{
          width: 22,
          height: 22,
          borderRadius: 11,
          borderWidth: done ? 0 : 2,
          borderColor: done ? 'transparent' : pColor,
          backgroundColor: done ? pColor : 'transparent',
          alignItems: 'center',
          justifyContent: 'center',
          marginTop: 1,
        }}
      >
        {done && (
          <Ionicons name="checkmark" size={13} color="#FFFFFF" />
        )}
      </Pressable>

      {/* Contenu */}
      <View style={{ flex: 1 }}>
        <Text
          style={{
            fontSize: 17,
            color: done ? '#EBEBF54D' : '#FFFFFF',
            letterSpacing: -0.41,
            textDecorationLine: done ? 'line-through' : 'none',
          }}
        >
          {task.title}
        </Text>
      </View>

      {/* Badge priorité (discret) */}
      {task.priority === 'high' && !done && (
        <Ionicons name="flag-outline" size={14} color="#FF453A" style={{ marginTop: 3 }} />
      )}
    </Pressable>
  );
}
