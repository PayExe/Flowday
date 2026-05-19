import { useEffect, useRef } from 'react';
import { Stack, useRouter, usePathname } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useRitualStore } from '../src/features/rituals/store';
import { useLifeBlocksStore } from '../src/features/lifeBlocks/store';
import { useTemplateStore } from '../src/features/templates/store';

function todayISO(): string {
  return new Date().toISOString().split('T')[0];
}

export default function RootLayout() {
  const router = useRouter();
  const pathname = usePathname();

  const logs = useRitualStore((state) => state.logs);
  const morningConfig = useRitualStore((state) => state.morningConfig);

  const blocks = useLifeBlocksStore((state) => state.blocks);
  const initializeBlocks = useLifeBlocksStore((state) => state.initializeDefaults);

  const templates = useTemplateStore((state) => state.templates);
  const initializeTemplates = useTemplateStore((state) => state.initializeDefaults);

  const hasDoneMorning = logs.some(
    (log) => log.date === todayISO() && log.type === 'morning'
  );

  // Initialize default blocks once
  const didInitBlocks = useRef(false);
  useEffect(() => {
    if (didInitBlocks.current) return;
    didInitBlocks.current = true;
    initializeBlocks();
  }, [initializeBlocks]);

  // Initialize default template once after blocks exist
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

  // Auto-redirect to morning ritual if not done today
  useEffect(() => {
    if (!morningConfig.enabled) return;
    if (hasDoneMorning) return;
    if (pathname === '/morning-ritual') return;
    const timer = setTimeout(() => {
      router.replace('/morning-ritual');
    }, 100);
    return () => clearTimeout(timer);
  }, [hasDoneMorning, pathname, router, morningConfig.enabled]);

  return (
    <>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false }} />
    </>
  );
}
