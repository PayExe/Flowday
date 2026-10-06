import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Task } from '../../types/task';
import { hapticLight } from '../../utils/haptics';
import { resolveBlockColor, useTheme, withAlpha } from '../../theme';
import { Symbol, SymbolNames } from '../ui/Symbol';
import { symbolForEmoji } from '../ui/blockIcons';
import { Checkbox } from '../ui/Checkbox';
import { BLOCK_LARGE_THRESHOLD, BLOCK_MEDIUM_THRESHOLD } from './HourMarker';
import { useTranslation } from '../../i18n';

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
  onFocusTask?: (task: Task) => void;
  onPress?: () => void;
}

const TASK_ROW_HEIGHT = 26;

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
  const { colors, typography, isDark } = useTheme();
  const { t } = useTranslation();
  const tint = resolveBlockColor(color, isDark);
  const blockSymbol = symbolForEmoji(emoji);
  const displayTitle = title || name;
  const timeRange = `${startTime} – ${endTime}`;
  const isLarge = height >= BLOCK_LARGE_THRESHOLD;
  const isMedium = height >= BLOCK_MEDIUM_THRESHOLD;

  const maxVisible = isLarge ? Math.max(1, Math.floor((height - 64) / TASK_ROW_HEIGHT)) : 0;
  const fitsAll = tasks.length <= maxVisible;
  const visibleTasks = fitsAll ? tasks : tasks.slice(0, Math.max(0, maxVisible - 1));
  const remainingTasks = tasks.length - visibleTasks.length;

  return (
    <Pressable
      onPress={onPress}
      accessibilityLabel={`${displayTitle}, ${timeRange}`}
      style={styles.pressable}
    >
      <View
        style={[
          styles.block,
          {
            backgroundColor: withAlpha(tint, isActive ? (isDark ? 0.4 : 0.26) : isDark ? 0.24 : 0.14),
          },
          isActive && { borderWidth: 1.5, borderColor: withAlpha(tint, 0.9) },
        ]}
      >
        <View style={[styles.accent, { backgroundColor: tint }]} />

        <View style={[styles.content, !isMedium && styles.contentCompact]}>
          <View style={styles.titleRow}>
            {blockSymbol ? (
              <Symbol name={blockSymbol} size={isMedium ? 15 : 12} weight="semibold" color={tint} />
            ) : (
              <Text style={{ fontSize: isMedium ? 15 : 12 }}>{emoji}</Text>
            )}
            <Text
              numberOfLines={1}
              style={[
                isMedium ? typography.subheadline : typography.caption,
                styles.title,
                { color: colors.text.primary },
              ]}
            >
              {displayTitle}
            </Text>
            {!isMedium && <Text style={typography.caption}>{timeRange}</Text>}
            {isMedium && !isLarge && tasks.length > 0 && (
              <Text style={typography.caption}>{t('tasksCount', { count: tasks.length })}</Text>
            )}
          </View>

          {isMedium && <Text style={[typography.caption, styles.time]}>{timeRange}</Text>}

          {isLarge && tasks.length > 0 && (
            <View style={styles.tasks}>
              {visibleTasks.map((task) => (
                <Pressable
                  key={task.id}
                  style={styles.task}
                  onPress={(event) => {
                    event.stopPropagation();
                    hapticLight();
                    if (onTaskPress) onTaskPress(task);
                    else onToggleTask(task.id);
                  }}
                >
                  <Checkbox
                    size={18}
                    checked={task.completed}
                    onToggle={() => onToggleTask(task.id)}
                    color={colors.text.secondary}
                    accessibilityLabel={task.title}
                  />
                  <Text
                    numberOfLines={1}
                    style={[
                      typography.footnote,
                      styles.taskTitle,
                      { color: task.completed ? colors.text.tertiary : colors.text.primary },
                      task.completed && styles.done,
                    ]}
                  >
                    {task.title}
                  </Text>
                  {onFocusTask && !task.completed && (
                    <Pressable
                      hitSlop={8}
                      accessibilityRole="button"
                      accessibilityLabel={`${t('Démarrer Focus pour')} ${task.title}`}
                      onPress={(event) => {
                        event.stopPropagation();
                        hapticLight();
                        onFocusTask(task);
                      }}
                    >
                      <Symbol name={SymbolNames.timer} size={17} color={colors.text.primary} />
                    </Pressable>
                  )}
                </Pressable>
              ))}
              {remainingTasks > 0 && (
                <Text style={typography.caption}>{t('otherCount', { count: remainingTasks })}</Text>
              )}
            </View>
          )}
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressable: {
    height: '100%',
    paddingVertical: 1.5,
  },
  block: {
    flex: 1,
    flexDirection: 'row',
    borderRadius: 12,
    borderCurve: 'continuous',
    overflow: 'hidden',
  },
  accent: {
    width: 4,
  },
  content: {
    flex: 1,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  contentCompact: {
    paddingVertical: 0,
    justifyContent: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  title: {
    flex: 1,
    fontWeight: '600',
  },
  time: {
    marginTop: 2,
  },
  tasks: {
    marginTop: 8,
    gap: 6,
  },
  task: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    minHeight: 20,
  },
  taskTitle: {
    flex: 1,
  },
  done: {
    textDecorationLine: 'line-through',
  },
});
