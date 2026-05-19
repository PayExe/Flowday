import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTaskStore } from '../../src/features/tasks/store';
import { useTemplateStore } from '../../src/features/templates/store';
import { useLifeBlocksStore } from '../../src/features/lifeBlocks/store';
import { useDayScoreStore } from '../../src/features/dayScore/store';
import { Colors, Spacing, Typography } from '../../src/theme';
import { DayScoreHeader } from '../../src/components/dayScore/DayScoreHeader';
import { TimelineBlock } from '../../src/components/timeline/TimelineBlock';
import { CurrentTimeLine } from '../../src/components/timeline/CurrentTimeLine';
import { FreeSlot } from '../../src/components/timeline/FreeSlot';
import { HourMarker, HOUR_HEIGHT, START_HOUR, END_HOUR } from '../../src/components/timeline/HourMarker';
import { EmptyState } from '../../src/components/shared/EmptyState';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

// ─── Helpers ─────────────────────────────────────────────────

function timeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

function minutesSinceStart(time: string): number {
  return timeToMinutes(time) - START_HOUR * 60;
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
  const scrollRef = useRef<ScrollView>(null);
  const [nowY, setNowY] = useState(currentMinutesSinceStart() * (HOUR_HEIGHT / 60));

  const tasks = useTaskStore((state) => state.tasks);
  const toggleTask = useTaskStore((state) => state.toggleTask);
  const getTodayTasks = useTaskStore((state) => state.getTodayTasks);
  const getTodayTasksByLifeBlock = useTaskStore((state) => state.getTodayTasksByLifeBlock);

  const getActiveTemplate = useTemplateStore((state) => state.getActiveTemplate);
  const getTodayBlocks = useTemplateStore((state) => state.getTodayBlocks);

  const getBlockById = useLifeBlocksStore((state) => state.getBlockById);
  const getActiveBlocks = useLifeBlocksStore((state) => state.getActiveBlocks);

  const todayTasks = useMemo(() => getTodayTasks(), [tasks, getTodayTasks]);
  const templateBlocks = useMemo(() => getTodayBlocks(), [getTodayBlocks]);

  // ─── Calcul Day Score (basique) ────────────────────────────
  const dayScore = useMemo(() => {
    const todayTasksList = getTodayTasks();
    const total = todayTasksList.length;
    const completed = todayTasksList.filter((t) => t.completed).length;
    const tasksPercent = total > 0 ? Math.min((completed / total) * 100, 100) : 0;
    // Pour l'instant seul les tâches comptent (30% du score total)
    // Le reste sera ajouté avec rituals, pomodoros, blocs validés
    return Math.round(tasksPercent * 0.3);
  }, [tasks, getTodayTasks]);

  // ─── Scroll auto à l'ouverture ─────────────────────────────
  useEffect(() => {
    const y = currentMinutesSinceStart() * (HOUR_HEIGHT / 60) - 120;
    setTimeout(() => {
      scrollRef.current?.scrollTo({ y: Math.max(0, y), animated: true });
    }, 300);
  }, []);

  // ─── Mise à jour ligne "MAINTENANT" toutes les 60s ─────────
  useEffect(() => {
    const interval = setInterval(() => {
      setNowY(currentMinutesSinceStart() * (HOUR_HEIGHT / 60));
    }, 60000);
    return () => clearInterval(interval);
  }, []);

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

  // ─── Render ────────────────────────────────────────────────
  const hasTemplate = getActiveTemplate() !== undefined;
  const activeBlocks = getActiveBlocks();

  if (!hasTemplate) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Aujourd'hui</Text>
          <Text style={styles.dateLabel}>{format(new Date(), 'EEEE d MMMM', { locale: fr })}</Text>
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
          <Text style={styles.dateLabel}>{format(new Date(), 'EEEE d MMMM', { locale: fr })}</Text>
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
        <Text style={styles.headerTitle}>Aujourd'hui</Text>
        <Text style={styles.dateLabel}>{format(new Date(), 'EEEE d MMMM', { locale: fr })}</Text>
        <DayScoreHeader score={dayScore} />
        {plannedMinutes > 0 && (
          <Text style={styles.chargeIndicator}>
            Journée chargée · {formatDuration(plannedMinutes)} planifiées
          </Text>
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
                  onToggleTask={toggleTask}
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
