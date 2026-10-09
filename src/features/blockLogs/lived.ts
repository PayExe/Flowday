import { BlockLog, BlockStatus } from '../../types/blockLog';

export const STATUS_CREDIT: Record<BlockStatus, number> = {
  done: 1,
  partial: 0.5,
  skipped: 0,
};

export function livedMinutes(log: Pick<BlockLog, 'plannedMinutes' | 'status'>): number {
  return Math.round(log.plannedMinutes * STATUS_CREDIT[log.status]);
}

export function livedMinutesByBlock(
  logs: readonly BlockLog[],
  from: string,
  to: string
): Record<string, number> {
  const totals: Record<string, number> = {};
  for (const log of logs) {
    if (log.date < from || log.date > to) continue;
    totals[log.lifeBlockId] = (totals[log.lifeBlockId] ?? 0) + livedMinutes(log);
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
