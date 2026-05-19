import { useEffect, useRef } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  StatusBar,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusStore } from '../src/features/focus/store';
import { useDayScoreStore } from '../src/features/dayScore/store';

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
      completePomodoro();
      incrementPomodoro(todayISO());
    }
  }, [focusState.timeRemaining, focusState.isActive, focusState.isBreak, completePomodoro, incrementPomodoro]);

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
          <Pressable style={styles.backBtn} onPress={() => router.back()}>
            <Text style={styles.backBtnText}>← Retour</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar hidden />

      {/* Header minimal */}
      <View style={styles.header}>
        <Pressable
          onPress={handleStop}
          style={({ pressed }) => ({
            width: 36,
            height: 36,
            borderRadius: 10,
            backgroundColor: pressed ? '#3A3A3C' : '#1C1C1E',
            alignItems: 'center',
            justifyContent: 'center',
          })}
        >
          <Ionicons name="close" size={20} color="#FFFFFF" />
        </Pressable>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {/* Tâche en cours */}
        <Text style={styles.taskTitle} numberOfLines={2}>
          {focusState.currentTaskTitle}
        </Text>

        {/* Timer */}
        <Text style={styles.timer}>{formatTime(focusState.timeRemaining)}</Text>

        {/* Mode actuel */}
        <Text style={styles.modeLabel}>
          {focusState.isBreak ? 'Pause · 5 min' : 'Focus · 25 min'}
        </Text>

        {/* Points de session */}
        <View style={styles.dotsRow}>
          {dots.map((filled, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                filled && { backgroundColor: '#0A84FF' },
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
        <Pressable
          style={({ pressed }) => ({
            backgroundColor: pressed ? '#3A3A3C' : '#1C1C1E',
            borderRadius: 13,
            paddingVertical: 14,
            paddingHorizontal: 32,
            alignItems: 'center',
            borderWidth: 1,
            borderColor: '#38383A',
          })}
          onPress={focusState.isActive ? pauseFocus : resumeFocus}
        >
          <Text style={{ fontSize: 17, fontWeight: '600', color: '#FFFFFF' }}>
            {focusState.isActive ? 'Pause' : 'Reprendre'}
          </Text>
        </Pressable>

        <Pressable onPress={handleAbandon} style={{ padding: 12 }}>
          <Text style={{ fontSize: 15, color: '#FF453A' }}>Abandonner</Text>
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
    paddingHorizontal: 16,
    paddingTop: 12,
    alignItems: 'flex-start',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  taskTitle: {
    fontSize: 20,
    fontWeight: '500',
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 28,
    marginBottom: 32,
    letterSpacing: -0.4,
  },
  timer: {
    fontSize: 56,
    fontWeight: '300',
    color: '#FFFFFF',
    letterSpacing: -2,
    fontVariant: ['tabular-nums'],
  },
  modeLabel: {
    fontSize: 13,
    color: '#EBEBF599',
    marginTop: 12,
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 24,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#38383A',
  },
  dailyGoal: {
    fontSize: 13,
    color: '#EBEBF599',
    marginTop: 16,
  },
  footer: {
    alignItems: 'center',
    gap: 8,
    paddingVertical: 32,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  noTask: {
    fontSize: 17,
    color: '#EBEBF599',
  },
  backBtn: {
    padding: 12,
  },
  backBtnText: {
    fontSize: 17,
    color: '#0A84FF',
  },
});
