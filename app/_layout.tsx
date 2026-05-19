import { useEffect, useState } from 'react';
import { Stack, useRouter, usePathname } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useRitualStore } from '../src/features/rituals/store';

function todayISO(): string {
  return new Date().toISOString().split('T')[0];
}

export default function RootLayout() {
  const router = useRouter();
  const pathname = usePathname();
  const logs = useRitualStore((state) => state.logs);
  const morningConfig = useRitualStore((state) => state.morningConfig);

  const hasDoneMorning = logs.some(
    (log) => log.date === todayISO() && log.type === 'morning'
  );

  useEffect(() => {
    if (!morningConfig.enabled) return;
    if (hasDoneMorning) return;
    if (pathname === '/morning-ritual') return;
    // Petite temporisation pour laisser le router s'initialiser
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
