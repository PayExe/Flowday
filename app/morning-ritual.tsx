import { useState, useMemo, useRef, useEffect } from 'react';
import {
  View,
  Text,
  Pressable,
  TextInput,
  StyleSheet,
  ScrollView,
  Animated,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRitualStore } from '../src/features/rituals/store';
import { useTaskStore } from '../src/features/tasks/store';
import { useTemplateStore } from '../src/features/templates/store';
import { useLifeBlocksStore } from '../src/features/lifeBlocks/store';
import { useDayScoreStore } from '../src/features/dayScore/store';
import { useTheme } from '../src/theme';
import { dateKey } from '../src/utils/dates';
import { hapticLight } from '../src/utils/haptics';
import { Mood } from '../src/types/ritual';

const MOODS: { value: Mood; label: string; emoji: string; color: string }[] = [
  { value: 'bad', label: 'Pas top', emoji: '🔴', color: '#FF453A' },
  { value: 'meh', label: 'Bof', emoji: '🟡', color: '#FFD60A' },
  { value: 'good', label: 'En forme', emoji: '🟢', color: '#30D158' },
];

const DAY_LABELS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];

function todayISO(): string {
  return dateKey();
}

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export default function MorningRitualScreen() {
  const router = useRouter();
  const { colors, typography } = useTheme();
  const [step, setStep] = useState(1);
  const [selectedMood, setSelectedMood] = useState<Mood | null>(null);
  const [intention, setIntention] = useState('');

  const logMorningRitual = useRitualStore((state) => state.logMorningRitual);
  const morningConfig = useRitualStore((state) => state.morningConfig);

  const tasks = useTaskStore((state) => state.tasks);
  const getIncompleteTodayTasks = useTaskStore((state) => state.getIncompleteTodayTasks);

  const getTodayBlocks = useTemplateStore((state) => state.getTodayBlocks);
  const getBlockById = useLifeBlocksStore((state) => state.getBlockById);

  const setMorningRitualDone = useDayScoreStore((state) => state.setMorningRitualDone);

  const todayLabel = useMemo(() => {
    const now = new Date();
    const dayName = DAY_LABELS[now.getDay() === 0 ? 6 : now.getDay() - 1];
    const dateNum = now.getDate();
    const monthNames = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
    return `${dayName} ${dateNum} ${monthNames[now.getMonth()]}`;
  }, []);

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

  const canProceed = useMemo(() => {
    if (step === 1 && morningConfig.steps.mood) return selectedMood !== null;
    if (step === 3 && morningConfig.steps.priorities) return true;
    return true;
  }, [step, selectedMood, morningConfig]);

  const dotWidths = useRef([24, 8, 8, 8, 8].map((w) => new Animated.Value(w))).current;

  useEffect(() => {
    dotWidths.forEach((dot, i) => {
      Animated.spring(dot, {
        toValue: i === step - 1 ? 24 : 8,
        useNativeDriver: false,
        friction: 8,
      }).start();
    });
  }, [step]);

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
    if (step < 5) {
      setStep(step + 1);
    } else {
      handleFinish();
    }
  };

  const renderStep1 = () => (
    <View style={styles.stepContent}>
      <Text style={[styles.stepTitle, { color: colors.text.primary }]}>Bonjour.</Text>
      <Text style={[styles.stepSubtitle, { color: colors.text.secondary }]}>{capitalize(todayLabel)}</Text>

      {morningConfig.steps.mood && (
        <View style={{ marginTop: 40, alignItems: 'center', width: '100%' }}>
          <Text style={{ fontSize: typography.sizes.base, color: colors.text.secondary, marginBottom: 20 }}>
            Comment tu te sens ?
          </Text>
          <View style={{ flexDirection: 'row', gap: 12 }}>
            {MOODS.map((m) => (
              <Pressable
                key={m.value}
                style={({ pressed }) => ({
                  alignItems: 'center',
                  padding: 16,
                  borderRadius: 13,
                  borderWidth: 2,
                  borderColor: selectedMood === m.value ? m.color : colors.separator.default,
                  backgroundColor: pressed ? colors.bg.hover : colors.bg.secondary,
                  minWidth: 90,
                })}
                onPress={() => { hapticLight(); setSelectedMood(m.value); }}
              >
                <Text style={{ fontSize: 28, marginBottom: 8 }}>{m.emoji}</Text>
                <Text
                  style={{
                    fontSize: typography.sizes.base,
                    color: selectedMood === m.value ? m.color : colors.text.secondary,
                    fontWeight: selectedMood === m.value ? '600' : '400',
                  }}
                >
                  {m.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
      )}
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.stepContent}>
      <Text style={[styles.stepTitle, { color: colors.text.primary }]}>Ta journée</Text>
      <Text style={[styles.stepSubtitle, { color: colors.text.secondary }]}>
        {todayBlocks.length === 0
          ? "Aucun bloc planifié aujourd'hui"
          : `${todayBlocks.length} bloc${todayBlocks.length > 1 ? 's' : ''} prévu${todayBlocks.length > 1 ? 's' : ''}`}
      </Text>

      <View style={{ marginTop: 24, width: '100%', gap: 8 }}>
        {todayBlocks.map((b) => (
          <View
            key={b.id}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: colors.bg.secondary,
              borderRadius: 13,
              borderLeftWidth: 3,
              borderLeftColor: b.lifeBlock?.color || colors.system.gray,
              padding: 14,
            }}
          >
            <Text style={{ fontSize: typography.sizes.xl, marginRight: 12 }}>{b.lifeBlock?.emoji || '⬜'}</Text>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: typography.sizes.lg, fontWeight: '500', color: colors.text.primary, letterSpacing: -0.41 }}>
                {b.title || b.lifeBlock?.name || 'Bloc'}
              </Text>
              <Text style={{ fontSize: typography.sizes.sm, color: colors.text.secondary, marginTop: 2 }}>
                {b.startTime} – {b.endTime}
              </Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );

  const renderStep3 = () => (
    <View style={styles.stepContent}>
      <Text style={[styles.stepTitle, { color: colors.text.primary }]}>Tes priorités</Text>
      <Text style={[styles.stepSubtitle, { color: colors.text.secondary }]}>
        {topTasks.length === 0
          ? "Pas de tâches en cours"
          : "Voici ce qui attend aujourd'hui"}
      </Text>

      <View style={{ marginTop: 24, width: '100%', gap: 10 }}>
        {topTasks.map((task, index) => (
          <View
            key={task.id}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: colors.bg.secondary,
              borderRadius: 13,
              padding: 16,
              gap: 12,
            }}
          >
            <View
              style={{
                width: 8,
                height: 8,
                borderRadius: 4,
                backgroundColor:
                  index === 0 ? colors.system.red : index === 1 ? colors.system.yellow : colors.system.green,
              }}
            />
            <Text style={{ fontSize: typography.sizes.lg, color: colors.text.primary, flex: 1, letterSpacing: -0.41 }} numberOfLines={2}>
              {task.title}
            </Text>
          </View>
        ))}
        {topTasks.length === 0 && (
          <Text style={{ fontSize: typography.sizes.sm, color: colors.text.quaternary, textAlign: 'center', marginTop: 12 }}>
            Ajoute des tâches dans l'onglet Aujourd'hui pour voir tes priorités ici.
          </Text>
        )}
      </View>
    </View>
  );

  const renderStep4 = () => (
    <View style={styles.stepContent}>
      <Text style={[styles.stepTitle, { color: colors.text.primary }]}>Intention</Text>
      <Text style={[styles.stepSubtitle, { color: colors.text.secondary }]}>Un mot pour cette journée ?</Text>

      <TextInput
        style={{
          marginTop: 40,
          backgroundColor: colors.bg.secondary,
          borderRadius: 13,
          paddingHorizontal: 20,
          paddingVertical: 16,
          fontSize: typography.sizes.xl,
          fontWeight: '500',
          color: colors.text.primary,
          textAlign: 'center',
          width: '100%',
          letterSpacing: -0.4,
        }}
        placeholder="Focus, Récupération, Sprint..."
        placeholderTextColor={colors.text.placeholder}
        value={intention}
        onChangeText={setIntention}
        maxLength={20}
        autoFocus
      />

      <Pressable onPress={nextStep} style={{ marginTop: 16, padding: 12 }}>
        <Text style={{ fontSize: typography.sizes.base, color: colors.text.secondary }}>Passer →</Text>
      </Pressable>
    </View>
  );

  const renderStep5 = () => (
    <View style={styles.stepContent}>
      <Text style={[styles.stepTitle, { color: colors.text.primary }]}>C'est parti.</Text>
      <Text style={[styles.stepSubtitle, { color: colors.text.secondary }]}>
        {intention.trim()
          ? `Intention : ${intention.trim()}`
          : "Objectif : journée à 80+"}
      </Text>

      <View style={{ marginTop: 32, width: '100%', gap: 12 }}>
        {selectedMood && (
          <View style={[styles.recapRow, { backgroundColor: colors.bg.secondary }]}>
            <Text style={[styles.recapLabel, { color: colors.text.secondary }]}>Humeur</Text>
            <Text style={[styles.recapValue, { color: colors.text.primary }]}>
              {MOODS.find((m) => m.value === selectedMood)?.emoji}{' '}
              {MOODS.find((m) => m.value === selectedMood)?.label}
            </Text>
          </View>
        )}

        {todayBlocks.length > 0 && (
          <View style={[styles.recapRow, { backgroundColor: colors.bg.secondary }]}>
            <Text style={[styles.recapLabel, { color: colors.text.secondary }]}>Blocs</Text>
            <Text style={[styles.recapValue, { color: colors.text.primary }]}>{todayBlocks.length} aujourd'hui</Text>
          </View>
        )}

        {topTasks.length > 0 && (
          <View style={[styles.recapRow, { backgroundColor: colors.bg.secondary }]}>
            <Text style={[styles.recapLabel, { color: colors.text.secondary }]}>Priorités</Text>
            <Text style={[styles.recapValue, { color: colors.text.primary }]}>{topTasks.length} tâches</Text>
          </View>
        )}
      </View>
    </View>
  );

  const renderStepIndicator = () => (
    <View style={{ flexDirection: 'row', gap: 6 }}>
      {[1, 2, 3, 4, 5].map((s) => (
        <Animated.View
          key={s}
          style={{
            width: dotWidths[s - 1],
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
        <Pressable
          style={{ padding: 8 }}
          onPress={() => router.replace('/')}
        >
          <Text style={{ fontSize: typography.sizes.lg, color: colors.system.blue }}>Plus tard</Text>
        </Pressable>
        <Text style={{ fontSize: typography.sizes.lg, fontWeight: '700', color: colors.text.primary }}>Flowday</Text>
        {renderStepIndicator()}
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
        {step === 4 && renderStep4()}
        {step === 5 && renderStep5()}
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
            opacity: canProceed ? 1 : 0.4,
          })}
          onPress={nextStep}
          disabled={!canProceed}
        >
          <Text style={{ fontSize: typography.sizes.lg, fontWeight: '600', color: colors.text.inverse }}>
            {step === 5 ? 'Commencer la journée →' : 'Suivant →'}
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
  recapRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 13,
  },
  recapLabel: {
    fontSize: 15,
  },
  recapValue: {
    fontSize: 15,
    fontWeight: '500',
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
