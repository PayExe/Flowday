import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useTaskStore } from '../../src/features/tasks/store';
import { useTemplateStore } from '../../src/features/templates/store';
import { useLifeBlocksStore } from '../../src/features/lifeBlocks/store';
import { useRitualStore } from '../../src/features/rituals/store';
import { useFocusStore } from '../../src/features/focus/store';
import { useTheme } from '../../src/theme';
import { dateKey, parseDateKey, relativeDay, weekDayIndex } from '../../src/utils/dates';
import { formatDuration, formatLongDate, timeToMinutes } from '../../src/utils/time';
import { SymbolNames } from '../../src/components/ui/Symbol';
import { Button, IconButton } from '../../src/components/ui/Glass';
import { IconTile, List, Row, SectionHeader } from '../../src/components/ui/List';
import { Screen } from '../../src/components/ui/Screen';
import { PageInfo } from '../../src/components/ui/PageInfo';
import { TimelineBlock } from '../../src/components/timeline/TimelineBlock';
import { FreeSlot } from '../../src/components/timeline/FreeSlot';
import { NowIndicator } from '../../src/components/timeline/NowIndicator';
import { HourMarker, HOUR_HEIGHT, START_HOUR, END_HOUR, MINUTES_PER_HOUR, HOUR_LABEL_WIDTH, timelineY } from '../../src/components/timeline/HourMarker';
import { TaskCard } from '../../src/components/tasks/TaskCard';
import { TaskDetailSheet } from '../../src/components/tasks/TaskDetailSheet';
import { NewTaskSheet } from '../../src/components/tasks/NewTaskSheet';
import { BlockDetailSheet } from '../../src/components/timeline/BlockDetailSheet';
import { EmptyState } from '../../src/components/shared/EmptyState';
import { RitualPrompt } from '../../src/components/rituals/RitualPrompt';
import { FocusBar } from '../../src/components/focus/FocusBar';
import { DayNavigator } from '../../src/components/planning/DayNavigator';
import { OverdueTasks } from '../../src/components/tasks/OverdueTasks';
import { hapticLight } from '../../src/utils/haptics';
import { Task } from '../../src/types/task';
import { useBlockLogStore } from '../../src/features/blockLogs/store';
import { TemplateBlock } from '../../src/types/template';
import { useTranslation } from '../../src/i18n';


function todayISO(): string {
  return dateKey();
}

function currentMinutes(): number {
  const now = new Date();
  return now.getHours() * 60 + now.getMinutes();
}

type TimelineItem = {
  type: 'free';
  startMinutes: number;
  endMinutes: number;
} | {
  type: 'block';
  startMinutes: number;
  endMinutes: number;
  data: TemplateBlock;
};

const TIMELINE_START = START_HOUR * MINUTES_PER_HOUR;
const TIMELINE_END = END_HOUR * MINUTES_PER_HOUR;


export default function PlanningScreen() {
  const router = useRouter();
  const { colors, typography } = useTheme();
  const { t } = useTranslation();
  const scrollRef = useRef<ScrollView>(null);
  const timelineOffset = useRef(0);
  const didScrollToNow = useRef(false);
  const [nowMinutes, setNowMinutes] = useState(currentMinutes);
  const [viewedDate, setViewedDate] = useState(todayISO);
  const [newTaskVisible, setNewTaskVisible] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string | undefined>(undefined);
  const [selectedTimelineBlock, setSelectedTimelineBlock] = useState<{
    date: string;
    templateBlockId: string;
    lifeBlockId: string;
    plannedMinutes: number;
    title: string;
    timeRange: string;
    color: string;
    emoji: string;
    tasks: Task[];
  }>();

  const tasks = useTaskStore((state) => state.tasks);
  const addTask = useTaskStore((state) => state.addTask);
  const toggleTask = useTaskStore((state) => state.toggleTask);
  const deleteTask = useTaskStore((state) => state.deleteTask);
  const updateTask = useTaskStore((state) => state.updateTask);
  const getTasksForDate = useTaskStore((state) => state.getTasksForDate);
  const getTasksForDateByLifeBlock = useTaskStore((state) => state.getTasksForDateByLifeBlock);
  const getOverdueTasks = useTaskStore((state) => state.getOverdueTasks);
  const rescheduleTask = useTaskStore((state) => state.rescheduleTask);

  const getActiveTemplate = useTemplateStore((state) => state.getActiveTemplate);
  const getBlocksForDay = useTemplateStore((state) => state.getBlocksForDay);
  const templates = useTemplateStore((state) => state.templates);
  const activeTemplateId = useTemplateStore((state) => state.activeTemplateId);

  const getBlockById = useLifeBlocksStore((state) => state.getBlockById);
  const getActiveBlocks = useLifeBlocksStore((state) => state.getActiveBlocks);
  const lifeBlocks = useLifeBlocksStore((state) => state.blocks);


  const hasDoneMorningToday = useRitualStore((state) => state.hasDoneMorningToday);
  const startFocus = useFocusStore((state) => state.startFocus);
  const blockLogs = useBlockLogStore((state) => state.logs);
  const setBlockStatus = useBlockLogStore((state) => state.setStatus);
  const clearBlockStatus = useBlockLogStore((state) => state.clearStatus);

  const activeBlocks = useMemo(() => getActiveBlocks(), [lifeBlocks, getActiveBlocks]);
  const isViewingToday = relativeDay(viewedDate) === 'today';
  const isViewingPast = viewedDate < todayISO();
  const viewedLogs = useMemo(
    () => blockLogs.filter((log) => log.date === viewedDate),
    [blockLogs, viewedDate]
  );

  const viewedTasks = useMemo(
    () => getTasksForDate(viewedDate),
    [tasks, viewedDate, getTasksForDate]
  );
  const templateBlocks = useMemo(
    () => getBlocksForDay(weekDayIndex(parseDateKey(viewedDate))),
    [templates, activeTemplateId, viewedDate, getBlocksForDay]
  );
  const overdueTasks = useMemo(() => getOverdueTasks(), [tasks, getOverdueTasks]);

  const hasTemplate = getActiveTemplate() !== undefined;
  const morningDone = hasDoneMorningToday();


  useEffect(() => {
    const timer = setInterval(() => setNowMinutes(currentMinutes()), 30000);
    return () => clearInterval(timer);
  }, []);

  const handleTimelineLayout = useCallback((y: number) => {
    timelineOffset.current = y;
    if (didScrollToNow.current) return;
    didScrollToNow.current = true;
    const now = currentMinutes();
    if (now < TIMELINE_START + 120 || now > TIMELINE_END) return;
    const target = y + timelineY(now - TIMELINE_START) - 220;
    setTimeout(() => {
      scrollRef.current?.scrollTo({ y: Math.max(0, target), animated: true });
    }, 300);
  }, []);

  const timelineItems = useMemo(() => {
    const sorted = [...templateBlocks].sort((a, b) =>
      a.startTime.localeCompare(b.startTime)
    );

    const items: TimelineItem[] = [];
    let cursor = TIMELINE_START;

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

    if (cursor < TIMELINE_END) {
      items.push({
        type: 'free',
        startMinutes: cursor,
        endMinutes: TIMELINE_END,
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

  const handleDeleteTask = useCallback((taskId: string) => {
    deleteTask(taskId);
    setSelectedTaskId(undefined);
  }, [deleteTask]);

  const handleFocusTask = useCallback((task: Task) => {
    hapticLight();
    setSelectedTaskId(undefined);
    if (startFocus(task.id, task.title)) router.push('/focus');
  }, [router, startFocus]);

  const sortedTasks = useMemo(
    () => [...viewedTasks].sort((a, b) => Number(a.completed) - Number(b.completed)),
    [viewedTasks]
  );

  const selectedTask = viewedTasks.find((task) => task.id === selectedTaskId);
  const completedCount = viewedTasks.filter((task) => task.completed).length;
  const dateLabel = formatLongDate(parseDateKey(viewedDate), t);

  if (!hasTemplate || activeBlocks.length === 0) {
    const missingBlocks = activeBlocks.length === 0;
    return (
      <Screen
        eyebrow={dateLabel}
        title={t('Planning')}
        actions={
          <PageInfo
            title={t('Planning')}
            description={t('Organise ta journée avec une timeline, des tâches et des blocs de vie.')}
            points={[
              t('Crée d’abord un template dans Semaine et des blocs de vie dans Blocs.'),
              t('Une fois configuré, ajoute tes tâches et associe-les au bon bloc.'),
            ]}
          />
        }
      >
        <EmptyState
          icon={missingBlocks ? SymbolNames.blocks : SymbolNames.calendar}
          title={missingBlocks ? t('Aucun Life Block') : t('Aucun template actif')}
          subtitle={missingBlocks ? t('Aucun bloc de vie pour le moment') : t('Aucun planning pour le moment')}
          action={
            <Button
              title={missingBlocks ? t('Créer un bloc de vie') : t('Préparer ma semaine')}
              onPress={() => router.push(missingBlocks ? '/blocks' : '/week')}
            />
          }
        />
      </Screen>
    );
  }

  const showNowLine =
    isViewingToday && nowMinutes >= TIMELINE_START && nowMinutes <= TIMELINE_END;
  const nowLabel = `${Math.floor(nowMinutes / 60).toString().padStart(2, '0')}:${(nowMinutes % 60).toString().padStart(2, '0')}`;
  const hourHiddenByNow = (hour: number) =>
    showNowLine && Math.abs(nowMinutes - hour * MINUTES_PER_HOUR) < 15;

  return (
    <>
      <Screen
        scrollRef={scrollRef}
        eyebrow={dateLabel}
        title={t('Planning')}
        subtitle={plannedMinutes > 0 ? t('plannedDuration', { duration: formatDuration(plannedMinutes) }) : undefined}
        actions={
          <>
            <PageInfo
              title={t('Planning')}
              description={t('La timeline de ta journée, heure par heure, avec tes tâches et tes blocs.')}
              points={[
                t('Utilise + pour ajouter une tâche et l’associer à un bloc.'),
                t('Appuie sur une tâche pour la modifier ou lancer une session Focus.'),
                t('Appuie sur un bloc pour voir ses tâches et valider ce qui est fait.'),
                t('Navigue entre les jours avec les flèches, ou touche la date pour revenir à aujourd’hui.'),
                t('Les tâches en retard restent en haut jusqu’à ce que tu les replanifies.'),
              ]}
            />
            <IconButton
              symbol={SymbolNames.add}
              onPress={() => setNewTaskVisible(true)}
              accessibilityLabel={t('Ajouter une tâche')}
              prominent
            />
          </>
        }
      >
        {!morningDone && (
          <View style={styles.prompt}>
            <RitualPrompt />
          </View>
        )}

        <FocusBar style={styles.focusBar} />

        <DayNavigator date={viewedDate} onChange={setViewedDate} />

        {isViewingToday && overdueTasks.length > 0 && (
          <>
            <SectionHeader
              title={t('En retard')}
              trailing={
                <Text style={[typography.subheadline, styles.tabular, { color: colors.system.orange }]}>
                  {overdueTasks.length}
                </Text>
              }
            />
            <OverdueTasks
              tasks={overdueTasks}
              onReschedule={rescheduleTask}
              onDelete={handleDeleteTask}
            />
          </>
        )}

        <SectionHeader
          title={t('Tâches')}
          trailing={
            viewedTasks.length > 0 ? (
              <Text style={[typography.subheadline, styles.tabular]}>
                {completedCount}/{viewedTasks.length}
              </Text>
            ) : undefined
          }
        />
        {viewedTasks.length > 0 ? (
          <List separatorInset={52} animated>
            {sortedTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onToggle={handleToggleTask}
                onDelete={handleDeleteTask}
                lifeBlock={task.lifeBlockId ? getBlockById(task.lifeBlockId) : undefined}
                onPress={() => setSelectedTaskId(task.id)}
              />
            ))}
          </List>
        ) : (
          <List>
            <Row
              leading={<IconTile color={colors.accent} symbol={SymbolNames.add} />}
              title={t('Ajouter une tâche')}
              subtitle={isViewingToday ? t('Aucune tâche pour aujourd’hui.') : t('Aucune tâche ce jour-là.')}
              tint={colors.accent}
              onPress={() => setNewTaskVisible(true)}
            />
          </List>
        )}

        <SectionHeader title={t('Horaires')} />
        <View
          style={styles.timelineContainer}
          onLayout={(event) => handleTimelineLayout(event.nativeEvent.layout.y)}
        >
          <View style={styles.hourLabels} pointerEvents="none">
            {Array.from({ length: END_HOUR - START_HOUR + 1 }, (_, i) =>
              hourHiddenByNow(START_HOUR + i) ? null : (
                <View key={i} style={{ position: 'absolute', top: timelineY(i * MINUTES_PER_HOUR), left: 0 }}>
                  <HourMarker hour={START_HOUR + i} />
                </View>
              )
            )}
          </View>

          <View style={styles.timelineContent}>
            {Array.from({ length: END_HOUR - START_HOUR + 1 }, (_, i) => (
              <View key={`line-${i}`} style={[styles.hourLine, { top: timelineY(i * MINUTES_PER_HOUR), backgroundColor: colors.separator.hairline }]} />
            ))}

            {timelineItems.map((item, index) => {
              const top = timelineY(item.startMinutes - TIMELINE_START);
              const height = timelineY(item.endMinutes - item.startMinutes);

              if (item.type === 'free') {
                return (
                  <View
                    key={`free-${index}`}
                    style={[styles.itemAbsolute, { top, height }]}
                    pointerEvents="none"
                  >
                    <FreeSlot height={height} duration={item.endMinutes - item.startMinutes} />
                  </View>
                );
              }

              const block = item.data;
              const lifeBlock = getBlockById(block.lifeBlockId);
              const blockTasks = lifeBlock
                ? getTasksForDateByLifeBlock(viewedDate, lifeBlock.id)
                : [];
              const isActive =
                isViewingToday &&
                nowMinutes >= item.startMinutes &&
                nowMinutes < item.endMinutes;

              return (
                <View
                  key={`block-${block.id}`}
                  style={[styles.itemAbsolute, { top, height }]}
                >
                  <TimelineBlock
                    emoji={lifeBlock?.emoji || '⬜'}
                    name={lifeBlock?.name || t('Bloc')}
                    title={block.title}
                    color={lifeBlock?.color || colors.system.gray}
                    startTime={block.startTime}
                    endTime={block.endTime}
                    height={height}
                    tasks={blockTasks}
                    isActive={isActive}
                    status={viewedLogs.find((log) => log.templateBlockId === block.id)?.status}
                    needsReview={isViewingPast || (isViewingToday && nowMinutes >= item.endMinutes)}
                    onToggleTask={handleToggleTask}
                    onTaskPress={(task) => setSelectedTaskId(task.id)}
                    onFocusTask={handleFocusTask}
                    onPress={() => setSelectedTimelineBlock({
                      date: viewedDate,
                      templateBlockId: block.id,
                      lifeBlockId: block.lifeBlockId,
                      plannedMinutes: item.endMinutes - item.startMinutes,
                      title: block.title || lifeBlock?.name || t('Bloc'),
                      timeRange: `${block.startTime} – ${block.endTime}`,
                      color: lifeBlock?.color || colors.system.gray,
                      emoji: lifeBlock?.emoji || '⬜',
                      tasks: blockTasks,
                    })}
                  />
                </View>
              );
            })}

          </View>

          {showNowLine && (
            <NowIndicator top={timelineY(nowMinutes - TIMELINE_START)} label={nowLabel} />
          )}
        </View>
      </Screen>

      <NewTaskSheet
        visible={newTaskVisible}
        blocks={activeBlocks}
        onClose={() => setNewTaskVisible(false)}
        defaultDate={viewedDate}
        onAdd={(task) => addTask({ ...task, completed: false })}
      />
      <TaskDetailSheet
        task={selectedTask}
        blocks={activeBlocks}
        onClose={() => setSelectedTaskId(undefined)}
        onUpdate={updateTask}
        onDelete={handleDeleteTask}
        onFocus={handleFocusTask}
      />
      <BlockDetailSheet
        visible={!!selectedTimelineBlock}
        title={selectedTimelineBlock?.title ?? ''}
        timeRange={selectedTimelineBlock?.timeRange ?? ''}
        color={selectedTimelineBlock?.color ?? colors.system.gray}
        emoji={selectedTimelineBlock?.emoji}
        tasks={(selectedTimelineBlock?.tasks ?? []).map((task) => tasks.find((currentTask) => currentTask.id === task.id) || task)}
        onClose={() => setSelectedTimelineBlock(undefined)}
        validation={selectedTimelineBlock && {
          status: blockLogs.find(
            (log) =>
              log.date === selectedTimelineBlock.date &&
              log.templateBlockId === selectedTimelineBlock.templateBlockId
          )?.status,
          canValidate: selectedTimelineBlock.date <= todayISO(),
          onChange: (status) => {
            const { date, templateBlockId, lifeBlockId, plannedMinutes } = selectedTimelineBlock;
            if (status === null) clearBlockStatus(date, templateBlockId);
            else setBlockStatus({ date, templateBlockId, lifeBlockId, plannedMinutes, status, source: 'manual' });
          },
        }}
        onToggleTask={handleToggleTask}
        onFocusTask={handleFocusTask}
      />
    </>
  );
}

const styles = StyleSheet.create({
  focusBar: {
    marginTop: 12,
  },
  prompt: {
    marginTop: 8,
  },
  tabular: {
    fontVariant: ['tabular-nums'],
  },
  timelineContainer: {
    position: 'relative',
    height: (END_HOUR - START_HOUR) * HOUR_HEIGHT,
    marginHorizontal: 20,
    marginTop: 12,
    marginBottom: 16,
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
    height: StyleSheet.hairlineWidth,
  },
  itemAbsolute: {
    position: 'absolute',
    left: 0,
    right: 0,
  },
});
