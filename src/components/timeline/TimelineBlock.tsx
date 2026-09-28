import { View, Text, Pressable } from 'react-native';
import { StyleSheet } from 'react-native';
import { Task } from '../../types/task';
import { hapticLight } from '../../utils/haptics';
import { useTheme } from '../../theme';
import { Symbol, SymbolNames } from '../ui/Symbol';
import { BLOCK_LARGE_THRESHOLD, BLOCK_MEDIUM_THRESHOLD, BLOCK_MIN_HEIGHT } from './HourMarker';

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
  onTaskPress?: (task: Task) => void;
  onFocusTask?: (taskId: string, taskTitle: string) => void;
  onPress?: () => void;
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
  onTaskPress,
  onFocusTask,
  onPress,
}: TimelineBlockProps) {
  const { colors, typography } = useTheme();
  const displayTitle = title || name;
  const timeRange = `${startTime}–${endTime}`;
  const isLarge = height >= BLOCK_LARGE_THRESHOLD;
  const isMedium = height >= BLOCK_MEDIUM_THRESHOLD;
  const visibleTasks = isLarge ? tasks.slice(0, 3) : tasks.slice(0, 1);
  const remainingTasks = tasks.length - visibleTasks.length;

  return (
    <Pressable onPress={onPress} style={{ height: '100%', paddingVertical: 2 }}>
      <View
        style={[
          styles.block,
          {
            minHeight: Math.min(BLOCK_MIN_HEIGHT, height),
            borderLeftColor: color,
            backgroundColor: isActive ? colors.bg.hover : colors.bg.secondary,
          },
        ]}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, flex: isMedium ? undefined : 1 }}>
          <Text style={{ fontSize: isMedium ? typography.sizes.base : typography.sizes.xs }}>{emoji}</Text>
          <Text numberOfLines={1} style={{ flex: 1, fontSize: isMedium ? typography.sizes.base : typography.sizes.xs, fontWeight: typography.weights.medium, color: colors.text.primary }}>
            {displayTitle}
          </Text>
          {!isLarge && <Text numberOfLines={1} style={{ fontSize: typography.sizes.xs, color: colors.text.quaternary }}>{isMedium ? timeRange : `· ${timeRange}`}</Text>}
          {!isMedium && tasks.length > 0 && (
            <Text style={{ fontSize: typography.sizes.xs, color: colors.text.secondary }}>{tasks.length} tâche{tasks.length > 1 ? 's' : ''}</Text>
          )}
        </View>

        {isLarge && (
          <Text style={{ fontSize: typography.sizes.xs, color: colors.text.quaternary, marginTop: 1 }}>{timeRange}</Text>
        )}

        {isMedium && tasks.length > 0 && (
          <View style={{ marginTop: 4, gap: 4 }}>
            {visibleTasks.map((task) => (
              <Pressable
                key={task.id}
                style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}
                onPress={(event) => { event.stopPropagation(); hapticLight(); onTaskPress ? onTaskPress(task) : onToggleTask(task.id); }}
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
            {remainingTasks > 0 && (
              <Text style={{ fontSize: typography.sizes.xs, color: colors.text.quaternary }}>
                +{remainingTasks} autres
              </Text>
            )}
          </View>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  block: {
    flex: 1,
    borderRadius: 10,
    borderLeftWidth: 3,
    padding: 6,
    overflow: 'hidden',
  },
});
