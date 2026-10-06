import { useCallback, useMemo, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useTaskStore } from '../../src/features/tasks/store';
import { useTemplateStore } from '../../src/features/templates/store';
import { useLifeBlocksStore } from '../../src/features/lifeBlocks/store';
import { useDayScoreStore } from '../../src/features/dayScore/store';
import { useRitualStore } from '../../src/features/rituals/store';
import { useFocusStore } from '../../src/features/focus/store';
import { useTheme } from '../../src/theme';
import { dateKey } from '../../src/utils/dates';
import { addDays } from '../../src/utils/dates';
import { formatLongDate, timeToMinutes } from '../../src/utils/time';
import { SymbolNames } from '../../src/components/ui/Symbol';
import { IconButton } from '../../src/components/ui/Glass';
import { Card, IconTile, List, Row, SectionHeader } from '../../src/components/ui/List';
import { Screen } from '../../src/components/ui/Screen';
import { PageInfo } from '../../src/components/ui/PageInfo';
import { ScoreCard } from '../../src/components/dayScore/ScoreCard';
import { TaskCard } from '../../src/components/tasks/TaskCard';
import { NewTaskSheet } from '../../src/components/tasks/NewTaskSheet';
import { TaskDetailSheet } from '../../src/components/tasks/TaskDetailSheet';
import { FocusBar } from '../../src/components/focus/FocusBar';
import { StartFocusSheet } from '../../src/components/focus/StartFocusSheet';
import { RitualPrompt } from '../../src/components/rituals/RitualPrompt';
import { calculateStreaks } from '../../src/utils/streaks';
import { useTranslation } from '../../src/i18n';


function todayISO(): string {
  return dateKey();
}

function currentMinutes(): number {
  const now = new Date();
  return now.getHours() * 60 + now.getMinutes();
}

const CHART_HEIGHT = 96;


export default function HomeScreen() {
  const router = useRouter();
  const { colors, typography } = useTheme();
  const { t } = useTranslation();

  const scores = useDayScoreStore((state) => state.scores);
  const getScoreForDate = useDayScoreStore((state) => state.getScoreForDate);
  const getAllScores = useDayScoreStore((state) => state.getAllScores);
  const todayScore = useMemo(() => getScoreForDate(todayISO()), [scores, getScoreForDate]);

  const hasDoneMorningToday = useRitualStore((state) => state.hasDoneMorningToday);
  const getTodayLog = useRitualStore((state) => state.getTodayLog);
  const morningLog = getTodayLog('morning');
  const morningDone = hasDoneMorningToday();

  const getTodayBlocks = useTemplateStore((state) => state.getTodayBlocks);
  const templates = useTemplateStore((state) => state.templates);
  const activeTemplateId = useTemplateStore((state) => state.activeTemplateId);
  const getBlockById = useLifeBlocksStore((state) => state.getBlockById);
  const getActiveBlocks = useLifeBlocksStore((state) => state.getActiveBlocks);
  const lifeBlocks = useLifeBlocksStore((state) => state.blocks);
  const activeBlocks = useMemo(() => getActiveBlocks(), [lifeBlocks, getActiveBlocks]);
  const templateBlocks = useMemo(() => getTodayBlocks(), [templates, activeTemplateId, getTodayBlocks]);

  const tasks = useTaskStore((state) => state.tasks);
  const toggleTask = useTaskStore((state) => state.toggleTask);
  const deleteTask = useTaskStore((state) => state.deleteTask);
  const updateTask = useTaskStore((state) => state.updateTask);
  const addTask = useTaskStore((state) => state.addTask);
  const getIncompleteTodayTasks = useTaskStore((state) => state.getIncompleteTodayTasks);
  const getOverdueTasks = useTaskStore((state) => state.getOverdueTasks);

  const focusState = useFocusStore((state) => state.focusState);
  const startFocus = useFocusStore((state) => state.startFocus);
  const pomodoroGoal = useDayScoreStore((state) => state.pomodoroGoal);

  const [newTaskVisible, setNewTaskVisible] = useState(false);
  const [startFocusVisible, setStartFocusVisible] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string | undefined>(undefined);
  const selectedTask = useMemo(
    () => tasks.find((task) => task.id === selectedTaskId),
    [tasks, selectedTaskId]
  );

  const openTasks = useMemo(() => {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return getIncompleteTodayTasks()
      .slice()
      .sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
  }, [tasks, getIncompleteTodayTasks]);

  const incompleteTasks = useMemo(() => openTasks.slice(0, 3), [openTasks]);
  const overdueCount = useMemo(() => getOverdueTasks().length, [tasks, getOverdueTasks]);

  const handleFocusTask = useCallback(
    (task: { id: string; title: string }) => {
      setStartFocusVisible(false);
      setSelectedTaskId(undefined);
      if (startFocus(task.id, task.title)) router.push('/focus');
    },
    [router, startFocus]
  );

  const nextBlockInfo = useMemo(() => {
    const now = currentMinutes();
    const sorted = [...templateBlocks].sort((a, b) => a.startTime.localeCompare(b.startTime));

    const current = sorted.find((b) => {
      const start = timeToMinutes(b.startTime);
      const end = timeToMinutes(b.endTime);
      return now >= start && now < end;
    });
    const block = current ?? sorted.find((b) => timeToMinutes(b.startTime) > now);
    if (!block) return null;

    const lifeBlock = getBlockById(block.lifeBlockId);
    return {
      type: current ? ('current' as const) : ('next' as const),
      emoji: lifeBlock?.emoji || '⬜',
      title: block.title || lifeBlock?.name || t('Bloc'),
      color: lifeBlock?.color || colors.system.gray,
      startTime: block.startTime,
      endTime: block.endTime,
    };
  }, [templateBlocks, getBlockById, t, colors]);

  const normalizedScores = useMemo(() => getAllScores(), [scores, getAllScores]);
  const streaks = useMemo(() => calculateStreaks(normalizedScores), [normalizedScores]);

  const last7Days = useMemo(() => {
    const dayShort = ['daySunShort', 'dayMonShort', 'dayTueShort', 'dayWedShort', 'dayThuShort', 'dayFriShort', 'daySatShort'].map((key) => t(key));
    const result = [];
    for (let i = 6; i >= 0; i--) {
      const d = addDays(new Date(), -i);
      const iso = dateKey(d);
      const s = normalizedScores.find((sc) => sc.date === iso);
      result.push({ key: iso, label: dayShort[d.getDay()], score: s?.total || 0 });
    }
    return result;
  }, [normalizedScores, t]);

  return (
    <>
      <Screen
        eyebrow={formatLongDate(new Date(), t)}
        title={t('Aujourd’hui')}
        subtitle={
          morningDone && morningLog?.intention
            ? `${t('Intention :')} ${morningLog.intention}`
            : undefined
        }
        actions={
          <>
            <PageInfo
              title={t('Aujourd’hui')}
              description={t('Ton tableau de bord du jour : score, prochain bloc, séries et tâches prioritaires.')}
              points={[
                t('Le score /100 se compose des blocs (40 %), des tâches (30 %), du focus (20 %) et des rituels (10 %).'),
                t('« En ce moment / Prochain bloc » reflète ton planning actuel.'),
                t('Les Streaks comptent tes journées à 60+ points consécutives.'),
                t('Les tâches prioritaires sont tes 3 tâches en cours les plus importantes.'),
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
        <View style={styles.top}>
          {!morningDone && <RitualPrompt />}

          <ScoreCard
            score={todayScore?.total || 0}
            blocksPercent={todayScore?.blocksPercent}
            tasksPercent={todayScore?.tasksPercent}
            pomodorosPercent={todayScore?.pomodorosPercent}
            ritualsPercent={todayScore?.ritualsPercent}
          />
        </View>

        <SectionHeader title={t('Focus')} />
        {focusState.currentTaskId ? (
          <FocusBar />
        ) : (
          <List>
            <Row
              leading={<IconTile color={colors.system.orange} symbol={SymbolNames.timer} size={44} />}
              title={t('Démarrer un focus')}
              subtitle={t('pomodoroProgress', {
                done: focusState.dailyPomodoroCount,
                goal: pomodoroGoal,
              })}
              tint={colors.accent}
              chevron
              onPress={() => {
                if (openTasks.length === 0) {
                  setNewTaskVisible(true);
                  return;
                }
                setStartFocusVisible(true);
              }}
            />
          </List>
        )}

        {nextBlockInfo && (
          <>
            <SectionHeader title={nextBlockInfo.type === 'current' ? t('En ce moment') : t('Prochain bloc')} />
            <List>
              <Row
                leading={<IconTile color={nextBlockInfo.color} emoji={nextBlockInfo.emoji} size={44} />}
                title={nextBlockInfo.title}
                subtitle={`${nextBlockInfo.startTime} – ${nextBlockInfo.endTime}`}
                chevron
                onPress={() => router.push('/planning')}
              />
            </List>
          </>
        )}

        {overdueCount > 0 && (
          <List>
            <Row
              leading={
                <IconTile color={colors.system.orange} symbol={SymbolNames.calendar} size={44} />
              }
              title={`${overdueCount} ${t('tâches en retard')}`}
              subtitle={t('Les tâches en retard restent en haut jusqu’à ce que tu les replanifies.')}
              tint={colors.system.orange}
              chevron
              onPress={() => router.push('/planning')}
            />
          </List>
        )}

        <SectionHeader title={t('Tâches prioritaires')} />
        {incompleteTasks.length > 0 ? (
          <List separatorInset={52}>
            {incompleteTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onToggle={toggleTask}
                onDelete={deleteTask}
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
              subtitle={t('Aucune priorité pour le moment.')}
              tint={colors.accent}
              onPress={() => setNewTaskVisible(true)}
            />
          </List>
        )}

        <SectionHeader title={t('Performance')} />
        <Card padded>
          <View style={styles.streak}>
            <IconTile color={colors.system.orange} symbol={SymbolNames.flame} size={44} />
            <View style={styles.streakText}>
              <Text style={typography.headline}>{t('streakCount', { count: streaks.currentStreak })}</Text>
              <Text style={[typography.footnote, styles.streakBest]}>
                {t('bestStreakCount', { count: streaks.bestStreak })}
              </Text>
            </View>
          </View>

          <View style={[styles.divider, { backgroundColor: colors.separator.hairline }]} />

          <View style={styles.chart}>
            {last7Days.map((day) => {
              const isToday = day.key === todayISO();
              const barHeight = day.score > 0 ? Math.max(6, (day.score / 100) * CHART_HEIGHT) : 4;
              return (
                <View
                  key={day.key}
                  style={styles.chartColumn}
                  accessibilityLabel={`${day.label} ${day.score} ${t('/100')}`}
                >
                  <Text
                    style={[
                      typography.caption,
                      styles.tabular,
                      { color: isToday ? colors.text.primary : colors.text.secondary },
                      isToday && styles.strong,
                    ]}
                  >
                    {day.score > 0 ? day.score : '–'}
                  </Text>
                  <View style={styles.chartTrack}>
                    <View
                      style={{
                        height: barHeight,
                        borderRadius: 6,
                        backgroundColor: isToday
                          ? colors.accent
                          : day.score > 0
                            ? colors.system.gray3
                            : colors.bg.tertiary,
                      }}
                    />
                  </View>
                  <Text
                    style={[
                      typography.caption,
                      { color: isToday ? colors.accent : colors.text.secondary },
                      isToday && styles.strong,
                    ]}
                  >
                    {day.label}
                  </Text>
                </View>
              );
            })}
          </View>
        </Card>
      </Screen>

      <NewTaskSheet
        visible={newTaskVisible}
        blocks={activeBlocks}
        onClose={() => setNewTaskVisible(false)}
        defaultDate={todayISO()}
        onAdd={(task) => addTask({ ...task, completed: false })}
      />

      <StartFocusSheet
        visible={startFocusVisible}
        tasks={openTasks}
        getLifeBlock={getBlockById}
        onClose={() => setStartFocusVisible(false)}
        onSelect={handleFocusTask}
      />

      <TaskDetailSheet
        task={selectedTask}
        blocks={activeBlocks}
        onClose={() => setSelectedTaskId(undefined)}
        onUpdate={updateTask}
        onDelete={deleteTask}
        onFocus={handleFocusTask}
      />
    </>
  );
}

const styles = StyleSheet.create({
  top: {
    gap: 12,
    marginTop: 8,
  },
  streak: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  streakText: {
    flex: 1,
  },
  streakBest: {
    marginTop: 2,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginVertical: 16,
  },
  chart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  chartColumn: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
  },
  chartTrack: {
    width: '100%',
    maxWidth: 28,
    height: CHART_HEIGHT,
    justifyContent: 'flex-end',
  },
  tabular: {
    fontVariant: ['tabular-nums'],
  },
  strong: {
    fontWeight: '600',
  },
});
