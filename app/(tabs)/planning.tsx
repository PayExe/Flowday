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
import { HourMarker, HOUR_HEIGHT, START_HOUR, END_HOUR } from '../../src/components/timeline/HourMarker';
import { TaskCard } from '../../src/components/tasks/TaskCard';
import { EmptyState } from '../../src/components/shared/EmptyState';
import { hapticLight } from '../../src/utils/haptics';


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
  const [nowY, setNowY] = useState(currentMinutesSinceStart() * (HOUR_HEIGHT / 60));
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [selectedBlockId, setSelectedBlockId] = useState<string | undefined>(undefined);
  const [showNowButton, setShowNowButton] = useState(false);

  const tasks = useTaskStore((state) => state.tasks);
  const addTask = useTaskStore((state) => state.addTask);
  const toggleTask = useTaskStore((state) => state.toggleTask);
  const deleteTask = useTaskStore((state) => state.deleteTask);
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
    const y = currentMinutesSinceStart() * (HOUR_HEIGHT / 60) - 120;
    const timer = setTimeout(() => {
      scrollRef.current?.scrollTo({ y: Math.max(0, y), animated: true });
    }, 300);
    return () => clearTimeout(timer);
  }, [hasTemplate, activeBlocks.length]);

  useEffect(() => {
    const interval = setInterval(() => {
      setNowY(currentMinutesSinceStart() * (HOUR_HEIGHT / 60));
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
  }, [deleteTask]);

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
              'Appuie sur un bloc pour valider ses tâches ou lancer un focus.',
              'Ajoute une tâche en haut, puis associe-la à un bloc si besoin.',
              'Le bouton rond en bas lance le mode Focus.',
            ]}
          />
        </View>
        <Text style={[typography.subheadline, { color: colors.text.secondary, marginTop: 2 }]}>
          {formatDuration(plannedMinutes)} planifiées
        </Text>
      </View>

      <View style={{ height: 0.5, backgroundColor: colors.separator.default, marginHorizontal: 16 }} />

      {showNowButton && (
        <Pressable
          style={{
            position: 'absolute',
            bottom: 168,
            alignSelf: 'center',
            backgroundColor: colors.system.blue,
            borderRadius: 20,
            paddingHorizontal: 16,
            paddingVertical: 8,
            zIndex: 20,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.2,
            shadowRadius: 4,
            elevation: 4,
          }}
          onPress={() => {
            scrollRef.current?.scrollTo({ y: Math.max(0, nowY - 120), animated: true });
            setShowNowButton(false);
          }}
        >
          <Text style={{ fontSize: typography.sizes.base, fontWeight: typography.weights.medium, color: colors.text.inverse }}>Maintenant</Text>
        </Pressable>
      )}

      <ScrollView
        ref={scrollRef}
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={32}
        onScroll={(e) => {
          const y = e.nativeEvent.contentOffset.y;
          setShowNowButton(y > nowY + 200 || y < nowY - 200);
        }}
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
              <Symbol name={SymbolNames.add} size={22} color={colors.system.blue} />
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
                placeholderTextColor={colors.text.placeholder}
                value={newTaskTitle}
                onChangeText={setNewTaskTitle}
                onSubmitEditing={handleAddTask}
                returnKeyType="done"
              />
            </View>

            <View style={{ height: 0.5, backgroundColor: colors.separator.hairline, marginLeft: 44 }} />

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={{ paddingHorizontal: 12, paddingVertical: 8 }}
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
                  />
                  {index < todayTasks.length - 1 && (
                    <View style={{ height: 0.5, backgroundColor: colors.separator.hairline, marginLeft: 57 }} />
                  )}
                </View>
              ))}
            </View>
          </View>
        )}

        <View style={{ marginTop: 24, marginBottom: 120 }}>
            <Text
            style={[
              typography.sectionHeader,
              { paddingHorizontal: 32, paddingBottom: 8 },
            ]}
          >
            Planning
          </Text>

          <View style={styles.timelineContainer}>
            {Array.from({ length: END_HOUR - START_HOUR + 1 }, (_, i) => (
              <View
                key={i}
                style={{ position: 'absolute', top: i * HOUR_HEIGHT, left: 0, right: 0 }}
              >
                <HourMarker hour={START_HOUR + i} />
              </View>
            ))}

            {timelineItems.map((item, index) => {
              const top = (item.startMinutes - START_HOUR * 60) * (HOUR_HEIGHT / 60);
              const height = (item.endMinutes - item.startMinutes) * (HOUR_HEIGHT / 60);

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
                    onFocusTask={handleFocusTask}
                  />
                </View>
              );
            })}

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

      <Pressable
        style={{
          position: 'absolute',
          right: 16,
          bottom: 100,
          width: 56,
          height: 56,
          borderRadius: 28,
          backgroundColor: colors.system.blue,
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10,
        }}
        onPress={() => router.push('/focus')}
      >
        <Symbol name={SymbolNames.timer} size={24} color="#FFFFFF" />
      </Pressable>
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
  timelineContainer: {
    position: 'relative',
    height: (END_HOUR - START_HOUR + 1) * HOUR_HEIGHT,
    marginHorizontal: 16,
  },
  itemAbsolute: {
    position: 'absolute',
    left: 0,
    right: 0,
  },
});
