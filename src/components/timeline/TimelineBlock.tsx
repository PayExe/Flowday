import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Task } from '../../types/task';
import { hapticLight } from '../../utils/haptics';

interface TimelineBlockProps {
  emoji: string;
  name: string;
  title?: string;
  color: string;
  startTime: string;
  endTime: string;
  height: number;
  tasks: Task[];
  isActive: boolean;
  onToggleTask: (taskId: string) => void;
  onFocusTask?: (taskId: string, taskTitle: string) => void;
}

function formatDuration(start: string, end: string): string {
  const [sh, sm] = start.split(':').map(Number);
  const [eh, em] = end.split(':').map(Number);
  const min = (eh * 60 + em) - (sh * 60 + sm);
  const h = Math.floor(min / 60);
  const m = min % 60;
  if (h > 0 && m > 0) return `${h}h${m}`;
  if (h > 0) return `${h}h`;
  return `${m}min`;
}

export function TimelineBlock({
  emoji,
  name,
  title,
  color,
  startTime,
  endTime,
  height,
  tasks,
  isActive,
  onToggleTask,
  onFocusTask,
}: TimelineBlockProps) {
  const displayTitle = title || name;
  const duration = formatDuration(startTime, endTime);

  return (
    <View style={{ flexDirection: 'row', marginBottom: 2 }}>
      {/* Colonne heure */}
      <View style={{ width: 52, alignItems: 'flex-end', paddingRight: 10, paddingTop: 10 }}>
        <Text style={{ fontSize: 12, color: '#EBEBF54D' }}>{startTime}</Text>
      </View>

      {/* Bloc */}
      <View
        style={[
          styles.block,
          {
            borderLeftColor: color,
            backgroundColor: isActive ? '#2C2C2E' : '#1C1C1E',
          },
        ]}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Text style={{ fontSize: 14 }}>{emoji}</Text>
          <Text style={{ fontSize: 15, fontWeight: '500', color: '#FFFFFF', flex: 1 }}>
            {displayTitle}
          </Text>
          <Text style={{ fontSize: 12, color: '#EBEBF54D' }}>{duration}</Text>
        </View>

        {/* Tâches du bloc */}
        {tasks.length > 0 && (
          <View style={{ marginTop: 8, gap: 4 }}>
            {tasks.slice(0, 3).map((task) => (
              <Pressable
                key={task.id}
                style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}
                onPress={() => { hapticLight(); onToggleTask(task.id); }}
              >
                <View
                  style={{
                    width: 5,
                    height: 5,
                    borderRadius: 3,
                    backgroundColor: task.completed ? '#30D158' : '#48484A',
                  }}
                />
                <Text
                  style={{
                    fontSize: 13,
                    color: task.completed ? '#EBEBF54D' : '#EBEBF599',
                    textDecorationLine: task.completed ? 'line-through' : 'none',
                    flex: 1,
                  }}
                  numberOfLines={1}
                >
                  {task.title}
                </Text>
              </Pressable>
            ))}
            {tasks.length > 3 && (
              <Text style={{ fontSize: 12, color: '#EBEBF54D' }}>
                +{tasks.length - 3} autres
              </Text>
            )}
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  block: {
    flex: 1,
    backgroundColor: '#1C1C1E',
    borderRadius: 10,
    borderLeftWidth: 3,
    padding: 10,
    marginRight: 16,
    minHeight: 52,
  },
});
