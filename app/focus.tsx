import { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  AppState,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BREAK_SECONDS, POMODORO_SECONDS, useFocusStore } from '../src/features/focus/store';
import { useDayScoreStore } from '../src/features/dayScore/store';
import { useTheme } from '../src/theme';
import { hapticWarning } from '../src/utils/haptics';
import { PageInfo } from '../src/components/ui/PageInfo';
import { Button, IconButton } from '../src/components/ui/Glass';
import { ProgressRing } from '../src/components/ui/ProgressRing';
import { SymbolNames } from '../src/components/ui/Symbol';
import { EmptyState } from '../src/components/shared/EmptyState';
import { useTranslation } from '../src/i18n';

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

export default function FocusScreen() {
  const router = useRouter();
  const { colors, typography } = useTheme();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  const focusState = useFocusStore((state) => state.focusState);
  const tick = useFocusStore((state) => state.tick);
  const syncTimer = useFocusStore((state) => state.syncTimer);
  const pauseFocus = useFocusStore((state) => state.pauseFocus);
  const resumeFocus = useFocusStore((state) => state.resumeFocus);
  const stopFocus = useFocusStore((state) => state.stopFocus);
  const abandonPomodoro = useFocusStore((state) => state.abandonPomodoro);
  const pomodoroGoal = useDayScoreStore((state) => state.pomodoroGoal);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (focusState.isActive) {
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

  useEffect(() => {
    syncTimer();
    const subscription = AppState.addEventListener('change', (nextState) => {
      if (nextState === 'active') syncTimer();
    });
    return () => subscription.remove();
  }, [syncTimer]);

  const handleAbandon = () => {
    hapticWarning();
    abandonPomodoro();
    stopFocus();
    router.back();
  };

  const containerStyle = [
    styles.container,
    { backgroundColor: colors.bg.primary, paddingTop: insets.top, paddingBottom: Math.max(insets.bottom, 16) },
  ];

  if (!focusState.currentTaskId) {
    return (
      <View style={containerStyle}>
        <EmptyState
          icon={SymbolNames.timer}
          title={t('Aucune tâche en cours')}
          subtitle={t('Le minuteur démarre sur une tâche, depuis Aujourd’hui ou Planning.')}
          action={<Button title={t('Retour')} variant="secondary" onPress={() => router.back()} />}
        />
      </View>
    );
  }

  const maxDots = 8;
  const dots = Array.from({ length: maxDots }, (_, i) => i < focusState.sessionPomodoroCount);
  const total = focusState.isBreak ? BREAK_SECONDS : POMODORO_SECONDS;
  const ringColor = focusState.isBreak ? colors.system.green : colors.accent;
  const remainingPercent = (focusState.timeRemaining / total) * 100;

  return (
    <View style={containerStyle}>
      <StatusBar hidden />

      <View style={styles.header}>
        <PageInfo
          title={t('Focus')}
          description={t('Travaille sur une seule tâche pendant une session de 25 minutes, puis prends une pause.')}
          points={[
            t('Le minuteur démarre sur une tâche, depuis Aujourd’hui ou Planning.'),
            t('Mets la session en pause ou reprends-la à tout moment.'),
            t('Abandonner arrête la session sans la comptabiliser comme terminée.'),
          ]}
        />
      </View>

      <View style={styles.content}>
        <Text style={typography.eyebrow}>
          {focusState.isBreak
            ? `${t('Pause')} · ${BREAK_SECONDS / 60} min`
            : `${t('Focus')} · ${POMODORO_SECONDS / 60} min`}
        </Text>
        <Text style={[typography.title2, styles.taskTitle]} numberOfLines={2}>
          {focusState.currentTaskTitle}
        </Text>

        <ProgressRing value={remainingPercent} size={272} strokeWidth={12} color={ringColor}>
          <Text
            style={[styles.timer, { color: colors.text.primary }]}
            accessibilityRole="timer"
          >
            {formatTime(focusState.timeRemaining)}
          </Text>
        </ProgressRing>

        <View style={styles.dotsRow}>
          {dots.map((filled, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                { backgroundColor: filled ? colors.accent : colors.bg.tertiary },
              ]}
            />
          ))}
        </View>

        <Text style={typography.footnote}>
          {t('pomodoroProgress', { done: focusState.dailyPomodoroCount, goal: pomodoroGoal })}
        </Text>
      </View>

      <View style={styles.footer}>
        <IconButton
          symbol={focusState.isActive ? SymbolNames.pause : SymbolNames.play}
          onPress={() => (focusState.isActive ? pauseFocus() : resumeFocus())}
          accessibilityLabel={focusState.isActive ? t('Pause') : t('Reprendre')}
          size={76}
          prominent={!focusState.isActive}
        />
        <Button title={t('Abandonner')} variant="destructive" onPress={handleAbandon} style={styles.abandon} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 4,
    alignItems: 'flex-end',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  taskTitle: {
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 36,
  },
  timer: {
    fontSize: 64,
    fontWeight: '300',
    letterSpacing: -1,
    fontVariant: ['tabular-nums'],
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 32,
    marginBottom: 12,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  footer: {
    alignItems: 'center',
    gap: 12,
    paddingTop: 8,
  },
  abandon: {
    alignSelf: 'center',
  },
});
