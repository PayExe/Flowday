import { useState, useMemo } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useTaskStore } from '../src/features/tasks/store';
import { useDayScoreStore } from '../src/features/dayScore/store';
import { useRitualStore } from '../src/features/rituals/store';
import { useTheme } from '../src/theme';
import { dateKey } from '../src/utils/dates';
import { hapticLight, hapticWarning } from '../src/utils/haptics';
import { PageInfo } from '../src/components/ui/PageInfo';
import { Button } from '../src/components/ui/Glass';
import { Card } from '../src/components/ui/List';
import { ProgressRing } from '../src/components/ui/ProgressRing';
import { Symbol, SymbolNames } from '../src/components/ui/Symbol';
import { ScoreCard, getScoreLabel } from '../src/components/dayScore/ScoreCard';
import { RitualScaffold, StepHeading } from '../src/components/rituals/RitualScaffold';
import { useTranslation } from '../src/i18n';

function todayISO(): string {
  return dateKey();
}

function tomorrowISO(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return dateKey(d);
}

function endOfWeekISO(): string {
  const d = new Date();
  const day = d.getDay();
  const daysUntilSunday = day === 0 ? 0 : 7 - day;
  d.setDate(d.getDate() + daysUntilSunday);
  return dateKey(d);
}

const STEP_COUNT = 4;

export default function EveningWrapScreen() {
  const router = useRouter();
  const { colors, typography } = useTheme();
  const { t } = useTranslation();
  const [step, setStep] = useState(1);
  const [note, setNote] = useState('');

  const [tasksSkipped, setTasksSkipped] = useState(false);

  const tasks = useTaskStore((state) => state.tasks);
  const deleteTask = useTaskStore((state) => state.deleteTask);
  const rescheduleTask = useTaskStore((state) => state.rescheduleTask);
  const getTodayTasks = useTaskStore((state) => state.getTodayTasks);

  const scores = useDayScoreStore((state) => state.scores);
  const getScoreForDate = useDayScoreStore((state) => state.getScoreForDate);
  const setEveningWrapDone = useDayScoreStore((state) => state.setEveningWrapDone);

  const logEveningWrap = useRitualStore((state) => state.logEveningWrap);

  const today = todayISO();
  const todayTasks = useMemo(() => getTodayTasks(), [tasks, getTodayTasks]);
  const incompleteTasks = useMemo(() => todayTasks.filter((t) => !t.completed), [todayTasks]);

  const score = useMemo(() => getScoreForDate(today), [scores, getScoreForDate, today]);
  const dayScore = score?.total || 0;

  const handleDelete = (taskId: string) => {
    Alert.alert(
      t('Supprimer cette tâche ?'),
      t('Cette action est irréversible.'),
      [
        { text: t('Annuler'), style: 'cancel' },
        { text: t('Supprimer'), style: 'destructive', onPress: () => deleteTask(taskId) },
      ]
    );
  };

  const handleFinish = () => {
    logEveningWrap({ note: note.trim() || undefined });
    setEveningWrapDone(today);
    router.replace('/');
  };

  const allTasksHandled = incompleteTasks.length === 0 || tasksSkipped;

  const nextStep = () => {
    hapticLight();
    if (step < STEP_COUNT) {
      if (step === 2 && !allTasksHandled) {
        Alert.alert(t('Tâches en attente'), t('Tu dois décider de chaque tâche non faite.'));
        return;
      }
      setStep(step + 1);
    } else {
      handleFinish();
    }
  };

  const renderReview = () => (
    <>
      <StepHeading title={t('Bilan de la journée')} />
      <ScoreCard
        score={dayScore}
        blocksPercent={score?.blocksPercent}
        tasksPercent={score?.tasksPercent}
        pomodorosPercent={score?.pomodorosPercent}
        ritualsPercent={score?.ritualsPercent}
      />
    </>
  );

  const renderTasks = () => (
    <>
      <StepHeading
        title={t('Tâches non faites')}
        subtitle={
          incompleteTasks.length === 0
            ? t('Toutes les tâches sont cochées. Bravo !')
            : t('pendingTasksCount', { count: incompleteTasks.length })
        }
      />

      {incompleteTasks.length === 0 ? (
        <View style={styles.allDone}>
          <Symbol
            name={SymbolNames.checkmarkCircle}
            size={64}
            color={colors.system.green}
            animationSpec={{ effect: { type: 'bounce', wholeSymbol: true } }}
          />
          <Text style={[typography.headline, { color: colors.system.green }]}>
            {t('Journée complète !')}
          </Text>
        </View>
      ) : (
        <View style={styles.taskList}>
          {incompleteTasks.map((task) => (
            <Card key={task.id} padded>
              <Text style={typography.headline} numberOfLines={2}>
                {task.title}
              </Text>
              <View style={styles.reschedule}>
                {[
                  { label: t('Demain'), onPress: () => rescheduleTask(task.id, tomorrowISO()) },
                  { label: t('Cette semaine'), onPress: () => rescheduleTask(task.id, endOfWeekISO()) },
                ].map((action) => (
                  <Pressable
                    key={action.label}
                    accessibilityRole="button"
                    style={({ pressed }) => [
                      styles.rescheduleButton,
                      { backgroundColor: pressed ? colors.bg.hover : colors.bg.tertiary },
                    ]}
                    onPress={() => { hapticLight(); action.onPress(); }}
                  >
                    <Text style={[typography.footnote, styles.rescheduleLabel, { color: colors.accent }]}>
                      {action.label}
                    </Text>
                  </Pressable>
                ))}
                <Pressable
                  accessibilityRole="button"
                  style={({ pressed }) => [
                    styles.rescheduleButton,
                    { backgroundColor: pressed ? colors.bg.hover : colors.bg.tertiary },
                  ]}
                  onPress={() => { hapticWarning(); handleDelete(task.id); }}
                >
                  <Text style={[typography.footnote, styles.rescheduleLabel, { color: colors.system.red }]}>
                    {t('Supprimer')}
                  </Text>
                </Pressable>
              </View>
            </Card>
          ))}
        </View>
      )}
    </>
  );

  const renderNote = () => (
    <>
      <StepHeading title={t('Note du jour')} subtitle={t("Qu'est-ce qui s'est passé aujourd'hui ?")} />
      <Card>
        <TextInput
          style={[typography.body, styles.noteInput]}
          placeholder={t('1-3 phrases max...')}
          placeholderTextColor={colors.text.placeholder}
          value={note}
          onChangeText={setNote}
          multiline
          maxLength={200}
          autoFocus
        />
      </Card>
    </>
  );

  const renderDone = () => (
    <>
      <StepHeading title={t('Journée validée.')} subtitle={t('Bonne nuit 🌙')} />
      <View style={styles.finalScore}>
        <ProgressRing value={dayScore} size={168} strokeWidth={14} color={colors.accent}>
          <Text style={[styles.finalScoreValue, { color: colors.text.primary }]}>{dayScore}</Text>
          <Text style={typography.footnote}>{getScoreLabel(dayScore, t)}</Text>
        </ProgressRing>
      </View>

      {note.trim().length > 0 && (
        <Card padded style={styles.noteCard}>
          <Text style={[typography.footnote, styles.noteLabel]}>{t('Ta note')}</Text>
          <Text style={typography.body}>{note.trim()}</Text>
        </Card>
      )}
    </>
  );

  return (
    <RitualScaffold
      step={step}
      stepCount={STEP_COUNT}
      leading={<Text style={typography.headline}>{t('Evening Wrap')}</Text>}
      trailing={
        <PageInfo
          title={t('Evening Wrap')}
          description={t('Termine ta journée proprement et prépare la suivante.')}
          points={[
            t('Consulte ton score et le détail de ta journée.'),
            t('Décide quoi faire des tâches non terminées : demain, cette semaine ou supprimer.'),
            t('Ajoute une courte note avant de valider ta journée.'),
          ]}
        />
      }
      onBack={step > 1 ? () => setStep(step - 1) : undefined}
      primaryTitle={
        step === STEP_COUNT
          ? t('Terminer la journée')
          : step === 3 && !note.trim()
            ? t('Passer')
            : t('Suivant')
      }
      onPrimary={nextStep}
      primaryDisabled={step === 2 && !allTasksHandled}
      secondary={
        step === 2 && incompleteTasks.length > 0 && !tasksSkipped ? (
          <Button title={t('Ignorer les tâches')} variant="plain" onPress={() => setTasksSkipped(true)} />
        ) : undefined
      }
    >
      {step === 1 && renderReview()}
      {step === 2 && renderTasks()}
      {step === 3 && renderNote()}
      {step === 4 && renderDone()}
    </RitualScaffold>
  );
}

const styles = StyleSheet.create({
  allDone: {
    alignItems: 'center',
    gap: 16,
  },
  taskList: {
    gap: 12,
  },
  reschedule: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 14,
  },
  rescheduleButton: {
    flex: 1,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  rescheduleLabel: {
    fontWeight: '600',
  },
  noteInput: {
    minHeight: 140,
    paddingHorizontal: 16,
    paddingVertical: 14,
    textAlignVertical: 'top',
  },
  finalScore: {
    alignItems: 'center',
  },
  finalScoreValue: {
    fontSize: 54,
    fontWeight: '700',
    letterSpacing: -1,
    fontVariant: ['tabular-nums'],
  },
  noteCard: {
    marginTop: 28,
  },
  noteLabel: {
    fontWeight: '600',
    marginBottom: 6,
  },
});
