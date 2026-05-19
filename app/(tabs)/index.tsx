import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTaskStore } from '../../src/features/tasks/store';
import { useTemplateStore } from '../../src/features/templates/store';
import { useLifeBlocksStore } from '../../src/features/lifeBlocks/store';
import { useDayScoreStore } from '../../src/features/dayScore/store';
import { useFocusStore } from '../../src/features/focus/store';
import { Colors, Spacing, Radius, Typography } from '../../src/theme';
import { DayScoreHeader } from '../../src/components/dayScore/DayScoreHeader';
import { TimelineBlock } from '../../src/components/timeline/TimelineBlock';
import { CurrentTimeLine } from '../../src/components/timeline/CurrentTimeLine';
import { FreeSlot } from '../../src/components/timeline/FreeSlot';
import { HourMarker, HOUR_HEIGHT, START_HOUR, END_HOUR } from '../../src/components/timeline/HourMarker';
import { EmptyState } from '../../src/components/shared/EmptyState';

// ─── Helpers ─────────────────────────────────────────────────

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

// ─── Screen ──────────────────────────────────────────────────

export default function TodayScreen() {
  const router = useRouter();
  const scrollRef = useRef<ScrollView>(null);
  const [nowY, setNowY] = useState(currentMinutesSinceStart() * (HOUR_HEIGHT / 60));
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [selectedBlockId, setSelectedBlockId] = useState<string | undefined>(undefined);

  const tasks = useTaskStore((state) => state.tasks);
  const addTask = useTaskStore((state) => state.addTask);
  const toggleTask = useTaskStore((state) => state.toggleTask);
  const getTodayTasks = useTaskStore((state) => state.getTodayTasks);
  const getTodayTasksByLifeBlock = useTaskStore((state) => state.getTodayTasksByLifeBlock);

  const getActiveTemplate = useTemplateStore((state) => state.getActiveTemplate);
  const getTodayBlocks = useTemplateStore((state) => state.getTodayBlocks);

  const getBlockById = useLifeBlocksStore((state) => state.getBlockById);
  const getActiveBlocks = useLifeBlocksStore((state) => state.getActiveBlocks);

  const scores = useDayScoreStore((state) => state.scores);
  const updateBlockValidation = useDayScoreStore((state) => state.updateBlockValidation);
  const updateTasksPercent = useDayScoreStore((state) => state.updateTasksPercent);

  const startFocus = useFocusStore((state) => state.startFocus);

  // ─── Données dérivées ──────────────────────────────────────
  const activeBlocks = useMemo(() => getActiveBlocks(), [getActiveBlocks]);
  const todayTasks = useMemo(() => getTodayTasks(), [tasks, getTodayTasks]);
  const templateBlocks = useMemo(() => getTodayBlocks(), [getTodayBlocks]);

  const hasTemplate = getActiveTemplate() !== undefined;

  // ─── Auto-recalcul du Day Score quand tasks change ──────────
  useEffect(() => {
    const today = todayISO();
    const completed = todayTasks.filter((t) => t.completed).length;
    const total = todayTasks.length;
    updateTasksPercent(today, completed, total);

    const blocksWithCompletedTasks = activeBlocks.filter((block) =>
      todayTasks.some((t) => t.lifeBlockId === block.id && t.completed)
    );
    updateBlockValidation(today, blocksWithCompletedTasks.length, activeBlocks.length);
  }, [tasks, activeBlocks, todayTasks, updateTasksPercent, updateBlockValidation]);

  // ─── Calcul Day Score complet ──────────────────────────────
  const dayScore = useMemo(() => {
    const todayScore = scores.find((s) => s.date === todayISO());
    return todayScore?.total || 0;
  }, [scores]);

  // ─── Scroll auto à l'ouverture ─────────────────────────────
  useEffect(() => {
    if (!hasTemplate || activeBlocks.length === 0) return;
    const y = currentMinutesSinceStart() * (HOUR_HEIGHT / 60) - 120;
    const timer = setTimeout(() => {
      scrollRef.current?.scrollTo({ y: Math.max(0, y), animated: true });
    }, 300);
    return () => clearTimeout(timer);
  }, [hasTemplate, activeBlocks.length]);

  // ─── Mise à jour ligne "MAINTENANT" toutes les 60s ─────────
  useEffect(() => {
    const interval = setInterval(() => {
      setNowY(currentMinutesSinceStart() * (HOUR_HEIGHT / 60));
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  // ─── Ajout de tâche ────────────────────────────────────────
  const handleAddTask = useCallback(() => {
    if (!newTaskTitle.trim()) return;
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

  // ─── Génération des items de la timeline ───────────────────
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

  // ─── Journée chargée ────────────────────────────────────────
  const plannedMinutes = useMemo(() => {
    return templateBlocks.reduce((sum, b) => {
      return sum + (timeToMinutes(b.endTime) - timeToMinutes(b.startTime));
    }, 0);
  }, [templateBlocks]);

  // ─── Toggle tâche ───────────────────────────────────────────
  const handleToggleTask = useCallback((taskId: string) => {
    toggleTask(taskId);
  }, [toggleTask]);

  // ─── Focus tâche ────────────────────────────────────────────
  const handleFocusTask = useCallback((taskId: string, taskTitle: string) => {
    startFocus(taskId, taskTitle);
    router.push('/focus');
  }, [startFocus, router]);

  // ─── Render ────────────────────────────────────────────────
  if (!hasTemplate) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Aujourd'hui</Text>
          <Text style={styles.dateLabel}>{formatDateFr(new Date())}</Text>
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
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Aujourd'hui</Text>
          <Text style={styles.dateLabel}>{formatDateFr(new Date())}</Text>
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
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.headerTitle}>Aujourd'hui</Text>
            <Text style={styles.dateLabel}>{formatDateFr(new Date())}</Text>
          </View>
          <TouchableOpacity
            style={styles.wrapButton}
            onPress={() => router.push('/evening-wrap')}
          >
            <Ionicons name="moon-outline" size={18} color={Colors.accentCyan} />
            <Text style={styles.wrapButtonText}>Bilan</Text>
          </TouchableOpacity>
        </View>
        <DayScoreHeader score={dayScore} />
        {plannedMinutes > 0 && (
          <Text style={styles.chargeIndicator}>
            Journée chargée · {formatDuration(plannedMinutes)} planifiées
          </Text>
        )}

        {/* Ajout rapide de tâche */}
        <View style={styles.addTaskRow}>
          <TextInput
            style={styles.addTaskInput}
            placeholder="Ajouter une tâche..."
            placeholderTextColor={Colors.textTertiary}
            value={newTaskTitle}
            onChangeText={setNewTaskTitle}
            onSubmitEditing={handleAddTask}
            returnKeyType="done"
          />
          <TouchableOpacity
            style={[styles.addTaskBtn, !newTaskTitle.trim() && styles.addTaskBtnDisabled]}
            onPress={handleAddTask}
            disabled={!newTaskTitle.trim()}
          >
            <Ionicons name="add" size={20} color={Colors.bgPrimary} />
          </TouchableOpacity>
        </View>

        {/* Sélection du bloc pour la tâche */}
        {activeBlocks.length > 0 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.blockSelector}
          >
            <TouchableOpacity
              style={[
                styles.blockChip,
                !selectedBlockId && styles.blockChipSelected,
              ]}
              onPress={() => setSelectedBlockId(undefined)}
            >
              <Text style={[styles.blockChipText, !selectedBlockId && styles.blockChipTextSelected]}>
                Sans bloc
              </Text>
            </TouchableOpacity>
            {activeBlocks.map((block) => (
              <TouchableOpacity
                key={block.id}
                style={[
                  styles.blockChip,
                  selectedBlockId === block.id && {
                    backgroundColor: block.color + '20',
                    borderColor: block.color,
                  },
                ]}
                onPress={() =>
                  setSelectedBlockId(selectedBlockId === block.id ? undefined : block.id)
                }
              >
                <Text style={styles.blockChipEmoji}>{block.emoji}</Text>
                <Text
                  style={[
                    styles.blockChipText,
                    selectedBlockId === block.id && { color: block.color },
                  ]}
                >
                  {block.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
      </View>

      {/* Timeline */}
      <ScrollView
        ref={scrollRef}
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.timelineContainer}>
          {/* Hour markers */}
          {Array.from({ length: END_HOUR - START_HOUR + 1 }, (_, i) => (
            <View
              key={i}
              style={{ position: 'absolute', top: i * HOUR_HEIGHT, left: 0, right: 0 }}
            >
              <HourMarker hour={START_HOUR + i} />
            </View>
          ))}

          {/* Blocks + Free slots */}
          {timelineItems.map((item, index) => {
            const top = (item.startMinutes - START_HOUR * 60) * (HOUR_HEIGHT / 60);
            const height = (item.endMinutes - item.startMinutes) * (HOUR_HEIGHT / 60);

            if (item.type === 'free') {
              return (
                <View
                  key={`free-${index}`}
                  style={[styles.itemAbsolute, { top, height }]}
                >
                  <FreeSlot height={height} />
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
                  color={lifeBlock?.color || Colors.textSecondary}
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

          {/* Current time line */}
          <View
            style={[
              styles.itemAbsolute,
              { top: nowY, height: 20, zIndex: 10 },
            ]}
          >
            <CurrentTimeLine />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bgPrimary,
  },
  header: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.sm,
  },
  wrapButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    backgroundColor: Colors.bgInput,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.md,
  },
  wrapButtonText: {
    fontSize: Typography.sizes.sm,
    color: Colors.accentCyan,
    fontWeight: Typography.weights.medium,
  },
  headerTitle: {
    fontSize: Typography.sizes.xxl,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
    letterSpacing: -0.5,
  },
  dateLabel: {
    fontSize: Typography.sizes.base,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
    textTransform: 'capitalize',
  },
  chargeIndicator: {
    fontSize: Typography.sizes.xs,
    color: Colors.textTertiary,
    textAlign: 'center',
    marginTop: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  addTaskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.md,
  },
  addTaskInput: {
    flex: 1,
    backgroundColor: Colors.bgInput,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    fontSize: Typography.sizes.base,
    color: Colors.textPrimary,
  },
  addTaskBtn: {
    width: 44,
    height: 44,
    borderRadius: Radius.md,
    backgroundColor: Colors.accentCyan,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addTaskBtnDisabled: {
    backgroundColor: Colors.bgInput,
  },
  blockSelector: {
    marginTop: Spacing.sm,
    flexGrow: 0,
  },
  blockChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.bgSurface,
    marginRight: Spacing.sm,
    gap: Spacing.xs,
  },
  blockChipSelected: {
    backgroundColor: Colors.bgInput,
  },
  blockChipEmoji: {
    fontSize: 14,
  },
  blockChipText: {
    fontSize: Typography.sizes.sm,
    color: Colors.textSecondary,
    fontWeight: Typography.weights.medium,
  },
  blockChipTextSelected: {
    color: Colors.textPrimary,
  },
  scroll: {
    flex: 1,
  },
  timelineContainer: {
    position: 'relative',
    height: (END_HOUR - START_HOUR + 1) * HOUR_HEIGHT + 40,
    paddingBottom: 40,
  },
  itemAbsolute: {
    position: 'absolute',
    left: 0,
    right: 0,
  },
});
