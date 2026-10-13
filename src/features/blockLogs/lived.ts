import { BlockLog, BlockStatus } from '../../types/blockLog';
import { FocusSession } from '../../types/focus';

export const STATUS_CREDIT: Record<BlockStatus, number> = {
  done: 1,
  partial: 0.5,
  skipped: 0,
};

export function livedMinutes(log: Pick<BlockLog, 'plannedMinutes' | 'status'>): number {
  return Math.round(log.plannedMinutes * STATUS_CREDIT[log.status]);
}

export interface FocusCredit {
  date: string;
  lifeBlockId: string;
  minutes: number;
}

export function focusCredits(sessions: readonly FocusSession[]): FocusCredit[] {
  return sessions.flatMap((session) => {
    if (!session.lifeBlockId || !session.focusSecondsByDate) return [];
    const lifeBlockId = session.lifeBlockId;
    return Object.entries(session.focusSecondsByDate).map(([date, seconds]) => ({
      date,
      lifeBlockId,
      minutes: Math.round(seconds / 60),
    }));
  });
}

export function livedMinutesByBlock(
  logs: readonly BlockLog[],
  from: string,
  to: string,
  focus: readonly FocusCredit[] = []
): Record<string, number> {
  const fromLogs: Record<string, number> = {};
  const fromFocus: Record<string, number> = {};
  const key = (date: string, lifeBlockId: string) => `${date}|${lifeBlockId}`;

  for (const log of logs) {
    if (log.date < from || log.date > to) continue;
    const day = key(log.date, log.lifeBlockId);
    fromLogs[day] = (fromLogs[day] ?? 0) + livedMinutes(log);
  }
  for (const credit of focus) {
    if (credit.date < from || credit.date > to) continue;
    const day = key(credit.date, credit.lifeBlockId);
    fromFocus[day] = (fromFocus[day] ?? 0) + credit.minutes;
  }

  const totals: Record<string, number> = {};
  for (const day of new Set([...Object.keys(fromLogs), ...Object.keys(fromFocus)])) {
    const lifeBlockId = day.slice(day.indexOf('|') + 1);
    const minutes = Math.max(fromLogs[day] ?? 0, fromFocus[day] ?? 0);
    totals[lifeBlockId] = (totals[lifeBlockId] ?? 0) + minutes;
  }
  return totals;
}

interface PlannedSlot {
  templateBlockId: string;
  endMinutes: number;
}

export function blockFidelity(
  slots: readonly PlannedSlot[],
  logs: readonly Pick<BlockLog, 'templateBlockId' | 'status'>[],
  nowMinutes: number
): { validated: number; tracked: number } {
  let validated = 0;
  let tracked = 0;
  for (const slot of slots) {
    const log = logs.find((candidate) => candidate.templateBlockId === slot.templateBlockId);
    if (!log && slot.endMinutes > nowMinutes) continue;
    tracked += 1;
    if (log) validated += STATUS_CREDIT[log.status];
  }
  return { validated, tracked };
}
