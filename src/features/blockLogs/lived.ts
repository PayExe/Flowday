import { BlockLog, BlockStatus } from '../../types/blockLog';

/** Share of a slot that counts as lived. Users never type minutes: the status is enough. */
export const STATUS_CREDIT: Record<BlockStatus, number> = {
  done: 1,
  partial: 0.5,
  skipped: 0,
};

export function livedMinutes(log: Pick<BlockLog, 'plannedMinutes' | 'status'>): number {
  return Math.round(log.plannedMinutes * STATUS_CREDIT[log.status]);
}

/** Lived minutes per life block for logs dated within [from, to] (YYYY-MM-DD, inclusive). */
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

/**
 * How faithfully a day's plan was lived, for the score. A slot counts once it
 * is logged or once it has ended: a slot still ahead can't be missed yet, but
 * one that ended without being logged was not lived. Pass `nowMinutes` as
 * Infinity for a finished day.
 */
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
