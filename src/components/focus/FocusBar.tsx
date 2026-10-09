import { useEffect } from 'react';
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '../../theme';
import { useTranslation } from '../../i18n';
import { BREAK_SECONDS, POMODORO_SECONDS, useFocusStore } from '../../features/focus/store';
import { IconButton } from '../ui/Glass';
import { IconTile, List, Row } from '../ui/List';
import { SymbolNames } from '../ui/Symbol';

function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const rest = seconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${rest.toString().padStart(2, '0')}`;
}

interface FocusBarProps {
  style?: StyleProp<ViewStyle>;
}

export function FocusBar({ style }: FocusBarProps) {
  const router = useRouter();
  const { colors, typography } = useTheme();
  const { t } = useTranslation();

  const focusState = useFocusStore((state) => state.focusState);
  const syncTimer = useFocusStore((state) => state.syncTimer);
  const pauseFocus = useFocusStore((state) => state.pauseFocus);
  const resumeFocus = useFocusStore((state) => state.resumeFocus);

  const hasSession = !!focusState.currentTaskId;
  const isActive = focusState.isActive;

  useEffect(() => {
    if (!hasSession || !isActive) return;
    const timer = setInterval(() => syncTimer(), 1000);
    return () => clearInterval(timer);
  }, [hasSession, isActive, syncTimer]);

  if (!hasSession) return null;

  const total = focusState.isBreak ? BREAK_SECONDS : POMODORO_SECONDS;
  const label = focusState.isBreak
    ? `${t('Pause')} · ${total / 60} min`
    : `${t('Focus')} · ${POMODORO_SECONDS / 60} min`;

  return (
    <List style={style}>
      <Row
        leading={
          <IconTile
            color={focusState.isBreak ? colors.system.green : colors.system.orange}
            symbol={SymbolNames.timer}
            size={44}
            animationSpec={isActive ? { effect: { type: 'pulse', wholeSymbol: true }, repeating: true } : undefined}
          />
        }
        title={focusState.currentTaskTitle ?? t('Focus')}
        subtitle={isActive ? label : `${label} · ${t('En pause')}`}
        trailing={
          <View style={styles.trailing}>
            <Text style={[typography.body, styles.timer, { color: colors.text.primary }]}>
              {formatTime(focusState.timeRemaining)}
            </Text>
            <IconButton
              symbol={isActive ? SymbolNames.pause : SymbolNames.play}
              onPress={() => (isActive ? pauseFocus() : resumeFocus())}
              accessibilityLabel={isActive ? t('Pause') : t('Reprendre')}
              size={36}
            />
          </View>
        }
        onPress={() => router.push('/focus')}
        accessibilityLabel={`${t('Session Focus en cours')} ${formatTime(focusState.timeRemaining)}`}
      />
    </List>
  );
}

const styles = StyleSheet.create({
  trailing: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  timer: {
    fontVariant: ['tabular-nums'],
    fontWeight: '600',
  },
});
