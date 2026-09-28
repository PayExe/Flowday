import { useEffect, useRef } from 'react';
import { Stack, useRouter, usePathname } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet } from 'react-native';
import { useRitualStore } from '../src/features/rituals/store';
import { useLifeBlocksStore } from '../src/features/lifeBlocks/store';
import { useTemplateStore } from '../src/features/templates/store';
import { useThemeStore } from '../src/features/theme/store';
import { dateKey } from '../src/utils/dates';

function todayISO(): string {
  return dateKey();
}

export default function RootLayout() {
  const router = useRouter();
  const pathname = usePathname();

  const logs = useRitualStore((state) => state.logs);
  const morningConfig = useRitualStore((state) => state.morningConfig);
  const eveningConfig = useRitualStore((state) => state.eveningConfig);

  const blocks = useLifeBlocksStore((state) => state.blocks);
  const initializeBlocks = useLifeBlocksStore((state) => state.initializeDefaults);

  const initializeTemplates = useTemplateStore((state) => state.initializeDefaults);

  const themeName = useThemeStore((state) => state.themeName);

  const hasDoneMorning = logs.some(
    (log) => log.date === todayISO() && log.type === 'morning'
  );

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

  useEffect(() => {
    if (!morningConfig.enabled) return;
    if (hasDoneMorning) return;
    if (pathname === '/morning-ritual') return;

    const now = new Date();
    const [hours, minutes] = morningConfig.time.split(':').map(Number);
    const triggerMinutes = hours * 60 + minutes;
    const nowMinutes = now.getHours() * 60 + now.getMinutes();
    const delay = nowMinutes < triggerMinutes
      ? (triggerMinutes - nowMinutes) * 60 * 1000
      : 100;

    const timer = setTimeout(() => {
      router.replace('/morning-ritual');
    }, delay);
    return () => clearTimeout(timer);
  }, [hasDoneMorning, pathname, router, morningConfig.enabled, morningConfig.time]);

  const eveningRedirected = useRef(false);
  const hasDoneEvening = logs.some(
    (log) => log.date === todayISO() && log.type === 'evening'
  );

  useEffect(() => {
    if (eveningRedirected.current) return;
    if (!eveningConfig.enabled) return;
    if (hasDoneEvening) return;
    if (pathname === '/evening-wrap') return;

    const now = new Date();
    const [h, m] = eveningConfig.time.split(':').map(Number);
    const triggerMinutes = h * 60 + m;
    const nowMinutes = now.getHours() * 60 + now.getMinutes();

    if (nowMinutes < triggerMinutes) return;

    eveningRedirected.current = true;
    const timer = setTimeout(() => {
      router.replace('/evening-wrap');
    }, 100);
    return () => clearTimeout(timer);
  }, [hasDoneEvening, pathname, router, eveningConfig.enabled, eveningConfig.time]);

  return (
    <GestureHandlerRootView style={styles.container}>
      <BottomSheetModalProvider>
        <StatusBar style={themeName === 'dark' ? 'light' : 'dark'} />
        <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
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
