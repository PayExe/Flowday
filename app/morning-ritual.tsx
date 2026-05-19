import { useState, useMemo } from 'react';
import {
  View,
  Text,
  Pressable,
  TextInput,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRitualStore } from '../src/features/rituals/store';
import { useTaskStore } from '../src/features/tasks/store';
import { useTemplateStore } from '../src/features/templates/store';
import { useLifeBlocksStore } from '../src/features/lifeBlocks/store';
import { useDayScoreStore } from '../src/features/dayScore/store';
import { Mood } from '../src/types/ritual';

const MOODS: { value: Mood; label: string; emoji: string; color: string }[] = [
  { value: 'bad', label: 'Pas top', emoji: '🔴', color: '#FF453A' },
  { value: 'meh', label: 'Bof', emoji: '🟡', color: '#FFD60A' },
  { value: 'good', label: 'En forme', emoji: '🟢', color: '#30D158' },
];

const DAY_LABELS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];

function todayISO(): string {
  return new Date().toISOString().split('T')[0];
}

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export default function MorningRitualScreen() {
  const router = useRouter();
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

  // ─── Date du jour ──────────────────────────────────────────
  const todayLabel = useMemo(() => {
    const now = new Date();
    const dayName = DAY_LABELS[now.getDay() === 0 ? 6 : now.getDay() - 1];
    const dateNum = now.getDate();
    const monthNames = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
    return `${dayName} ${dateNum} ${monthNames[now.getMonth()]}`;
  }, []);

  // ─── Blocs du jour (étape 2) ───────────────────────────────
  const todayBlocks = useMemo(() => {
    return getTodayBlocks()
      .sort((a, b) => a.startTime.localeCompare(b.startTime))
      .map((b) => {
        const lb = getBlockById(b.lifeBlockId);
        return { ...b, lifeBlock: lb };
      });
  }, [getTodayBlocks, getBlockById]);

  // ─── 3 priorités (étape 3) ───────────────────────────────────
  const topTasks = useMemo(() => {
    const incomplete = getIncompleteTodayTasks();
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return incomplete
      .sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority])
      .slice(0, 3);
  }, [tasks, getIncompleteTodayTasks]);

  // ─── Validation des étapes ─────────────────────────────────
  const canProceed = useMemo(() => {
    if (step === 1 && morningConfig.steps.mood) return selectedMood !== null;
    if (step === 3 && morningConfig.steps.priorities) return true;
    return true;
  }, [step, selectedMood, morningConfig]);

  // ─── Finalisation ──────────────────────────────────────────
  const handleFinish = () => {
    logMorningRitual({
      mood: selectedMood || undefined,
      intention: intention.trim() || undefined,
    });
    setMorningRitualDone(todayISO());
    router.replace('/');
  };

  const nextStep = () => {
    if (step < 5) {
      setStep(step + 1);
    } else {
      handleFinish();
    }
  };

  // ─── Render Step 1 : Bonjour ───────────────────────────────
  const renderStep1 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Bonjour.</Text>
      <Text style={styles.stepSubtitle}>{capitalize(todayLabel)}</Text>

      {morningConfig.steps.mood && (
        <View style={{ marginTop: 40, alignItems: 'center', width: '100%' }}>
          <Text style={{ fontSize: 15, color: '#EBEBF599', marginBottom: 20 }}>
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
                  borderColor: selectedMood === m.value ? m.color : '#38383A',
                  backgroundColor: pressed ? '#2C2C2E' : '#1C1C1E',
                  minWidth: 90,
                })}
                onPress={() => setSelectedMood(m.value)}
              >
                <Text style={{ fontSize: 28, marginBottom: 8 }}>{m.emoji}</Text>
                <Text
                  style={{
                    fontSize: 15,
                    color: selectedMood === m.value ? m.color : '#EBEBF599',
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

  // ─── Render Step 2 : Ta journée ────────────────────────────
  const renderStep2 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Ta journée</Text>
      <Text style={styles.stepSubtitle}>
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
              backgroundColor: '#1C1C1E',
              borderRadius: 13,
              borderLeftWidth: 3,
              borderLeftColor: b.lifeBlock?.color || '#8E8E93',
              padding: 14,
            }}
          >
            <Text style={{ fontSize: 20, marginRight: 12 }}>{b.lifeBlock?.emoji || '⬜'}</Text>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 17, fontWeight: '500', color: '#FFFFFF', letterSpacing: -0.41 }}>
                {b.title || b.lifeBlock?.name || 'Bloc'}
              </Text>
              <Text style={{ fontSize: 13, color: '#EBEBF599', marginTop: 2 }}>
                {b.startTime} – {b.endTime}
              </Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );

  // ─── Render Step 3 : 3 priorités ───────────────────────────
  const renderStep3 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Tes priorités</Text>
      <Text style={styles.stepSubtitle}>
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
              backgroundColor: '#1C1C1E',
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
                  index === 0 ? '#FF453A' : index === 1 ? '#FFD60A' : '#30D158',
              }}
            />
            <Text style={{ fontSize: 17, color: '#FFFFFF', flex: 1, letterSpacing: -0.41 }} numberOfLines={2}>
              {task.title}
            </Text>
          </View>
        ))}
        {topTasks.length === 0 && (
          <Text style={{ fontSize: 13, color: '#EBEBF54D', textAlign: 'center', marginTop: 12 }}>
            Ajoute des tâches dans l'onglet Aujourd'hui pour voir tes priorités ici.
          </Text>
        )}
      </View>
    </View>
  );

  // ─── Render Step 4 : Intention ─────────────────────────────
  const renderStep4 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Intention</Text>
      <Text style={styles.stepSubtitle}>Un mot pour cette journée ?</Text>

      <TextInput
        style={{
          marginTop: 40,
          backgroundColor: '#1C1C1E',
          borderRadius: 13,
          paddingHorizontal: 20,
          paddingVertical: 16,
          fontSize: 20,
          fontWeight: '500',
          color: '#FFFFFF',
          textAlign: 'center',
          width: '100%',
          letterSpacing: -0.4,
        }}
        placeholder="Focus, Récupération, Sprint..."
        placeholderTextColor="#3C3C4399"
        value={intention}
        onChangeText={setIntention}
        maxLength={20}
        autoFocus
      />

      <Pressable onPress={nextStep} style={{ marginTop: 16, padding: 12 }}>
        <Text style={{ fontSize: 15, color: '#EBEBF599' }}>Passer →</Text>
      </Pressable>
    </View>
  );

  // ─── Render Step 5 : Lancé ─────────────────────────────────
  const renderStep5 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>C'est parti.</Text>
      <Text style={styles.stepSubtitle}>
        {intention.trim()
          ? `Intention : ${intention.trim()}`
          : "Objectif : journée à 80+"}
      </Text>

      <View style={{ marginTop: 32, width: '100%', gap: 12 }}>
        {selectedMood && (
          <View style={styles.recapRow}>
            <Text style={styles.recapLabel}>Humeur</Text>
            <Text style={styles.recapValue}>
              {MOODS.find((m) => m.value === selectedMood)?.emoji}{' '}
              {MOODS.find((m) => m.value === selectedMood)?.label}
            </Text>
          </View>
        )}

        {todayBlocks.length > 0 && (
          <View style={styles.recapRow}>
            <Text style={styles.recapLabel}>Blocs</Text>
            <Text style={styles.recapValue}>{todayBlocks.length} aujourd'hui</Text>
          </View>
        )}

        {topTasks.length > 0 && (
          <View style={styles.recapRow}>
            <Text style={styles.recapLabel}>Priorités</Text>
            <Text style={styles.recapValue}>{topTasks.length} tâches</Text>
          </View>
        )}
      </View>
    </View>
  );

  // ─── Step indicator ──────────────────────────────────────
  const renderStepIndicator = () => (
    <View style={{ flexDirection: 'row', gap: 6 }}>
      {[1, 2, 3, 4, 5].map((s) => (
        <View
          key={s}
          style={{
            width: s === step ? 24 : 8,
            height: 8,
            borderRadius: 4,
            backgroundColor: s <= step ? '#0A84FF' : '#38383A',
          }}
        />
      ))}
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={{ fontSize: 17, fontWeight: '700', color: '#FFFFFF' }}>Flowday</Text>
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
        {step === 5 && renderStep5()}
      </ScrollView>

      {/* Footer buttons */}
      <View style={styles.footer}>
        {step > 1 && (
          <Pressable
            style={{ padding: 12 }}
            onPress={() => setStep(step - 1)}
          >
            <Text style={{ fontSize: 17, color: '#EBEBF599' }}>← Retour</Text>
          </Pressable>
        )}

        <Pressable
          style={({ pressed }) => ({
            backgroundColor: pressed ? '#0A84FFCC' : '#0A84FF',
            borderRadius: 13,
            paddingHorizontal: 24,
            paddingVertical: 14,
            opacity: canProceed ? 1 : 0.4,
          })}
          onPress={nextStep}
          disabled={!canProceed}
        >
          <Text style={{ fontSize: 17, fontWeight: '600', color: '#FFFFFF' }}>
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
    backgroundColor: '#000000',
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
    color: '#FFFFFF',
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  stepSubtitle: {
    fontSize: 17,
    color: '#EBEBF599',
    textAlign: 'center',
    marginTop: 8,
  },
  recapRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: '#1C1C1E',
    borderRadius: 13,
  },
  recapLabel: {
    fontSize: 15,
    color: '#EBEBF599',
  },
  recapValue: {
    fontSize: 15,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderTopWidth: 0.5,
    borderTopColor: '#38383A',
  },
});
