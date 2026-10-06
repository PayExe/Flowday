export function skipMorningRitual(router: { replace: (path: string) => void }): void {
  router.replace('/');
}

export const MINUTES_PER_DAY = 24 * 60;

export const MORNING_AUTO_OPEN_WINDOW_MINUTES = 3 * 60;

export function minutesOfDay(date: Date): number {
  return date.getHours() * 60 + date.getMinutes();
}

export function isPastTime(time: string, now = new Date()): boolean {
  const [hours, minutes] = time.split(':').map(Number);
  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return false;
  return minutesOfDay(now) >= hours * 60 + minutes;
}

export function autoOpenDelay(
  time: string,
  windowMinutes: number,
  now = new Date()
): number | null {
  const [hours, minutes] = time.split(':').map(Number);
  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return null;

  const triggerMinutes = hours * 60 + minutes;
  const nowMinutes = minutesOfDay(now);

  if (nowMinutes < triggerMinutes) return (triggerMinutes - nowMinutes) * 60 * 1000;
  if (nowMinutes <= triggerMinutes + windowMinutes) return 100;
  return null;
}
