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
import { useFocusStore } from '../src/features/focus/store';
import { useNotifications } from '../src/features/notifications/useNotifications';
import { useTheme } from '../src/theme';
import { dateKey } from '../src/utils/dates';
import {
  MINUTES_PER_DAY,
  MORNING_AUTO_OPEN_WINDOW_MINUTES,
  autoOpenDelay,
  isPastTime,
} from '../src/utils/ritualNavigation';

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

  const initializeTemplates = useTemplateStore((state) => state.initializeDefaults);

  const themePreference = useThemeStore((state) => state.themeName);
  const { colors, isDark } = useTheme();
  const resetDailyCountIfNeeded = useFocusStore((state) => state.resetDailyCountIfNeeded);

  useNotifications();

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
  }, [hasDoneEvening, pathname, router, eveningConfig.enabled, eveningConfig.time]);

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
          <Stack.Screen name="morning-ritual" options={{ animation: 'slide_from_bottom' }} />
          <Stack.Screen name="evening-wrap" options={{ animation: 'slide_from_bottom' }} />
          <Stack.Screen name="focus" options={{ animation: 'slide_from_bottom' }} />
        </Stack>
      </BottomSheetModalProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
