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
import { useFocusStore } from '../src/features/focus/store';
import { useTheme } from '../src/theme';
import { hapticLight, hapticWarning } from '../src/utils/haptics';
import { Symbol, SymbolNames } from '../src/components/ui/Symbol';

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

export default function FocusScreen() {
  const router = useRouter();
  const { colors, typography } = useTheme();

  const focusState = useFocusStore((state) => state.focusState);
  const tick = useFocusStore((state) => state.tick);
  const pauseFocus = useFocusStore((state) => state.pauseFocus);
  const resumeFocus = useFocusStore((state) => state.resumeFocus);
  const stopFocus = useFocusStore((state) => state.stopFocus);
  const abandonPomodoro = useFocusStore((state) => state.abandonPomodoro);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

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

  const handleAbandon = () => {
    hapticWarning();
    abandonPomodoro();
    stopFocus();
    router.back();
  };

  const handleStop = () => {
    stopFocus();
    router.back();
  };

  const maxDots = 8;
  const dots = Array.from({ length: maxDots }, (_, i) => i < focusState.sessionPomodoroCount);

  if (!focusState.currentTaskId) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.bg.primary }]} edges={['top']}>
        <View style={styles.center}>
          <Text style={[styles.noTask, { color: colors.text.secondary }]}>Aucune tâche en cours</Text>
          <Pressable style={styles.backBtn} onPress={() => router.back()}>
            <Text style={[styles.backBtnText, { color: colors.system.blue }]}>← Retour</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bg.primary }]} edges={['top']}>
      <StatusBar hidden />

      <View style={styles.header}>
        <Pressable
          onPress={handleStop}
          style={({ pressed }) => ({
            width: 44,
            height: 44,
            borderRadius: 12,
            backgroundColor: pressed ? colors.system.gray4 : colors.bg.secondary,
            alignItems: 'center',
            justifyContent: 'center',
          })}
        >
          <Symbol name={SymbolNames.close} size={20} color={colors.text.primary} />
        </Pressable>
      </View>

      <View style={styles.content}>
        <Text style={[styles.taskTitle, { color: colors.text.primary }]} numberOfLines={2}>
          {focusState.currentTaskTitle}
        </Text>

        <Text style={[styles.timer, { color: colors.text.primary }]}>{formatTime(focusState.timeRemaining)}</Text>

        <Text style={[styles.modeLabel, { color: colors.text.secondary }]}>
          {focusState.isBreak ? 'Pause · 5 min' : 'Focus · 25 min'}
        </Text>

        <View style={styles.dotsRow}>
          {dots.map((filled, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                { backgroundColor: filled ? colors.system.blue : colors.separator.default },
              ]}
            />
          ))}
        </View>

        <Text style={[styles.dailyGoal, { color: colors.text.secondary }]}>
          {focusState.dailyPomodoroCount} / {focusState.dailyPomodoroGoal} aujourd'hui
        </Text>
      </View>

      <View style={styles.footer}>
        <Pressable
          style={({ pressed }) => ({
            backgroundColor: pressed ? colors.system.gray4 : colors.bg.secondary,
            borderRadius: 13,
            paddingVertical: 14,
            paddingHorizontal: 32,
            alignItems: 'center',
            borderWidth: 1,
            borderColor: colors.separator.default,
          })}
          onPress={() => { hapticLight(); focusState.isActive ? pauseFocus() : resumeFocus(); }}
        >
          <Text style={{ fontSize: typography.sizes.lg, fontWeight: '600', color: colors.text.primary }}>
            {focusState.isActive ? 'Pause' : 'Reprendre'}
          </Text>
        </Pressable>

        <Pressable onPress={handleAbandon} style={{ padding: 12 }}>
          <Text style={{ fontSize: typography.sizes.base, color: colors.system.red }}>Abandonner</Text>
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
    textAlign: 'center',
    lineHeight: 28,
    marginBottom: 32,
    letterSpacing: -0.4,
  },
  timer: {
    fontSize: 56,
    fontWeight: '300',
    letterSpacing: -2,
    fontVariant: ['tabular-nums'],
  },
  modeLabel: {
    fontSize: 13,
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
  },
  dailyGoal: {
    fontSize: 13,
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
  },
  backBtn: {
    padding: 12,
  },
  backBtnText: {
    fontSize: 17,
  },
});
