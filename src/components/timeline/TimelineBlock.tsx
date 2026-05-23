import { View, Text, Pressable } from 'react-native';
import { StyleSheet } from 'react-native';
import { Task } from '../../types/task';
import { hapticLight } from '../../utils/haptics';
import { useTheme } from '../../theme';
import { Symbol, SymbolNames } from '../ui/Symbol';

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
  const { colors } = useTheme();
  const displayTitle = title || name;
  const duration = formatDuration(startTime, endTime);

  return (
    <View style={{ flexDirection: 'row', marginBottom: 2 }}>
      {/* Colonne heure */}
      <View style={{ width: 52, alignItems: 'flex-end', paddingRight: 10, paddingTop: 10 }}>
        <Text style={{ fontSize: 12, color: colors.text.quaternary }}>{startTime}</Text>
      </View>

      {/* Bloc */}
      <View
        style={[
          styles.block,
          {
            borderLeftColor: color,
            backgroundColor: isActive ? colors.bg.hover : colors.bg.secondary,
          },
        ]}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Text style={{ fontSize: 14 }}>{emoji}</Text>
          <Text style={{ fontSize: 15, fontWeight: '500', color: colors.text.primary, flex: 1 }}>
            {displayTitle}
          </Text>
          <Text style={{ fontSize: 12, color: colors.text.quaternary }}>{duration}</Text>
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
                    backgroundColor: task.completed ? colors.system.green : colors.system.gray3,
                  }}
                />
                <Text
                  style={{
                    fontSize: 13,
                    color: task.completed ? colors.text.quaternary : colors.text.secondary,
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
              <Text style={{ fontSize: 12, color: colors.text.quaternary }}>
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
    borderRadius: 10,
    borderLeftWidth: 3,
    padding: 10,
    marginRight: 16,
    minHeight: 52,
  },
});
