import { useState, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTaskStore } from '../src/features/tasks/store';
import { useDayScoreStore } from '../src/features/dayScore/store';
import { useRitualStore } from '../src/features/rituals/store';
import { useFocusStore } from '../src/features/focus/store';
import { Colors, Spacing, Radius, Typography } from '../src/theme';
import { Task } from '../src/types/task';

function todayISO(): string {
  return new Date().toISOString().split('T')[0];
}

function tomorrowISO(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split('T')[0];
}

function endOfWeekISO(): string {
  const d = new Date();
  const day = d.getDay();
  const daysUntilSunday = day === 0 ? 0 : 7 - day;
  d.setDate(d.getDate() + daysUntilSunday);
  return d.toISOString().split('T')[0];
}

function getScoreLabel(score: number): string {
  if (score >= 90) return 'Journée parfaite. 🔥';
  if (score >= 75) return 'Bonne journée.';
  if (score >= 60) return 'Journée correcte.';
  if (score >= 45) return 'Journée mitigée.';
  if (score >= 30) return 'Journée difficile.';
  return 'Ça arrive.';
}

interface ScoreBarProps {
  label: string;
  percent: number;
  color: string;
}

function ScoreBar({ label, percent, color }: ScoreBarProps) {
  const p = Math.min(Math.max(percent, 0), 100);
  return (
    <View style={styles.scoreBarRow}>
      <Text style={styles.scoreBarLabel}>{label}</Text>
      <View style={styles.scoreBarTrack}>
        <View style={[styles.scoreBarFill, { width: `${p}%`, backgroundColor: color }]} />
      </View>
      <Text style={styles.scoreBarValue}>{Math.round(p)}%</Text>
    </View>
  );
}

export default function EveningWrapScreen() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [note, setNote] = useState('');

  const tasks = useTaskStore((state) => state.tasks);
  const deleteTask = useTaskStore((state) => state.deleteTask);
  const rescheduleTask = useTaskStore((state) => state.rescheduleTask);
  const getTodayTasks = useTaskStore((state) => state.getTodayTasks);

  const scores = useDayScoreStore((state) => state.scores);
  const recalculateScore = useDayScoreStore((state) => state.recalculateScore);
  const setEveningWrapDone = useDayScoreStore((state) => state.setEveningWrapDone);

  const logEveningWrap = useRitualStore((state) => state.logEveningWrap);

  const focusState = useFocusStore((state) => state.focusState);

  const today = todayISO();
  const todayTasks = useMemo(() => getTodayTasks(), [tasks, getTodayTasks]);
  const incompleteTasks = useMemo(() => todayTasks.filter((t) => !t.completed), [todayTasks]);

  // ─── Calcul Day Score final ────────────────────────────────
  const dayScore = useMemo(() => {
    const score = scores.find((s) => s.date === today);
    return score?.total || 0;
  }, [scores, today]);

  const scoreDetail = useMemo(() => {
    const score = scores.find((s) => s.date === today);
    if (!score) return null;
    return {
      blocks: score.blocksPercent,
      tasks: score.tasksPercent,
      pomodoros: score.pomodorosPercent,
      rituals: score.ritualsPercent,
    };
  }, [scores, today]);

  // ─── Gestion tâches non faites ─────────────────────────────
  const handleRescheduleTomorrow = (taskId: string) => {
    rescheduleTask(taskId, tomorrowISO());
  };

  const handleRescheduleWeek = (taskId: string) => {
    rescheduleTask(taskId, endOfWeekISO());
  };

  const handleDelete = (taskId: string) => {
    Alert.alert(
      'Supprimer cette tâche ?',
      'Cette action est irréversible.',
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Supprimer', style: 'destructive', onPress: () => deleteTask(taskId) },
      ]
    );
  };

  // ─── Finalisation ──────────────────────────────────────────
  const handleFinish = () => {
    logEveningWrap({ note: note.trim() || undefined });
    setEveningWrapDone(today);
    router.replace('/');
  };

  // ─── Vérifier si toutes les tâches non faites ont été traitées ─
  const allTasksHandled = incompleteTasks.length === 0;

  const nextStep = () => {
    if (step < 4) {
      if (step === 2 && !allTasksHandled) {
        Alert.alert('Tâches en attente', 'Tu dois décider de chaque tâche non faite.');
        return;
      }
      setStep(step + 1);
    } else {
      handleFinish();
    }
  };

  // ─── Render Step 1 : Bilan visuel ──────────────────────────
  const renderStep1 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Bilan de la journée</Text>

      <View style={styles.scoreContainer}>
        <Text style={styles.bigScore}>{dayScore}</Text>
        <Text style={styles.scoreLabel}>{getScoreLabel(dayScore)}</Text>
      </View>

      {scoreDetail && (
        <View style={styles.barsContainer}>
          <ScoreBar label="Blocs" percent={scoreDetail.blocks} color={Colors.accentCyan} />
          <ScoreBar label="Tâches" percent={scoreDetail.tasks} color={Colors.accentGreen} />
          <ScoreBar label="Focus" percent={scoreDetail.pomodoros} color={Colors.accentViolet} />
          <ScoreBar label="Rituals" percent={scoreDetail.rituals} color={Colors.accentYellow} />
        </View>
      )}
    </View>
  );

  // ─── Render Step 2 : Tâches non faites ─────────────────────
  const renderStep2 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Tâches non faites</Text>
      <Text style={styles.stepSubtitle}>
        {incompleteTasks.length === 0
          ? "Toutes les tâches sont cochées. Bravo !"
          : `${incompleteTasks.length} tâche${incompleteTasks.length > 1 ? 's' : ''} en attente`}
      </Text>

      {incompleteTasks.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="checkmark-done-circle-outline" size={64} color={Colors.accentGreen} />
          <Text style={styles.emptyStateText}>Journée complète !</Text>
        </View>
      ) : (
        <View style={styles.tasksList}>
          {incompleteTasks.map((task) => (
            <View key={task.id} style={styles.taskCard}>
              <Text style={styles.taskTitle} numberOfLines={2}>{task.title}</Text>
              <View style={styles.taskActions}>
                <TouchableOpacity
                  style={styles.actionBtn}
                  onPress={() => handleRescheduleTomorrow(task.id)}
                >
                  <Text style={styles.actionBtnText}>Demain</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.actionBtn}
                  onPress={() => handleRescheduleWeek(task.id)}
                >
                  <Text style={styles.actionBtnText}>Cette semaine</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionBtn, styles.deleteBtn]}
                  onPress={() => handleDelete(task.id)}
                >
                  <Text style={[styles.actionBtnText, styles.deleteBtnText]}>Supprimer</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      )}
    </View>
  );

  // ─── Render Step 3 : Note du jour ──────────────────────────
  const renderStep3 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Note du jour</Text>
      <Text style={styles.stepSubtitle}>Qu'est-ce qui s'est passé aujourd'hui ?</Text>

      <TextInput
        style={styles.noteInput}
        placeholder="1-3 phrases max..."
        placeholderTextColor={Colors.textTertiary}
        value={note}
        onChangeText={setNote}
        multiline
        maxLength={200}
        autoFocus
      />

      <TouchableOpacity style={styles.skipBtn} onPress={nextStep}>
        <Text style={styles.skipText}>Passer →</Text>
      </TouchableOpacity>
    </View>
  );

  // ─── Render Step 4 : Score final ───────────────────────────
  const renderStep4 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Journée validée.</Text>

      <View style={styles.finalScoreBox}>
        <Text style={styles.finalScore}>{dayScore}</Text>
        <Text style={styles.finalScoreLabel}>{getScoreLabel(dayScore)}</Text>
      </View>

      {note.trim() && (
        <View style={styles.noteBox}>
          <Text style={styles.noteLabel}>Ta note</Text>
          <Text style={styles.noteText}>{note.trim()}</Text>
        </View>
      )}

      <Text style={styles.bonneNuit}>Bonne nuit 🌙</Text>
    </View>
  );

  // ─── Step indicator ────────────────────────────────────────
  const renderStepIndicator = () => (
    <View style={styles.stepIndicator}>
      {[1, 2, 3, 4].map((s) => (
        <View
          key={s}
          style={[
            styles.stepDot,
            s === step && styles.stepDotActive,
            s < step && styles.stepDotDone,
          ]}
        />
      ))}
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Flowday</Text>
        {renderStepIndicator()}
      </View>

      {/* Content */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
        {step === 4 && renderStep4()}
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        {step > 1 && (
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => setStep(step - 1)}
          >
            <Text style={styles.backBtnText}>← Retour</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[
            styles.nextBtn,
            step === 2 && !allTasksHandled && styles.nextBtnDisabled,
          ]}
          onPress={nextStep}
          disabled={step === 2 && !allTasksHandled}
        >
          <Text style={styles.nextBtnText}>
            {step === 4 ? 'Bonne nuit →' : 'Suivant →'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bgPrimary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  headerTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
  },
  stepIndicator: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  stepDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.bgInput,
  },
  stepDotActive: {
    backgroundColor: Colors.accentCyan,
    width: 24,
  },
  stepDotDone: {
    backgroundColor: Colors.accentCyan + '60',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
  stepContent: {
    alignItems: 'center',
    width: '100%',
  },
  stepTitle: {
    fontSize: Typography.sizes.xxxl,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  stepSubtitle: {
    fontSize: Typography.sizes.lg,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: Spacing.sm,
  },
  // ─── Step 1 ────────────────────────────────────────────────
  scoreContainer: {
    alignItems: 'center',
    marginTop: Spacing.xxl,
    marginBottom: Spacing.lg,
  },
  bigScore: {
    fontSize: 72,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
    letterSpacing: -2,
  },
  scoreLabel: {
    fontSize: Typography.sizes.lg,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  barsContainer: {
    width: '100%',
    gap: Spacing.md,
    marginTop: Spacing.md,
  },
  scoreBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  scoreBarLabel: {
    width: 70,
    fontSize: Typography.sizes.sm,
    color: Colors.textSecondary,
    textAlign: 'right',
  },
  scoreBarTrack: {
    flex: 1,
    height: 8,
    backgroundColor: Colors.bgInput,
    borderRadius: Radius.full,
    overflow: 'hidden',
  },
  scoreBarFill: {
    height: '100%',
    borderRadius: Radius.full,
  },
  scoreBarValue: {
    width: 40,
    fontSize: Typography.sizes.sm,
    color: Colors.textSecondary,
    textAlign: 'right',
  },
  // ─── Step 2 ────────────────────────────────────────────────
  emptyState: {
    alignItems: 'center',
    marginTop: Spacing.xxl,
  },
  emptyStateText: {
    fontSize: Typography.sizes.lg,
    color: Colors.accentGreen,
    marginTop: Spacing.md,
    fontWeight: Typography.weights.semibold,
  },
  tasksList: {
    width: '100%',
    marginTop: Spacing.xl,
    gap: Spacing.md,
  },
  taskCard: {
    backgroundColor: Colors.bgSurface,
    borderRadius: Radius.md,
    padding: Spacing.lg,
  },
  taskTitle: {
    fontSize: Typography.sizes.base,
    color: Colors.textPrimary,
    fontWeight: Typography.weights.medium,
    marginBottom: Spacing.md,
  },
  taskActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  actionBtn: {
    flex: 1,
    backgroundColor: Colors.bgInput,
    borderRadius: Radius.sm,
    paddingVertical: Spacing.sm,
    alignItems: 'center',
  },
  actionBtnText: {
    fontSize: Typography.sizes.sm,
    color: Colors.textSecondary,
    fontWeight: Typography.weights.medium,
  },
  deleteBtn: {
    backgroundColor: Colors.accentRed + '15',
  },
  deleteBtnText: {
    color: Colors.accentRed,
  },
  // ─── Step 3 ────────────────────────────────────────────────
  noteInput: {
    marginTop: Spacing.xxl,
    backgroundColor: Colors.bgInput,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    fontSize: Typography.sizes.base,
    color: Colors.textPrimary,
    width: '100%',
    height: 120,
    textAlignVertical: 'top',
  },
  skipBtn: {
    marginTop: Spacing.lg,
    padding: Spacing.md,
  },
  skipText: {
    fontSize: Typography.sizes.base,
    color: Colors.textSecondary,
  },
  // ─── Step 4 ────────────────────────────────────────────────
  finalScoreBox: {
    alignItems: 'center',
    marginTop: Spacing.xxl,
    marginBottom: Spacing.lg,
  },
  finalScore: {
    fontSize: 64,
    fontWeight: Typography.weights.bold,
    color: Colors.accentCyan,
    letterSpacing: -2,
  },
  finalScoreLabel: {
    fontSize: Typography.sizes.lg,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  noteBox: {
    backgroundColor: Colors.bgSurface,
    borderRadius: Radius.md,
    padding: Spacing.lg,
    width: '100%',
    marginTop: Spacing.md,
  },
  noteLabel: {
    fontSize: Typography.sizes.xs,
    color: Colors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: Spacing.sm,
  },
  noteText: {
    fontSize: Typography.sizes.base,
    color: Colors.textPrimary,
    fontStyle: 'italic',
  },
  bonneNuit: {
    fontSize: Typography.sizes.xl,
    color: Colors.textSecondary,
    marginTop: Spacing.xxl,
  },
  // ─── Footer ────────────────────────────────────────────────
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  backBtn: {
    padding: Spacing.md,
  },
  backBtnText: {
    fontSize: Typography.sizes.base,
    color: Colors.textSecondary,
  },
  nextBtn: {
    backgroundColor: Colors.accentCyan,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
  },
  nextBtnDisabled: {
    backgroundColor: Colors.bgInput,
  },
  nextBtnText: {
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.semibold,
    color: Colors.bgPrimary,
  },
});
