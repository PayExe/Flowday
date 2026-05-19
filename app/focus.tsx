import { useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusStore } from '../src/features/focus/store';
import { useDayScoreStore } from '../src/features/dayScore/store';
import { Colors, Spacing, Radius, Typography } from '../src/theme';

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

function todayISO(): string {
  return new Date().toISOString().split('T')[0];
}

export default function FocusScreen() {
  const router = useRouter();

  const focusState = useFocusStore((state) => state.focusState);
  const tick = useFocusStore((state) => state.tick);
  const pauseFocus = useFocusStore((state) => state.pauseFocus);
  const resumeFocus = useFocusStore((state) => state.resumeFocus);
  const stopFocus = useFocusStore((state) => state.stopFocus);
  const completePomodoro = useFocusStore((state) => state.completePomodoro);
  const abandonPomodoro = useFocusStore((state) => state.abandonPomodoro);

  const incrementPomodoro = useDayScoreStore((state) => state.incrementPomodoro);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // ─── Timer tick toutes les secondes ────────────────────────
  useEffect(() => {
    if (focusState.isActive && !focusState.isBreak) {
      intervalRef.current = setInterval(() => {
        tick();
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [focusState.isActive, focusState.isBreak, tick]);

  // ─── Détection fin de pomodoro ────────────────────────────
  useEffect(() => {
    if (focusState.isActive && focusState.timeRemaining === 0 && !focusState.isBreak) {
      // Pomodoro terminé !
      completePomodoro();
      incrementPomodoro(todayISO());
    }
  }, [focusState.timeRemaining, focusState.isActive, focusState.isBreak, completePomodoro, incrementPomodoro]);

  // ─── Détection fin de pause ───────────────────────────────
  useEffect(() => {
    if (focusState.isActive && focusState.timeRemaining === 0 && focusState.isBreak) {
      // Break terminé, retour au travail
      // Le tick() dans le store gère déjà le switch
    }
  }, [focusState.timeRemaining, focusState.isActive, focusState.isBreak]);

  const handleAbandon = () => {
    abandonPomodoro();
    stopFocus();
    router.back();
  };

  const handleStop = () => {
    stopFocus();
    router.back();
  };

  // ─── Points de session ────────────────────────────────────
  const maxDots = 8;
  const dots = Array.from({ length: maxDots }, (_, i) => i < focusState.sessionPomodoroCount);

  // Si pas de focus actif, rediriger
  if (!focusState.currentTaskId) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.center}>
          <Text style={styles.noTask}>Aucune tâche en cours</Text>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Text style={styles.backBtnText}>← Retour</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar hidden />

      {/* Header minimal */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleStop}>
          <Ionicons name="close" size={28} color={Colors.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {/* Label Work/Break */}
        <Text style={styles.modeLabel}>
          {focusState.isBreak ? 'Pause' : 'Focus'}
        </Text>

        {/* Tâche en cours */}
        <Text style={styles.taskTitle} numberOfLines={2}>
          {focusState.currentTaskTitle}
        </Text>

        {/* Timer */}
        <Text style={styles.timer}>{formatTime(focusState.timeRemaining)}</Text>

        {/* Points de session */}
        <View style={styles.dotsRow}>
          {dots.map((filled, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                filled && { backgroundColor: Colors.accentCyan },
              ]}
            />
          ))}
        </View>

        {/* Objectif quotidien */}
        <Text style={styles.dailyGoal}>
          {focusState.dailyPomodoroCount} / {focusState.dailyPomodoroGoal} aujourd'hui
        </Text>
      </View>

      {/* Controls */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.controlBtn}
          onPress={focusState.isActive ? pauseFocus : resumeFocus}
        >
          <Ionicons
            name={focusState.isActive ? 'pause' : 'play'}
            size={24}
            color={Colors.textPrimary}
          />
          <Text style={styles.controlText}>
            {focusState.isActive ? 'Pause' : 'Reprendre'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.controlBtn, styles.abandonBtn]}
          onPress={handleAbandon}
        >
          <Ionicons name="stop-outline" size={24} color={Colors.accentRed} />
          <Text style={[styles.controlText, { color: Colors.accentRed }]}>
            Abandonner
          </Text>
        </TouchableOpacity>
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
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    alignItems: 'flex-start',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
  },
  modeLabel: {
    fontSize: Typography.sizes.sm,
    color: Colors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginBottom: Spacing.xl,
  },
  taskTitle: {
    fontSize: 20,
    color: Colors.textPrimary,
    textAlign: 'center',
    lineHeight: 28,
    marginBottom: Spacing.xxl,
  },
  timer: {
    fontSize: Typography.sizes.timer,
    color: Colors.textPrimary,
    fontWeight: Typography.weights.bold,
    letterSpacing: -1,
    fontVariant: ['tabular-nums'],
  },
  dotsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.xl,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.textTertiary,
  },
  dailyGoal: {
    fontSize: Typography.sizes.sm,
    color: Colors.textSecondary,
    marginTop: Spacing.lg,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.xxl,
    paddingVertical: Spacing.xxl,
  },
  controlBtn: {
    alignItems: 'center',
    gap: Spacing.sm,
    padding: Spacing.md,
  },
  controlText: {
    fontSize: Typography.sizes.sm,
    color: Colors.textPrimary,
    fontWeight: Typography.weights.medium,
  },
  abandonBtn: {
    opacity: 0.8,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.lg,
  },
  noTask: {
    fontSize: Typography.sizes.lg,
    color: Colors.textSecondary,
  },
  backBtn: {
    padding: Spacing.md,
  },
  backBtnText: {
    fontSize: Typography.sizes.base,
    color: Colors.accentCyan,
  },
});
