import { BlockLog, BlockStatus } from '../../types/blockLog';
import { dateKey, parseDateKey, shiftDateKey, weekDayIndex } from '../../utils/dates';

export const BLOCK_END_ACTIONS: readonly BlockStatus[] = ['done', 'partial', 'skipped'];

export function blockEndDate(firedAt: Date, dayOfWeek: number): string {
  let key = dateKey(firedAt);
  for (let offset = 0; offset < 7; offset += 1) {
    if (weekDayIndex(parseDateKey(key)) === dayOfWeek) return key;
    key = shiftDateKey(key, -1);
  }
  return dateKey(firedAt);
}

export function blockEndTarget(
  data: Record<string, unknown> | undefined,
  firedAt: Date
): Omit<BlockLog, 'status' | 'source' | 'updatedAt'> | null {
  if (!data) return null;
  const { templateBlockId, lifeBlockId, dayOfWeek, plannedMinutes } = data;
  if (typeof templateBlockId !== 'string' || typeof lifeBlockId !== 'string') return null;
  if (typeof dayOfWeek !== 'number' || dayOfWeek < 0 || dayOfWeek > 6) return null;
  if (typeof plannedMinutes !== 'number' || !Number.isFinite(plannedMinutes) || plannedMinutes < 0) return null;

  const when = Number.isFinite(firedAt.getTime()) ? firedAt : new Date();
  return { date: blockEndDate(when, dayOfWeek), templateBlockId, lifeBlockId, plannedMinutes };
}

export function blockLogFromResponse(
  actionIdentifier: string,
  data: Record<string, unknown> | undefined,
  firedAt: Date
): Omit<BlockLog, 'updatedAt'> | null {
  const status = BLOCK_END_ACTIONS.find((action) => action === actionIdentifier);
  const target = blockEndTarget(data, firedAt);
  if (!status || !target) return null;
  return { ...target, status, source: 'notification' };
}
