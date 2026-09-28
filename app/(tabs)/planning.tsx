import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  StyleSheet,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTaskStore } from '../../src/features/tasks/store';
import { useTemplateStore } from '../../src/features/templates/store';
import { useLifeBlocksStore } from '../../src/features/lifeBlocks/store';
import { useDayScoreStore } from '../../src/features/dayScore/store';
import { useFocusStore } from '../../src/features/focus/store';
import { useRitualStore } from '../../src/features/rituals/store';
import { useTheme } from '../../src/theme';
import { Symbol, SymbolNames } from '../../src/components/ui/Symbol';
import { PageInfo } from '../../src/components/ui/PageInfo';
import { TimelineBlock } from '../../src/components/timeline/TimelineBlock';
import { CurrentTimeLine } from '../../src/components/timeline/CurrentTimeLine';
import { FreeSlot } from '../../src/components/timeline/FreeSlot';
import { HourMarker, HOUR_HEIGHT, START_HOUR, END_HOUR, MINUTES_PER_HOUR, HOUR_LABEL_WIDTH, timelineY } from '../../src/components/timeline/HourMarker';
import { TaskCard } from '../../src/components/tasks/TaskCard';
import { TaskDetailSheet } from '../../src/components/tasks/TaskDetailSheet';
import { BlockDetailSheet } from '../../src/components/timeline/BlockDetailSheet';
import { EmptyState } from '../../src/components/shared/EmptyState';
import { hapticLight } from '../../src/utils/haptics';
import { Task } from '../../src/types/task';


function todayISO(): string {
  return new Date().toISOString().split('T')[0];
}

function formatDateFr(date: Date): string {
  const days = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];
  const months = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
  return `${days[date.getDay()]} ${date.getDate()} ${months[date.getMonth()]}`;
}

function timeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

function currentMinutesSinceStart(): number {
  const now = new Date();
  return now.getHours() * 60 + now.getMinutes() - START_HOUR * 60;
}

function formatDuration(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  if (m === 0) return `${h}h`;
  return `${h}h${m.toString().padStart(2, '0')}`;
}

interface TimelineItem {
  type: 'block' | 'free';
  startMinutes: number;
  endMinutes: number;
  data?: any;
}


export default function PlanningScreen() {
  const router = useRouter();
  const { colors, typography } = useTheme();
  const scrollRef = useRef<ScrollView>(null);
  const [nowY, setNowY] = useState(timelineY(currentMinutesSinceStart()));
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [selectedBlockId, setSelectedBlockId] = useState<string | undefined>(undefined);
  const [selectedTaskId, setSelectedTaskId] = useState<string | undefined>(undefined);
  const [selectedTimelineBlock, setSelectedTimelineBlock] = useState<{
    title: string;
    timeRange: string;
    color: string;
    tasks: Task[];
  }>();

  const tasks = useTaskStore((state) => state.tasks);
  const addTask = useTaskStore((state) => state.addTask);
  const toggleTask = useTaskStore((state) => state.toggleTask);
  const deleteTask = useTaskStore((state) => state.deleteTask);
  const updateTask = useTaskStore((state) => state.updateTask);
  const getTodayTasks = useTaskStore((state) => state.getTodayTasks);
  const getTodayTasksByLifeBlock = useTaskStore((state) => state.getTodayTasksByLifeBlock);

  const getActiveTemplate = useTemplateStore((state) => state.getActiveTemplate);
  const getTodayBlocks = useTemplateStore((state) => state.getTodayBlocks);
  const templates = useTemplateStore((state) => state.templates);
  const activeTemplateId = useTemplateStore((state) => state.activeTemplateId);

  const getBlockById = useLifeBlocksStore((state) => state.getBlockById);
  const getActiveBlocks = useLifeBlocksStore((state) => state.getActiveBlocks);
  const lifeBlocks = useLifeBlocksStore((state) => state.blocks);

  const scores = useDayScoreStore((state) => state.scores);
  const updateBlockValidation = useDayScoreStore((state) => state.updateBlockValidation);
  const updateTasksPercent = useDayScoreStore((state) => state.updateTasksPercent);

  const startFocus = useFocusStore((state) => state.startFocus);

  const hasDoneMorningToday = useRitualStore((state) => state.hasDoneMorningToday);

  const activeBlocks = useMemo(() => getActiveBlocks(), [lifeBlocks, getActiveBlocks]);
  const todayTasks = useMemo(() => getTodayTasks(), [tasks, getTodayTasks]);
  const templateBlocks = useMemo(() => getTodayBlocks(), [templates, activeTemplateId, getTodayBlocks]);

  const hasTemplate = getActiveTemplate() !== undefined;
  const morningDone = hasDoneMorningToday();

  useEffect(() => {
    const today = todayISO();
    const completed = todayTasks.filter((t) => t.completed).length;
    const total = todayTasks.length;
    updateTasksPercent(today, completed, total);

    const plannedLifeBlockIds = Array.from(new Set(templateBlocks.map((b) => b.lifeBlockId)));
    const plannedBlocks = activeBlocks.filter((b) => plannedLifeBlockIds.includes(b.id));
    const blocksWithCompletedTasks = plannedBlocks.filter((block) =>
      todayTasks.some((t) => t.lifeBlockId === block.id && t.completed)
    );
    updateBlockValidation(today, blocksWithCompletedTasks.length, plannedBlocks.length);
  }, [tasks, activeBlocks, todayTasks, templateBlocks, updateTasksPercent, updateBlockValidation]);

  const todayScore = useMemo(() => {
    return scores.find((s) => s.date === todayISO());
  }, [scores]);

  const dayScore = todayScore?.total || 0;

  useEffect(() => {
    if (!hasTemplate || activeBlocks.length === 0) return;
    const y = timelineY(currentMinutesSinceStart()) - 120;
    const timer = setTimeout(() => {
      scrollRef.current?.scrollTo({ y: Math.max(0, y), animated: true });
    }, 300);
    return () => clearTimeout(timer);
  }, [hasTemplate, activeBlocks.length]);

  useEffect(() => {
    const interval = setInterval(() => {
      setNowY(timelineY(currentMinutesSinceStart()));
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleAddTask = useCallback(() => {
    if (!newTaskTitle.trim()) return;
    hapticLight();
    addTask({
      title: newTaskTitle.trim(),
      completed: false,
      priority: 'medium',
      lifeBlockId: selectedBlockId,
      scheduledDate: todayISO(),
    });
    setNewTaskTitle('');
    setSelectedBlockId(undefined);
  }, [newTaskTitle, selectedBlockId, addTask]);

  const timelineItems = useMemo(() => {
    const sorted = [...templateBlocks].sort((a, b) =>
      a.startTime.localeCompare(b.startTime)
    );

    const items: TimelineItem[] = [];
    let cursor = START_HOUR * 60;

    for (const block of sorted) {
      const blockStart = timeToMinutes(block.startTime);
      const blockEnd = timeToMinutes(block.endTime);

      if (blockStart > cursor) {
        items.push({
          type: 'free',
          startMinutes: cursor,
          endMinutes: blockStart,
        });
      }

      items.push({
        type: 'block',
        startMinutes: blockStart,
        endMinutes: blockEnd,
        data: block,
      });

      cursor = Math.max(cursor, blockEnd);
    }

    const endMinutes = END_HOUR * 60;
    if (cursor < endMinutes) {
      items.push({
        type: 'free',
        startMinutes: cursor,
        endMinutes,
      });
    }

    return items;
  }, [templateBlocks]);

  const plannedMinutes = useMemo(() => {
    return templateBlocks.reduce((sum, b) => {
      return sum + (timeToMinutes(b.endTime) - timeToMinutes(b.startTime));
    }, 0);
  }, [templateBlocks]);

  const handleToggleTask = useCallback((taskId: string) => {
    toggleTask(taskId);
  }, [toggleTask]);

  const handleFocusTask = useCallback((taskId: string, taskTitle: string) => {
    startFocus(taskId, taskTitle);
    router.push('/focus');
  }, [startFocus, router]);

  const handleDeleteTask = useCallback((taskId: string) => {
    deleteTask(taskId);
    setSelectedTaskId(undefined);
  }, [deleteTask]);

  const selectedTask = todayTasks.find((task) => task.id === selectedTaskId);

  if (!hasTemplate) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.bg.primary }]} edges={['top']}>
        <View style={styles.header}>
          <Text style={[typography.screenTitle, { color: colors.text.primary }]}>Planning</Text>
          <Text style={[typography.subheadline, { color: colors.text.secondary }]}>{formatDateFr(new Date())}</Text>
        </View>
        <EmptyState
          icon="calendar-outline"
          title="Aucun template actif"
          subtitle="Crée ta semaine type dans l'onglet Semaine pour voir ta timeline"
        />
      </SafeAreaView>
    );
  }

  if (activeBlocks.length === 0) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.bg.primary }]} edges={['top']}>
        <View style={styles.header}>
          <Text style={[typography.screenTitle, { color: colors.text.primary }]}>Planning</Text>
          <Text style={[typography.subheadline, { color: colors.text.secondary }]}>{formatDateFr(new Date())}</Text>
        </View>
        <EmptyState
          icon="cube-outline"
          title="Aucun Life Block"
          subtitle="Crée tes blocs de vie dans l'onglet Blocs pour commencer"
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bg.primary }]} edges={['top']}>
      <View style={styles.header}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={[typography.screenTitle, { color: colors.text.primary }]}>{formatDateFr(new Date())}</Text>
          <PageInfo
            title="Planning"
            description="La timeline de ta journée, heure par heure, avec tes tâches et tes blocs."
            points={[
              'La barre rouge indique l’heure actuelle.',
              'Appuie sur un bloc pour voir son détail et ses tâches.',
              'Ajoute une tâche en haut, puis associe-la à un bloc si besoin.',
            ]}
          />
        </View>
        <Text style={[typography.subheadline, { color: colors.text.secondary, marginTop: 2 }]}>
          {formatDuration(plannedMinutes)} planifiées
        </Text>
      </View>

      <View style={{ height: 0.5, backgroundColor: colors.separator.default, marginHorizontal: 16 }} />

      <ScrollView
        ref={scrollRef}
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={32}
        contentContainerStyle={styles.scrollContent}
      >
        {!morningDone && (
          <Pressable
            style={({ pressed }) => ({
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: pressed ? colors.bg.hover : colors.bg.secondary,
              borderRadius: 13,
              marginHorizontal: 16,
              marginTop: 16,
              paddingHorizontal: 16,
              paddingVertical: 14,
              borderLeftWidth: 3,
              borderLeftColor: colors.system.orange,
            })}
            onPress={() => router.push('/morning-ritual')}
          >
            <Symbol name={SymbolNames.sun} size={18} color={colors.system.orange} style={{ marginRight: 10 }} />
            <Text style={{ flex: 1, fontSize: typography.sizes.base, color: colors.text.primary, fontWeight: typography.weights.medium }}>
              Commencer la journée
            </Text>
            <Symbol name={SymbolNames.chevronRight} size={14} color={colors.text.tertiary} />
          </Pressable>
        )}

        <View style={{ marginHorizontal: 16, marginTop: 16 }}>
          <View
            style={{
              backgroundColor: colors.bg.secondary,
              borderRadius: 13,
              overflow: 'hidden',
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 4 }}>
              <Pressable
                onPress={handleAddTask}
                hitSlop={8}
                accessibilityRole="button"
                accessibilityLabel="Ajouter la tâche"
              >
                <Symbol name={SymbolNames.add} size={22} color={colors.system.blue} />
              </Pressable>
              <TextInput
                style={{
                  flex: 1,
                  fontSize: typography.sizes.lg,
                  color: colors.text.primary,
                  letterSpacing: -0.41,
                  paddingVertical: 10,
                  marginLeft: 4,
                }}
                placeholder="Nouvelle tâche..."
                placeholderTextColor={colors.text.secondary}
                value={newTaskTitle}
                onChangeText={setNewTaskTitle}
                onSubmitEditing={handleAddTask}
                returnKeyType="done"
              />
            </View>

          </View>

          <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 12, paddingVertical: 8, paddingRight: 20 }}
              style={{ marginTop: 8, backgroundColor: colors.bg.secondary, borderRadius: 13 }}
            >
              <Pressable
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingHorizontal: 10,
                  paddingVertical: 5,
                  backgroundColor: selectedBlockId === undefined ? colors.bg.hover : 'transparent',
                  borderRadius: 8,
                  marginRight: 6,
                }}
                onPress={() => setSelectedBlockId(undefined)}
              >
                <Text style={{ fontSize: typography.sizes.sm, color: selectedBlockId === undefined ? colors.text.primary : colors.text.secondary }}>
                  Sans bloc
                </Text>
              </Pressable>
              {activeBlocks.map((block) => (
                <Pressable
                  key={block.id}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 4,
                    paddingHorizontal: 10,
                    paddingVertical: 5,
                    backgroundColor: selectedBlockId === block.id ? colors.bg.hover : 'transparent',
                    borderRadius: 8,
                    marginRight: 6,
                  }}
                  onPress={() =>
                    setSelectedBlockId(selectedBlockId === block.id ? undefined : block.id)
                  }
                >
                  <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: block.color }} />
                  <Text style={{ fontSize: typography.sizes.sm, color: selectedBlockId === block.id ? colors.text.primary : colors.text.secondary }}>
                    {block.name}
                  </Text>
                </Pressable>
              ))}
          </ScrollView>
        </View>

        {todayTasks.length > 0 && (
          <View style={{ marginTop: 24 }}>
            <Text
              style={[
                typography.sectionHeader,
                { paddingHorizontal: 32, paddingBottom: 8 },
              ]}
            >
              Tâches
            </Text>
            <View
              style={{
                backgroundColor: colors.bg.secondary,
                borderRadius: 13,
                marginHorizontal: 16,
                overflow: 'hidden',
              }}
            >
              {todayTasks.map((task, index) => (
                <View key={task.id}>
                  <TaskCard
                    task={task}
                    onToggle={handleToggleTask}
                    onDelete={handleDeleteTask}
                    lifeBlock={task.lifeBlockId ? getBlockById(task.lifeBlockId) : undefined}
                    onPress={() => setSelectedTaskId(task.id)}
                  />
                  {index < todayTasks.length - 1 && (
                    <View style={{ height: 0.5, backgroundColor: colors.separator.hairline, marginLeft: 57 }} />
                  )}
                </View>
              ))}
            </View>
          </View>
        )}

        <View style={{ marginTop: 24 }}>
          <Text
            style={[
              typography.sectionHeader,
              { paddingHorizontal: 32, paddingBottom: 8 },
            ]}
          >
            Planning
          </Text>

          <View style={styles.timelineContainer}>
            <View style={styles.hourLabels} pointerEvents="none">
              {Array.from({ length: END_HOUR - START_HOUR + 1 }, (_, i) => (
                <View key={i} style={{ position: 'absolute', top: timelineY(i * MINUTES_PER_HOUR), left: 0 }}>
                  <HourMarker hour={START_HOUR + i} />
                </View>
              ))}
            </View>

            <View style={styles.timelineContent}>
              {Array.from({ length: END_HOUR - START_HOUR + 1 }, (_, i) => (
                <View key={`line-${i}`} style={[styles.hourLine, { top: timelineY(i * MINUTES_PER_HOUR), backgroundColor: colors.separator.hairline }]} />
              ))}

              {timelineItems.map((item, index) => {
                const top = timelineY(item.startMinutes - START_HOUR * MINUTES_PER_HOUR);
                const height = timelineY(item.endMinutes - item.startMinutes);

                if (item.type === 'free') {
                  return (
                    <View
                      key={`free-${index}`}
                      style={[styles.itemAbsolute, { top, height }]}
                    >
                      <FreeSlot height={height} duration={item.endMinutes - item.startMinutes} />
                    </View>
                  );
                }

                const block = item.data;
                const lifeBlock = getBlockById(block.lifeBlockId);
                const blockTasks = lifeBlock
                  ? getTodayTasksByLifeBlock(lifeBlock.id)
                  : [];

                const nowMin = currentMinutesSinceStart() + START_HOUR * 60;
                const isActive =
                  nowMin >= item.startMinutes && nowMin < item.endMinutes;

              return (
                <View
                  key={`block-${block.id}`}
                  style={[styles.itemAbsolute, { top, height }]}
                >
                  <TimelineBlock
                    emoji={lifeBlock?.emoji || '⬜'}
                    name={lifeBlock?.name || 'Bloc'}
                    title={block.title}
                    color={lifeBlock?.color || '#8E8E93'}
                    startTime={block.startTime}
                    endTime={block.endTime}
                    height={height}
                    tasks={blockTasks}
                    isActive={isActive}
                    onToggleTask={handleToggleTask}
                    onTaskPress={(task) => setSelectedTaskId(task.id)}
                    onFocusTask={handleFocusTask}
                    onPress={() => setSelectedTimelineBlock({
                      title: block.title || lifeBlock?.name || 'Bloc',
                      timeRange: `${block.startTime}–${block.endTime}`,
                      color: lifeBlock?.color || '#8E8E93',
                      tasks: blockTasks,
                    })}
                  />
                </View>
                );
              })}
            </View>

            <View
              style={[
                styles.itemAbsolute,
                { top: nowY, height: 20, zIndex: 10 },
              ]}
            >
              <CurrentTimeLine />
            </View>
          </View>
        </View>
      </ScrollView>

      <TaskDetailSheet
        task={selectedTask}
        blocks={activeBlocks}
        onClose={() => setSelectedTaskId(undefined)}
        onUpdate={updateTask}
        onDelete={handleDeleteTask}
      />
      {selectedTimelineBlock && (
        <BlockDetailSheet
          visible
          title={selectedTimelineBlock.title}
          timeRange={selectedTimelineBlock.timeRange}
          color={selectedTimelineBlock.color}
          tasks={selectedTimelineBlock.tasks.map((task) => tasks.find((currentTask) => currentTask.id === task.id) || task)}
          onClose={() => setSelectedTimelineBlock(undefined)}
          onToggleTask={handleToggleTask}
        />
      )}

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },


  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 140,
  },
  timelineContainer: {
    position: 'relative',
    height: (END_HOUR - START_HOUR) * HOUR_HEIGHT,
    marginHorizontal: 16,
    marginTop: 16,
  },
  hourLabels: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    width: HOUR_LABEL_WIDTH,
  },
  timelineContent: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: HOUR_LABEL_WIDTH,
    right: 0,
  },
  hourLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 0.5,
  },
  itemAbsolute: {
    position: 'absolute',
    left: 0,
    right: 0,
  },
});
