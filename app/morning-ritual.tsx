import { useState, useMemo } from 'react';
import { View, Text, Pressable, TextInput, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useRitualStore } from '../src/features/rituals/store';
import { useTaskStore } from '../src/features/tasks/store';
import { useTemplateStore } from '../src/features/templates/store';
import { useLifeBlocksStore } from '../src/features/lifeBlocks/store';
import { useDayScoreStore } from '../src/features/dayScore/store';
import { radius, useTheme, withAlpha } from '../src/theme';
import { dateKey } from '../src/utils/dates';
import { formatLongDate } from '../src/utils/time';
import { hapticLight } from '../src/utils/haptics';
import { Mood } from '../src/types/ritual';
import { PageInfo } from '../src/components/ui/PageInfo';
import { Button } from '../src/components/ui/Glass';
import { Card, IconTile, List, Row } from '../src/components/ui/List';
import { RitualScaffold, StepHeading } from '../src/components/rituals/RitualScaffold';
import { skipMorningRitual } from '../src/utils/ritualNavigation';
import { useTranslation } from '../src/i18n';

const MOODS: { value: Mood; label: string; emoji: string; color: 'red' | 'yellow' | 'green' }[] = [
  { value: 'bad', label: 'Pas top', emoji: '😔', color: 'red' },
  { value: 'meh', label: 'Bof', emoji: '😐', color: 'yellow' },
  { value: 'good', label: 'En forme', emoji: '😄', color: 'green' },
];

function todayISO(): string {
  return dateKey();
}

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

type MorningStep = 'mood' | 'overview' | 'priorities' | 'intention' | 'summary';

export default function MorningRitualScreen() {
  const router = useRouter();
  const { colors, typography, isDark } = useTheme();
  const { t } = useTranslation();
  const [step, setStep] = useState(1);
  const [selectedMood, setSelectedMood] = useState<Mood | null>(null);
  const [intention, setIntention] = useState('');

  const logMorningRitual = useRitualStore((state) => state.logMorningRitual);
  const skipMorningRitualForToday = useRitualStore((state) => state.skipMorningRitualForToday);
  const morningConfig = useRitualStore((state) => state.morningConfig);

  const tasks = useTaskStore((state) => state.tasks);
  const getIncompleteTodayTasks = useTaskStore((state) => state.getIncompleteTodayTasks);

  const getTodayBlocks = useTemplateStore((state) => state.getTodayBlocks);
  const getBlockById = useLifeBlocksStore((state) => state.getBlockById);

  const setMorningRitualDone = useDayScoreStore((state) => state.setMorningRitualDone);

  const stepKeys = useMemo<MorningStep[]>(() => {
    const configuredSteps: MorningStep[] = [];
    if (morningConfig.steps.mood) configuredSteps.push('mood');
    if (!morningConfig.fastMode && morningConfig.steps.overview) configuredSteps.push('overview');
    if (!morningConfig.fastMode && morningConfig.steps.priorities) configuredSteps.push('priorities');
    if (morningConfig.steps.intention) configuredSteps.push('intention');
    return [...configuredSteps, 'summary'];
  }, [morningConfig]);

  const currentStep = stepKeys[step - 1] || 'summary';

  const todayBlocks = useMemo(() => {
    return getTodayBlocks()
      .sort((a, b) => a.startTime.localeCompare(b.startTime))
      .map((b) => {
        const lb = getBlockById(b.lifeBlockId);
        return { ...b, lifeBlock: lb };
      });
  }, [getTodayBlocks, getBlockById]);

  const topTasks = useMemo(() => {
    const incomplete = getIncompleteTodayTasks();
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return incomplete
      .sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority])
      .slice(0, 3);
  }, [tasks, getIncompleteTodayTasks]);

  const canProceed = currentStep !== 'mood' || selectedMood !== null;
  const selectedMoodOption = MOODS.find((m) => m.value === selectedMood);

  const handleFinish = () => {
    logMorningRitual({
      mood: selectedMood || undefined,
      intention: intention.trim() || undefined,
    });
    setMorningRitualDone(todayISO());
    router.replace('/');
  };

  const nextStep = () => {
    hapticLight();
    if (step < stepKeys.length) {
      setStep(step + 1);
    } else {
      handleFinish();
    }
  };

  const renderMood = () => (
    <>
      <StepHeading title={t('Bonjour.')} subtitle={capitalize(formatLongDate(new Date(), t))} />
      <Text style={[typography.headline, styles.question]}>{t('Comment tu te sens ?')}</Text>
      <View style={styles.moods}>
        {MOODS.map((m) => {
          const selected = selectedMood === m.value;
          const moodColor = colors.system[m.color];
          return (
            <Pressable
              key={m.value}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              accessibilityLabel={t(m.label)}
              style={[
                styles.mood,
                {
                  backgroundColor: selected
                    ? withAlpha(moodColor, isDark ? 0.3 : 0.18)
                    : colors.bg.secondary,
                  borderColor: selected ? moodColor : 'transparent',
                },
              ]}
              onPress={() => { hapticLight(); setSelectedMood(m.value); }}
            >
              <Text style={styles.moodEmoji}>{m.emoji}</Text>
              <Text style={[typography.subheadline, { color: colors.text.primary, fontWeight: selected ? '600' : '400' }]}>
                {t(m.label)}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </>
  );

  const renderOverview = () => (
    <>
      <StepHeading
        title={t('Ta journée')}
        subtitle={
          todayBlocks.length === 0
            ? t("Aucun bloc planifié aujourd'hui")
            : t('plannedBlocksCount', { count: todayBlocks.length })
        }
      />
      {todayBlocks.length > 0 && (
        <List separatorInset={72}>
          {todayBlocks.map((b) => (
            <Row
              key={b.id}
              leading={<IconTile color={b.lifeBlock?.color || colors.system.gray} emoji={b.lifeBlock?.emoji || '⬜'} size={44} />}
              title={b.title || b.lifeBlock?.name || t('Bloc')}
              subtitle={`${b.startTime} – ${b.endTime}`}
            />
          ))}
        </List>
      )}
    </>
  );

  const renderPriorities = () => (
    <>
      <StepHeading
        title={t('Tes priorités')}
        subtitle={
          topTasks.length === 0
            ? t('Aucune priorité pour le moment.')
            : t("Voici ce qui attend aujourd'hui")
        }
      />
      {topTasks.length > 0 && (
        <List separatorInset={60}>
          {topTasks.map((task, index) => (
            <View key={task.id} style={styles.priority}>
              <View style={[styles.rank, { backgroundColor: colors.bg.tertiary }]}>
                <Text style={[typography.footnote, { color: colors.text.primary, fontWeight: '600' }]}>
                  {index + 1}
                </Text>
              </View>
              <Text style={[typography.body, styles.priorityTitle]} numberOfLines={2}>
                {task.title}
              </Text>
            </View>
          ))}
        </List>
      )}
    </>
  );

  const renderIntention = () => (
    <>
      <StepHeading title={t('Intention')} subtitle={t('Un mot pour cette journée ?')} />
      <Card>
        <TextInput
          style={[typography.title3, styles.intentionInput]}
          placeholder={t('Focus, Récupération, Sprint...')}
          placeholderTextColor={colors.text.placeholder}
          value={intention}
          onChangeText={setIntention}
          onSubmitEditing={nextStep}
          returnKeyType="done"
          maxLength={20}
          autoFocus
        />
      </Card>
    </>
  );

  const renderSummary = () => (
    <>
      <StepHeading
        title={t("C'est parti.")}
        subtitle={
          intention.trim()
            ? `${t('Intention :')} ${intention.trim()}`
            : t('Objectif : journée à 80+')
        }
      />
      <List>
        {selectedMoodOption && (
          <Row title={t('Humeur')} value={`${selectedMoodOption.emoji} ${t(selectedMoodOption.label)}`} />
        )}
        {todayBlocks.length > 0 && (
          <Row title={t('Blocs')} value={t('plannedBlocksCount', { count: todayBlocks.length })} />
        )}
        {topTasks.length > 0 && (
          <Row title={t('Priorités')} value={t('tasksCount', { count: topTasks.length })} />
        )}
      </List>
    </>
  );

  return (
    <RitualScaffold
      step={step}
      stepCount={stepKeys.length}
      leading={
        <Button
          title={t('Plus tard')}
          variant="plain"
          style={styles.later}
          onPress={() => {
            skipMorningRitualForToday();
            skipMorningRitual(router);
          }}
        />
      }
      trailing={
        <PageInfo
          title={t('Morning Ritual')}
          description={t('Prépare ta journée en quelques étapes avant de commencer.')}
          points={[
            t('Indique ton humeur pour adapter ton point de départ.'),
            t('Consulte tes blocs et tes priorités du jour.'),
            t('Ajoute une intention pour garder un cap simple aujourd’hui.'),
          ]}
        />
      }
      onBack={step > 1 ? () => setStep(step - 1) : undefined}
      primaryTitle={
        currentStep === 'summary'
          ? t('Commencer la journée')
          : currentStep === 'intention' && !intention.trim()
            ? t('Passer')
            : t('Suivant')
      }
      onPrimary={nextStep}
      primaryDisabled={!canProceed}
    >
      {currentStep === 'mood' && renderMood()}
      {currentStep === 'overview' && renderOverview()}
      {currentStep === 'priorities' && renderPriorities()}
      {currentStep === 'intention' && renderIntention()}
      {currentStep === 'summary' && renderSummary()}
    </RitualScaffold>
  );
}

const styles = StyleSheet.create({
  later: {
    marginLeft: -14,
  },
  question: {
    textAlign: 'center',
    marginBottom: 16,
  },
  moods: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 16,
  },
  mood: {
    flex: 1,
    alignItems: 'center',
    gap: 8,
    paddingVertical: 20,
    borderRadius: radius.lg,
    borderCurve: 'continuous',
    borderWidth: 2,
  },
  moodEmoji: {
    fontSize: 36,
  },
  priority: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minHeight: 56,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  rank: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  priorityTitle: {
    flex: 1,
  },
  intentionInput: {
    textAlign: 'center',
    paddingHorizontal: 16,
    paddingVertical: 18,
  },
});
