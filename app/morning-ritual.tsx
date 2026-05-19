import { useState, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
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
import { Colors, Spacing, Radius, Typography } from '../src/theme';
import { Mood } from '../src/types/ritual';

const MOODS: { value: Mood; label: string; emoji: string; color: string }[] = [
  { value: 'bad', label: 'Pas top', emoji: '🔴', color: Colors.accentRed },
  { value: 'meh', label: 'Bof', emoji: '🟡', color: Colors.accentYellow },
  { value: 'good', label: 'En forme', emoji: '🟢', color: Colors.accentGreen },
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
    if (step === 3 && morningConfig.steps.priorities) return true; // Les priorités sont proposées, pas obligatoire de changer
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

  // ─── Skip étape ────────────────────────────────────────────
  const skipStep = () => {
    if (step < 5) {
      setStep(step + 1);
    } else {
      handleFinish();
    }
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
        <View style={styles.moodSection}>
          <Text style={styles.moodQuestion}>Comment tu te sens ?</Text>
          <View style={styles.moodRow}>
            {MOODS.map((m) => (
              <TouchableOpacity
                key={m.value}
                style={[
                  styles.moodBtn,
                  selectedMood === m.value && {
                    backgroundColor: m.color + '25',
                    borderColor: m.color,
                  },
                ]}
                onPress={() => setSelectedMood(m.value)}
              >
                <Text style={styles.moodEmoji}>{m.emoji}</Text>
                <Text
                  style={[
                    styles.moodLabel,
                    selectedMood === m.value && { color: m.color, fontWeight: Typography.weights.bold },
                  ]}
                >
                  {m.label}
                </Text>
              </TouchableOpacity>
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

      <View style={styles.blocksList}>
        {todayBlocks.map((b) => (
          <View
            key={b.id}
            style={[
              styles.blockItem,
              { borderLeftColor: b.lifeBlock?.color || Colors.textTertiary },
            ]}
          >
            <Text style={styles.blockEmoji}>{b.lifeBlock?.emoji || '⬜'}</Text>
            <View style={styles.blockInfo}>
              <Text style={styles.blockName}>
                {b.title || b.lifeBlock?.name || 'Bloc'}
              </Text>
              <Text style={styles.blockTime}>
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
      <Text style={styles.stepTitle}>Tes 3 priorités</Text>
      <Text style={styles.stepSubtitle}>
        {topTasks.length === 0
          ? "Pas de tâches en cours"
          : "Voici ce qui attend aujourd'hui"}
      </Text>

      <View style={styles.tasksList}>
        {topTasks.map((task, index) => (
          <View key={task.id} style={styles.priorityItem}>
            <View
              style={[
                styles.priorityDot,
                {
                  backgroundColor:
                    index === 0
                      ? Colors.accentRed
                      : index === 1
                      ? Colors.accentYellow
                      : Colors.accentGreen,
                },
              ]}
            />
            <Text style={styles.priorityTitle} numberOfLines={2}>
              {task.title}
            </Text>
          </View>
        ))}
        {topTasks.length === 0 && (
          <Text style={styles.emptyTasks}>
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
        style={styles.intentionInput}
        placeholder="Focus, Récupération, Sprint..."
        placeholderTextColor={Colors.textTertiary}
        value={intention}
        onChangeText={setIntention}
        maxLength={20}
        autoFocus
      />

      <TouchableOpacity style={styles.skipBtn} onPress={skipStep}>
        <Text style={styles.skipText}>Passer →</Text>
      </TouchableOpacity>
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
  );

  // ─── Step indicator ──────────────────────────────────────
  const renderStepIndicator = () => (
    <View style={styles.stepIndicator}>
      {[1, 2, 3, 4, 5].map((s) => (
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
        {step === 5 && renderStep5()}
      </ScrollView>

      {/* Footer buttons */}
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
            !canProceed && styles.nextBtnDisabled,
          ]}
          onPress={nextStep}
          disabled={!canProceed}
        >
          <Text style={styles.nextBtnText}>
            {step === 5 ? 'Commencer la journée →' : 'Suivant →'}
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
  moodSection: {
    marginTop: Spacing.xxl,
    alignItems: 'center',
  },
  moodQuestion: {
    fontSize: Typography.sizes.base,
    color: Colors.textSecondary,
    marginBottom: Spacing.lg,
  },
  moodRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  moodBtn: {
    alignItems: 'center',
    padding: Spacing.lg,
    borderRadius: Radius.lg,
    borderWidth: 2,
    borderColor: Colors.border,
    backgroundColor: Colors.bgSurface,
    minWidth: 90,
  },
  moodEmoji: {
    fontSize: 28,
    marginBottom: Spacing.sm,
  },
  moodLabel: {
    fontSize: Typography.sizes.base,
    color: Colors.textSecondary,
    fontWeight: Typography.weights.medium,
  },
  blocksList: {
    marginTop: Spacing.xl,
    width: '100%',
    gap: Spacing.sm,
  },
  blockItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.bgSurface,
    borderRadius: Radius.md,
    borderLeftWidth: 3,
    padding: Spacing.md,
  },
  blockEmoji: {
    fontSize: 20,
    marginRight: Spacing.md,
  },
  blockInfo: {
    flex: 1,
  },
  blockName: {
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.semibold,
    color: Colors.textPrimary,
  },
  blockTime: {
    fontSize: Typography.sizes.sm,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  tasksList: {
    marginTop: Spacing.xl,
    width: '100%',
    gap: Spacing.md,
  },
  priorityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.bgSurface,
    borderRadius: Radius.md,
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  priorityDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  priorityTitle: {
    fontSize: Typography.sizes.base,
    color: Colors.textPrimary,
    flex: 1,
  },
  emptyTasks: {
    fontSize: Typography.sizes.sm,
    color: Colors.textTertiary,
    textAlign: 'center',
    marginTop: Spacing.md,
  },
  intentionInput: {
    marginTop: Spacing.xxl,
    backgroundColor: Colors.bgInput,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    fontSize: Typography.sizes.xl,
    color: Colors.textPrimary,
    textAlign: 'center',
    width: '100%',
  },
  skipBtn: {
    marginTop: Spacing.lg,
    padding: Spacing.md,
  },
  skipText: {
    fontSize: Typography.sizes.base,
    color: Colors.textSecondary,
  },
  recapRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    marginTop: Spacing.sm,
  },
  recapLabel: {
    fontSize: Typography.sizes.base,
    color: Colors.textSecondary,
  },
  recapValue: {
    fontSize: Typography.sizes.base,
    color: Colors.textPrimary,
    fontWeight: Typography.weights.medium,
  },
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
