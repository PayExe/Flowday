import { useEffect, useRef, useState } from 'react';
import { Stack, useRouter, usePathname } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Appearance, StyleSheet } from 'react-native';
import { useRitualStore } from '../src/features/rituals/store';
import { useLifeBlocksStore } from '../src/features/lifeBlocks/store';
import { useTemplateStore } from '../src/features/templates/store';
import { useThemeStore } from '../src/features/theme/store';
import { useLanguageStore } from '../src/features/language/store';
import { useFocusStore } from '../src/features/focus/store';
import { useTaskStore } from '../src/features/tasks/store';
import { useOnboardingStore } from '../src/features/onboarding/store';
import { isReturningUser } from '../src/features/onboarding/returningUser';
import { useStoresHydrated } from '../src/utils/useStoresHydrated';
import { useNotifications } from '../src/features/notifications/useNotifications';
import { useDayScoreSync } from '../src/features/dayScore/useDayScoreSync';
import { useTheme } from '../src/theme';
import { ToastHost } from '../src/components/ui/Toast';
import { dateKey } from '../src/utils/dates';
import {
  MINUTES_PER_DAY,
  MORNING_AUTO_OPEN_WINDOW_MINUTES,
  autoOpenDelay,
  isPastTime,
} from '../src/utils/ritualNavigation';

const ONBOARDING_STORES = [useOnboardingStore, useTaskStore, useRitualStore, useLifeBlocksStore];

function todayISO(): string {
  return dateKey();
}

export default function RootLayout() {
  const router = useRouter();
  const pathname = usePathname();
  const [currentDate, setCurrentDate] = useState(todayISO());

  const logs = useRitualStore((state) => state.logs);
  const skippedForToday = useRitualStore((state) => state.skippedForToday);
  const skippedDate = useRitualStore((state) => state.skippedDate);
  const morningConfig = useRitualStore((state) => state.morningConfig);
  const eveningConfig = useRitualStore((state) => state.eveningConfig);

  const blocks = useLifeBlocksStore((state) => state.blocks);
  const initializeBlocks = useLifeBlocksStore((state) => state.initializeDefaults);
  const localizeBlocks = useLifeBlocksStore((state) => state.localizeDefaults);
  const language = useLanguageStore((state) => state.language);

  const initializeTemplates = useTemplateStore((state) => state.initializeDefaults);

  const themePreference = useThemeStore((state) => state.themeName);
  const { colors, isDark } = useTheme();
  const resetDailyCountIfNeeded = useFocusStore((state) => state.resetDailyCountIfNeeded);

  const hydrated = useStoresHydrated(ONBOARDING_STORES);
  const onboardingCompleted = useOnboardingStore((state) => state.completed);
  const completeOnboarding = useOnboardingStore((state) => state.complete);
  const onboarded = hydrated && onboardingCompleted;

  useNotifications();
  useDayScoreSync(currentDate);

  useEffect(() => {
    Appearance.setColorScheme?.(themePreference === 'system' ? 'unspecified' : themePreference);
  }, [themePreference]);

  useEffect(() => {
    const now = new Date();
    const nextDay = new Date(now);
    nextDay.setHours(24, 0, 0, 0);
    const timer = setTimeout(() => setCurrentDate(todayISO()), nextDay.getTime() - now.getTime() + 10);
    return () => clearTimeout(timer);
  }, [currentDate]);

  useEffect(() => {
    resetDailyCountIfNeeded();
  }, [currentDate, resetDailyCountIfNeeded]);

  const hasDoneMorning = logs.some(
    (log) => log.date === todayISO() && log.type === 'morning'
  );
  const hasSkippedMorning = skippedForToday && skippedDate === todayISO();

  const didInitBlocks = useRef(false);
  useEffect(() => {
    if (didInitBlocks.current) return;
    didInitBlocks.current = true;
    initializeBlocks();
  }, [initializeBlocks]);

  useEffect(() => {
    localizeBlocks(language);
  }, [blocks, language, localizeBlocks]);

  useEffect(() => {
    if (!hydrated || onboardingCompleted) return;
    const returning = isReturningUser({
      tasks: useTaskStore.getState().tasks,
      ritualLogs: useRitualStore.getState().logs,
      lifeBlocks: useLifeBlocksStore.getState().blocks,
    });
    if (returning) {
      completeOnboarding();
      return;
    }
    if (pathname !== '/onboarding') router.replace('/onboarding');
  }, [hydrated, onboardingCompleted, completeOnboarding, pathname, router]);

  const didInitTemplates = useRef(false);
  useEffect(() => {
    if (didInitTemplates.current) return;
    if (blocks.length === 0) return;
    didInitTemplates.current = true;
    const activeBlockIds = blocks
      .filter((b) => !b.isArchived)
      .sort((a, b) => a.order - b.order)
      .map((b) => b.id);
    initializeTemplates(activeBlockIds);
  }, [blocks, initializeTemplates]);

  const hasDoneEvening = logs.some(
    (log) => log.date === todayISO() && log.type === 'evening'
  );

  const eveningDue =
    eveningConfig.enabled && !hasDoneEvening && isPastTime(eveningConfig.time);

  useEffect(() => {
    if (!onboarded) return;
    if (!morningConfig.enabled) return;
    if (hasDoneMorning) return;
    if (hasSkippedMorning) return;
    if (eveningDue) return;
    if (pathname === '/morning-ritual') return;

    const delay = autoOpenDelay(morningConfig.time, MORNING_AUTO_OPEN_WINDOW_MINUTES);
    if (delay === null) return;

    const timer = setTimeout(() => {
      router.replace('/morning-ritual');
    }, delay);
    return () => clearTimeout(timer);
  }, [
    onboarded,
    hasDoneMorning,
    hasSkippedMorning,
    eveningDue,
    pathname,
    router,
    morningConfig.enabled,
    morningConfig.time,
  ]);

  const eveningRedirected = useRef(false);

  useEffect(() => {
    if (!onboarded) return;
    if (eveningRedirected.current) return;
    if (!eveningConfig.enabled) return;
    if (hasDoneEvening) return;
    if (pathname === '/evening-wrap') return;

    const delay = autoOpenDelay(eveningConfig.time, MINUTES_PER_DAY);
    if (delay === null) return;

    const timer = setTimeout(() => {
      eveningRedirected.current = true;
      router.replace('/evening-wrap');
    }, delay);
    return () => clearTimeout(timer);
  }, [onboarded, hasDoneEvening, pathname, router, eveningConfig.enabled, eveningConfig.time]);

  return (
    <GestureHandlerRootView style={styles.container}>
      <BottomSheetModalProvider>
        <StatusBar style={isDark ? 'light' : 'dark'} />
        <Stack
          screenOptions={{
            headerShown: false,
            animation: 'slide_from_right',
            contentStyle: { backgroundColor: colors.bg.primary },
          }}
        >
          <Stack.Screen name="onboarding" options={{ animation: 'fade', gestureEnabled: false }} />
          <Stack.Screen name="morning-ritual" options={{ animation: 'slide_from_bottom' }} />
          <Stack.Screen name="evening-wrap" options={{ animation: 'slide_from_bottom' }} />
          <Stack.Screen name="focus" options={{ animation: 'slide_from_bottom' }} />
        </Stack>
        <ToastHost />
      </BottomSheetModalProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
