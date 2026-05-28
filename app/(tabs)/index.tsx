import { useMemo, useState } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet, Modal, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTaskStore } from '../../src/features/tasks/store';
import { useTemplateStore } from '../../src/features/templates/store';
import { useLifeBlocksStore } from '../../src/features/lifeBlocks/store';
import { useDayScoreStore } from '../../src/features/dayScore/store';
import { useRitualStore } from '../../src/features/rituals/store';
import { useTheme } from '../../src/theme';
import { Symbol, SymbolNames } from '../../src/components/ui/Symbol';
import { DayScoreHeader } from '../../src/components/dayScore/DayScoreHeader';
import { TaskCard } from '../../src/components/tasks/TaskCard';
import { calculateStreaks } from '../../src/utils/streaks';

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

function currentMinutes(): number {
  const now = new Date();
  return now.getHours() * 60 + now.getMinutes();
}

// ─── Screen ──────────────────────────────────────────────────

export default function HomeScreen() {
  const router = useRouter();
  const { colors, typography } = useTheme();

  const scores = useDayScoreStore((state) => state.scores);
  const todayScore = useMemo(() => scores.find((s) => s.date === todayISO()), [scores]);

  const hasDoneMorningToday = useRitualStore((state) => state.hasDoneMorningToday);
  const getTodayLog = useRitualStore((state) => state.getTodayLog);
  const morningLog = getTodayLog('morning');
  const morningDone = hasDoneMorningToday();

  const getTodayBlocks = useTemplateStore((state) => state.getTodayBlocks);
  const getBlockById = useLifeBlocksStore((state) => state.getBlockById);
  const templateBlocks = useMemo(() => getTodayBlocks(), [getTodayBlocks]);

  const tasks = useTaskStore((state) => state.tasks);
  const toggleTask = useTaskStore((state) => state.toggleTask);
  const deleteTask = useTaskStore((state) => state.deleteTask);
  const addTask = useTaskStore((state) => state.addTask);
  const getIncompleteTodayTasks = useTaskStore((state) => state.getIncompleteTodayTasks);

  const [quickAddVisible, setQuickAddVisible] = useState(false);
  const [quickAddTitle, setQuickAddTitle] = useState('');

  const incompleteTasks = useMemo(() => {
    const all = getIncompleteTodayTasks();
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return all.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]).slice(0, 3);
  }, [tasks, getIncompleteTodayTasks]);

  // ─── Prochain bloc ──────────────────────────────────────────
  const handleDeleteTask = (taskId: string) => {
    deleteTask(taskId);
  };

  const nextBlockInfo = useMemo(() => {
    const now = currentMinutes();
    const sorted = [...templateBlocks].sort((a, b) => a.startTime.localeCompare(b.startTime));

    // Bloc actuel
    const current = sorted.find((b) => {
      const start = timeToMinutes(b.startTime);
      const end = timeToMinutes(b.endTime);
      return now >= start && now < end;
    });

    if (current) {
      const lifeBlock = getBlockById(current.lifeBlockId);
      return {
        type: 'current' as const,
        emoji: lifeBlock?.emoji || '⬜',
        name: lifeBlock?.name || 'Bloc',
        title: current.title,
        color: lifeBlock?.color || '#8E8E93',
        startTime: current.startTime,
        endTime: current.endTime,
      };
    }

    // Prochain bloc futur
    const next = sorted.find((b) => timeToMinutes(b.startTime) > now);
    if (next) {
      const lifeBlock = getBlockById(next.lifeBlockId);
      return {
        type: 'next' as const,
        emoji: lifeBlock?.emoji || '⬜',
        name: lifeBlock?.name || 'Bloc',
        title: next.title,
        color: lifeBlock?.color || '#8E8E93',
        startTime: next.startTime,
        endTime: next.endTime,
      };
    }

    return null;
  }, [templateBlocks, getBlockById]);

  // ─── Streaks ────────────────────────────────────────────────
  const streaks = useMemo(() => calculateStreaks(scores), [scores]);

  const handleQuickAdd = () => {
    setQuickAddTitle('');
    setQuickAddVisible(true);
  };

  const handleQuickAddSubmit = () => {
    if (quickAddTitle.trim()) {
      addTask({
        title: quickAddTitle.trim(),
        completed: false,
        priority: 'medium',
        scheduledDate: todayISO(),
      });
    }
    setQuickAddVisible(false);
    setQuickAddTitle('');
  };

  // ─── Render ──────────────────────────────────────────────────
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bg.primary }]} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={[typography.screenTitle, { color: colors.text.primary }]}>Accueil</Text>
            <Pressable
              style={{
                width: 32,
                height: 32,
                borderRadius: 16,
                backgroundColor: colors.system.blue,
                alignItems: 'center',
                justifyContent: 'center',
              }}
              onPress={handleQuickAdd}
            >
              <Symbol name={SymbolNames.add} size={18} color={colors.text.inverse} />
            </Pressable>
          </View>
          <Text style={[typography.subheadline, { marginTop: 2 }]}>
            {formatDateFr(new Date())}
          </Text>
          {morningDone && morningLog?.intention && (
            <Text style={[typography.footnote, { marginTop: 4 }]}>
              Intention : {morningLog.intention}
            </Text>
          )}
        </View>

        {/* Day Score */}
        <DayScoreHeader
          score={todayScore?.total || 0}
          blocksPercent={todayScore?.blocksPercent}
          tasksPercent={todayScore?.tasksPercent}
          pomodorosPercent={todayScore?.pomodorosPercent}
          ritualsPercent={todayScore?.ritualsPercent}
        />

        {/* Prochain bloc */}
        {nextBlockInfo && (
          <View style={{ marginBottom: 24 }}>
            <Text style={[typography.sectionHeader, { paddingHorizontal: 32, paddingBottom: 8 }]}>
              {nextBlockInfo.type === 'current' ? 'En ce moment' : 'Prochain bloc'}
            </Text>
            <View
              style={{
                backgroundColor: colors.bg.secondary,
                borderRadius: 13,
                marginHorizontal: 16,
                overflow: 'hidden',
              }}
            >
              <Pressable
                style={({ pressed }) => ({
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingHorizontal: 16,
                  paddingVertical: 14,
                  backgroundColor: pressed ? colors.bg.hover : 'transparent',
                  minHeight: 60,
                })}
                onPress={() => router.push('/planning')}
              >
                <View
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 9,
                    backgroundColor: nextBlockInfo.color,
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: 12,
                  }}
                >
                  <Text style={{ fontSize: 18 }}>{nextBlockInfo.emoji}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[typography.headline, { color: colors.text.primary }]}>
                    {nextBlockInfo.title || nextBlockInfo.name}
                  </Text>
                  <Text style={[typography.footnote, { marginTop: 2 }]}>
                    {nextBlockInfo.startTime} – {nextBlockInfo.endTime}
                  </Text>
                </View>
                <Symbol name={SymbolNames.chevronRight} size={14} color={colors.text.tertiary} />
              </Pressable>
            </View>
          </View>
        )}

        {/* Streaks */}
        <View style={{ marginBottom: 24 }}>
          <Text style={[typography.sectionHeader, { paddingHorizontal: 32, paddingBottom: 8 }]}>
            Streaks
          </Text>
          <View
            style={{
              backgroundColor: colors.bg.secondary,
              borderRadius: 13,
              marginHorizontal: 16,
              overflow: 'hidden',
              paddingHorizontal: 16,
              paddingVertical: 14,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <Symbol name={SymbolNames.flame} size={28} color={colors.system.orange} />
              <View style={{ flex: 1 }}>
                <Text style={[typography.headline, { color: colors.text.primary }]}>
                  {streaks.currentStreak} jour{streaks.currentStreak !== 1 ? 's' : ''} consécutifs
                </Text>
                <Text style={[typography.footnote, { marginTop: 2 }]}>
                  Record : {streaks.bestStreak} jour{streaks.bestStreak !== 1 ? 's' : ''}
                </Text>
              </View>
            </View>
            {/* Barre de progression vers record */}
            {streaks.bestStreak > 0 && (
              <View style={{ marginTop: 10 }}>
                <View
                  style={{
                    height: 4,
                    backgroundColor: colors.bg.hover,
                    borderRadius: 2,
                    overflow: 'hidden',
                  }}
                >
                  <View
                    style={{
                      width: `${Math.min(100, (streaks.currentStreak / Math.max(1, streaks.bestStreak)) * 100)}%`,
                      height: '100%',
                      backgroundColor: colors.system.orange,
                      borderRadius: 2,
                    }}
                  />
                </View>
              </View>
            )}
          </View>
        </View>

        {/* Tâches prioritaires */}
        {incompleteTasks.length > 0 && (
          <View style={{ marginBottom: 24 }}>
            <Text style={[typography.sectionHeader, { paddingHorizontal: 32, paddingBottom: 8 }]}>
              Tâches prioritaires
            </Text>
            <View
              style={{
                backgroundColor: colors.bg.secondary,
                borderRadius: 13,
                marginHorizontal: 16,
                overflow: 'hidden',
              }}
            >
              {incompleteTasks.map((task, index) => (
                <View key={task.id}>
                  <TaskCard
                    task={task}
                    onToggle={() => toggleTask(task.id)}
                    onDelete={handleDeleteTask}
                  />
                  {index < incompleteTasks.length - 1 && (
                    <View style={{ height: 0.5, backgroundColor: colors.separator.hairline, marginLeft: 57 }} />
                  )}
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Bannière Morning Ritual */}
        {!morningDone && (
          <View style={{ marginBottom: 24, marginHorizontal: 16 }}>
            <Pressable
              style={({ pressed }) => ({
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: pressed ? colors.bg.hover : colors.bg.secondary,
                borderRadius: 13,
                paddingHorizontal: 16,
                paddingVertical: 14,
                borderLeftWidth: 3,
                borderLeftColor: colors.system.orange,
              })}
              onPress={() => router.push('/morning-ritual')}
            >
              <Symbol name={SymbolNames.sun} size={18} color={colors.system.orange} style={{ marginRight: 10 }} />
              <View style={{ flex: 1 }}>
                <Text style={[typography.headline, { color: colors.text.primary }]}>
                  Commencer la journée
                </Text>
                <Text style={[typography.footnote, { marginTop: 2 }]}>
                  Morning Ritual · 5 étapes
                </Text>
              </View>
              <Symbol name={SymbolNames.chevronRight} size={14} color={colors.text.tertiary} />
            </Pressable>
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Quick-add modal (cross-platform) */}
      <Modal
        visible={quickAddVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setQuickAddVisible(false)}
      >
        <Pressable
          style={styles.modalBackdrop}
          onPress={() => setQuickAddVisible(false)}
        >
          <Pressable
            style={[styles.modalContent, { backgroundColor: colors.bg.secondary }]}
            onPress={(e) => e.stopPropagation()}
          >
            <Text style={[typography.headline, { color: colors.text.primary, marginBottom: 12 }]}>
              Nouvelle tâche
            </Text>
            <TextInput
              style={[styles.modalInput, {
                backgroundColor: colors.bg.hover,
                color: colors.text.primary,
                borderColor: colors.separator.default,
              }]}
              placeholder="Titre de la tâche"
              placeholderTextColor={colors.text.placeholder}
              value={quickAddTitle}
              onChangeText={setQuickAddTitle}
              onSubmitEditing={handleQuickAddSubmit}
              autoFocus
              returnKeyType="done"
            />
            <View style={styles.modalActions}>
              <Pressable
                style={[styles.modalButton, { backgroundColor: 'transparent' }]}
                onPress={() => setQuickAddVisible(false)}
              >
                <Text style={[typography.headline, { color: colors.system.blue }]}>Annuler</Text>
              </Pressable>
              <Pressable
                style={[styles.modalButton, { backgroundColor: colors.system.blue, borderRadius: 10 }]}
                onPress={handleQuickAddSubmit}
              >
                <Text style={[typography.headline, { color: colors.text.inverse }]}>Ajouter</Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    borderRadius: 13,
    padding: 20,
  },
  modalInput: {
    fontSize: 17,
    borderWidth: 0.5,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 16,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  modalButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
  },
});
