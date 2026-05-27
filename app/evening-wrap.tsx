import { useState, useMemo } from 'react';
import {
  View,
  Text,
  Pressable,
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
import { useTheme } from '../src/theme';

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
  if (score >= 90) return 'Journée parfaite';
  if (score >= 75) return 'Bonne journée';
  if (score >= 60) return 'Journée correcte';
  if (score >= 45) return 'Journée mitigée';
  if (score >= 30) return 'Journée difficile';
  return 'Ça arrive';
}

export default function EveningWrapScreen() {
  const router = useRouter();
  const { colors, typography } = useTheme();
  const [step, setStep] = useState(1);
  const [note, setNote] = useState('');

  const tasks = useTaskStore((state) => state.tasks);
  const deleteTask = useTaskStore((state) => state.deleteTask);
  const rescheduleTask = useTaskStore((state) => state.rescheduleTask);
  const getTodayTasks = useTaskStore((state) => state.getTodayTasks);

  const scores = useDayScoreStore((state) => state.scores);
  const setEveningWrapDone = useDayScoreStore((state) => state.setEveningWrapDone);

  const logEveningWrap = useRitualStore((state) => state.logEveningWrap);

  const today = todayISO();
  const todayTasks = useMemo(() => getTodayTasks(), [tasks, getTodayTasks]);
  const incompleteTasks = useMemo(() => todayTasks.filter((t) => !t.completed), [todayTasks]);

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

  const handleFinish = () => {
    logEveningWrap({ note: note.trim() || undefined });
    setEveningWrapDone(today);
    router.replace('/');
  };

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

  const renderStep1 = () => (
    <View style={styles.stepContent}>
      <Text style={[styles.stepTitle, { color: colors.text.primary }]}>Bilan de la journée</Text>

      <View style={{ alignItems: 'center', marginTop: 32, marginBottom: 16 }}>
        <Text style={{ fontSize: 72, fontWeight: '700', color: colors.text.primary, letterSpacing: -2 }}>
          {dayScore}
        </Text>
        <Text style={{ fontSize: typography.sizes.lg, color: colors.text.secondary, marginTop: 4 }}>
          {getScoreLabel(dayScore)}
        </Text>
      </View>

      {scoreDetail && (
        <View style={{ width: '100%', gap: 10, marginTop: 8 }}>
          {[
            { label: 'Blocs', value: scoreDetail.blocks, color: colors.system.blue },
            { label: 'Tâches', value: scoreDetail.tasks, color: colors.system.green },
            { label: 'Focus', value: scoreDetail.pomodoros, color: colors.system.purple },
            { label: 'Rituels', value: scoreDetail.rituals, color: colors.system.orange },
          ].map(({ label, value, color }) => (
            <View key={label} style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <Text style={{ fontSize: typography.sizes.sm, color: colors.text.quaternary, width: 52, textAlign: 'right' }}>
                {label}
              </Text>
              <View style={{ flex: 1, height: 3, backgroundColor: colors.bg.hover, borderRadius: 2, overflow: 'hidden' }}>
                <View style={{ width: `${Math.min(Math.max(value, 0), 100)}%`, height: '100%', backgroundColor: color, borderRadius: 2 }} />
              </View>
              <Text style={{ fontSize: typography.sizes.sm, color: colors.text.quaternary, width: 36, textAlign: 'right' }}>
                {Math.round(value)}%
              </Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.stepContent}>
      <Text style={[styles.stepTitle, { color: colors.text.primary }]}>Tâches non faites</Text>
      <Text style={[styles.stepSubtitle, { color: colors.text.secondary }]}>
        {incompleteTasks.length === 0
          ? "Toutes les tâches sont cochées. Bravo !"
          : `${incompleteTasks.length} tâche${incompleteTasks.length > 1 ? 's' : ''} en attente`}
      </Text>

      {incompleteTasks.length === 0 ? (
        <View style={{ alignItems: 'center', marginTop: 40 }}>
          <Ionicons name="checkmark-done-circle-outline" size={64} color={colors.system.green} />
          <Text style={{ fontSize: typography.sizes.lg, color: colors.system.green, marginTop: 16, fontWeight: '600' }}>
            Journée complète !
          </Text>
        </View>
      ) : (
        <View style={{ width: '100%', marginTop: 24, gap: 10 }}>
          {incompleteTasks.map((task) => (
            <View
              key={task.id}
              style={{
                backgroundColor: colors.bg.secondary,
                borderRadius: 13,
                padding: 16,
              }}
            >
              <Text style={{ fontSize: typography.sizes.lg, color: colors.text.primary, fontWeight: '500', letterSpacing: -0.41, marginBottom: 12 }} numberOfLines={2}>
                {task.title}
              </Text>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <Pressable
                  style={({ pressed }) => ({
                    flex: 1,
                    backgroundColor: pressed ? colors.system.gray4 : colors.bg.hover,
                    borderRadius: 10,
                    paddingVertical: 10,
                    alignItems: 'center',
                  })}
                  onPress={() => handleRescheduleTomorrow(task.id)}
                >
                  <Text style={{ fontSize: typography.sizes.sm, color: colors.text.primary, fontWeight: '500' }}>Demain</Text>
                </Pressable>
                <Pressable
                  style={({ pressed }) => ({
                    flex: 1,
                    backgroundColor: pressed ? colors.system.gray4 : colors.bg.hover,
                    borderRadius: 10,
                    paddingVertical: 10,
                    alignItems: 'center',
                  })}
                  onPress={() => handleRescheduleWeek(task.id)}
                >
                  <Text style={{ fontSize: typography.sizes.sm, color: colors.text.primary, fontWeight: '500' }}>Cette semaine</Text>
                </Pressable>
                <Pressable
                  style={({ pressed }) => ({
                    flex: 1,
                    backgroundColor: pressed ? colors.system.gray4 : colors.bg.hover,
                    borderRadius: 10,
                    paddingVertical: 10,
                    alignItems: 'center',
                  })}
                  onPress={() => handleDelete(task.id)}
                >
                  <Text style={{ fontSize: typography.sizes.sm, color: colors.system.red, fontWeight: '500' }}>Supprimer</Text>
                </Pressable>
              </View>
            </View>
          ))}
        </View>
      )}
    </View>
  );

  const renderStep3 = () => (
    <View style={styles.stepContent}>
      <Text style={[styles.stepTitle, { color: colors.text.primary }]}>Note du jour</Text>
      <Text style={[styles.stepSubtitle, { color: colors.text.secondary }]}>Qu'est-ce qui s'est passé aujourd'hui ?</Text>

      <TextInput
        style={{
          marginTop: 32,
          backgroundColor: colors.bg.secondary,
          borderRadius: 13,
          paddingHorizontal: 16,
          paddingVertical: 14,
          fontSize: typography.sizes.lg,
          color: colors.text.primary,
          width: '100%',
          height: 120,
          textAlignVertical: 'top',
          letterSpacing: -0.41,
        }}
        placeholder="1-3 phrases max..."
        placeholderTextColor={colors.text.placeholder}
        value={note}
        onChangeText={setNote}
        multiline
        maxLength={200}
        autoFocus
      />

      <Pressable onPress={nextStep} style={{ marginTop: 12, padding: 12 }}>
        <Text style={{ fontSize: typography.sizes.base, color: colors.text.secondary }}>Passer →</Text>
      </Pressable>
    </View>
  );

  const renderStep4 = () => (
    <View style={styles.stepContent}>
      <Text style={[styles.stepTitle, { color: colors.text.primary }]}>Journée validée.</Text>

      <View style={{ alignItems: 'center', marginTop: 32, marginBottom: 16 }}>
        <Text style={{ fontSize: 64, fontWeight: '700', color: colors.system.blue, letterSpacing: -2 }}>
          {dayScore}
        </Text>
        <Text style={{ fontSize: typography.sizes.lg, color: colors.text.secondary, marginTop: 4 }}>
          {getScoreLabel(dayScore)}
        </Text>
      </View>

      {note.trim() && (
        <View
          style={{
            backgroundColor: colors.bg.secondary,
            borderRadius: 13,
            padding: 16,
            width: '100%',
            marginTop: 8,
          }}
        >
          <Text style={{ fontSize: typography.sizes.xs, color: colors.text.quaternary, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>
            Ta note
          </Text>
          <Text style={{ fontSize: typography.sizes.base, color: colors.text.primary, fontStyle: 'italic' }}>{note.trim()}</Text>
        </View>
      )}

      <Text style={{ fontSize: typography.sizes.xl, color: colors.text.secondary, marginTop: 32 }}>Bonne nuit 🌙</Text>
    </View>
  );

  const renderStepIndicator = () => (
    <View style={{ flexDirection: 'row', gap: 6 }}>
      {[1, 2, 3, 4].map((s) => (
        <View
          key={s}
          style={{
            width: s === step ? 24 : 8,
            height: 8,
            borderRadius: 4,
            backgroundColor: s <= step ? colors.system.blue : colors.separator.default,
          }}
        />
      ))}
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bg.primary }]} edges={['top']}>
      <View style={styles.header}>
        <Text style={{ fontSize: typography.sizes.lg, fontWeight: '700', color: colors.text.primary }}>Flowday</Text>
        {renderStepIndicator()}
      </View>

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

      <View style={[styles.footer, { borderTopColor: colors.separator.default }]}>
        {step > 1 && (
          <Pressable
            style={{ padding: 12 }}
            onPress={() => setStep(step - 1)}
          >
            <Text style={{ fontSize: typography.sizes.lg, color: colors.text.secondary }}>← Retour</Text>
          </Pressable>
        )}

        <Pressable
          style={({ pressed }) => ({
            backgroundColor: pressed ? colors.system.blue + 'CC' : colors.system.blue,
            borderRadius: 13,
            paddingHorizontal: 24,
            paddingVertical: 14,
            opacity: step === 2 && !allTasksHandled ? 0.4 : 1,
          })}
          onPress={nextStep}
          disabled={step === 2 && !allTasksHandled}
        >
          <Text style={{ fontSize: typography.sizes.lg, fontWeight: '600', color: colors.text.inverse }}>
            {step === 4 ? 'Bonne nuit →' : 'Suivant →'}
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  stepContent: {
    alignItems: 'center',
    width: '100%',
  },
  stepTitle: {
    fontSize: 32,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  stepSubtitle: {
    fontSize: 17,
    textAlign: 'center',
    marginTop: 8,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderTopWidth: 0.5,
  },
});
