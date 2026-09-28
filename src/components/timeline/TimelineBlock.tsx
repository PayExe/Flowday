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
  const { colors, typography } = useTheme();
  const displayTitle = title || name;
  const timeRange = `${startTime}–${endTime}`;
  const showTasks = tasks.length > 0 && height >= 90;

  return (
    <View style={{ flexDirection: 'row', height: '100%', paddingVertical: 2 }}>
      <View style={{ width: 52 }} />

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
          <Text style={{ fontSize: typography.sizes.base }}>{emoji}</Text>
          <View style={{ flex: 1 }}>
            <Text numberOfLines={1} style={{ fontSize: typography.sizes.base, fontWeight: typography.weights.medium, color: colors.text.primary }}>
              {displayTitle}
            </Text>
            <Text style={{ fontSize: typography.sizes.xs, color: colors.text.quaternary, marginTop: 1 }}>
              {timeRange}
            </Text>
          </View>
        </View>

        {showTasks && (
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
                    fontSize: typography.sizes.sm,
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
              <Text style={{ fontSize: typography.sizes.xs, color: colors.text.quaternary }}>
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
    overflow: 'hidden',
  },
});
