import { shiftWeekDay } from '../../utils/dates';
import { timeToMinutes } from '../../utils/time';

/**
 * iOS keeps at most 64 pending local notifications per app and silently drops
 * the rest, so we budget ourselves a margin below that limit.
 */
export const MAX_SCHEDULED_NOTIFICATIONS = 56;

export const OWNED_PREFIX = 'flowday-';
export const MORNING_ID = `${OWNED_PREFIX}morning-ritual`;
export const EVENING_ID = `${OWNED_PREFIX}evening-wrap`;
export const FOCUS_ID = `${OWNED_PREFIX}focus-alert`;
export const MINUTES_IN_DAY = 24 * 60;

export type PlannedTrigger =
  | { kind: 'daily'; hour: number; minute: number }
  /** `weekday` keeps the app's Monday-first indexing (0 = Monday). */
  | { kind: 'weekly'; weekday: number; hour: number; minute: number };

export interface PlannedNotification {
  id: string;
  title: string;
  body: string;
  route?: string;
  trigger: PlannedTrigger;
}

export interface RitualReminderInput {
  time: string;
  title: string;
  body: string;
  route: string;
}

export interface BlockReminderInput {
  id: string;
  dayOfWeek: number;
  startTime: string;
  title: string;
  body: string;
}

export interface NotificationPlanInput {
  morning?: RitualReminderInput;
  evening?: RitualReminderInput;
  blocks?: BlockReminderInput[];
  leadMinutes?: number;
  max?: number;
}

/**
 * Moves a weekly slot back by `minutes`, rolling over to the previous day when
 * the lead time crosses midnight (a 00:15 block reminded 30 min early).
 */
export function shiftSlotBack(
  dayOfWeek: number,
  time: string,
  minutes: number
): { weekday: number; hour: number; minute: number } {
  const total = timeToMinutes(time) - minutes;
  const dayOffset = Math.floor(total / MINUTES_IN_DAY);
  const inDay = ((total % MINUTES_IN_DAY) + MINUTES_IN_DAY) % MINUTES_IN_DAY;
  return {
    weekday: shiftWeekDay(dayOfWeek, dayOffset),
    hour: Math.floor(inDay / 60),
    minute: inDay % 60,
  };
}

function ritualNotification(
  id: string,
  ritual: RitualReminderInput
): PlannedNotification | null {
  const minutes = timeToMinutes(ritual.time);
  if (!Number.isFinite(minutes)) return null;
  return {
    id,
    title: ritual.title,
    body: ritual.body,
    route: ritual.route,
    trigger: {
      kind: 'daily',
      hour: Math.floor(minutes / 60),
      minute: minutes % 60,
    },
  };
}

/**
 * Turns the user's configuration into the exact set of local notifications to
 * register. Rituals come first because they are the backbone of the day and
 * must never be pushed out of the budget by a crowded template.
 */
export function planNotifications({
  morning,
  evening,
  blocks = [],
  leadMinutes = 0,
  max = MAX_SCHEDULED_NOTIFICATIONS,
}: NotificationPlanInput): PlannedNotification[] {
  const planned: PlannedNotification[] = [];

  if (morning) {
    const notification = ritualNotification(MORNING_ID, morning);
    if (notification) planned.push(notification);
  }
  if (evening) {
    const notification = ritualNotification(EVENING_ID, evening);
    if (notification) planned.push(notification);
  }

  const seen = new Set<string>();
  const blockNotifications: PlannedNotification[] = [];

  for (const block of blocks) {
    if (!Number.isFinite(timeToMinutes(block.startTime))) continue;
    const slot = shiftSlotBack(block.dayOfWeek, block.startTime, leadMinutes);
    // Two blocks starting at the same minute would buzz twice for one event.
    const key = `${slot.weekday}-${slot.hour}-${slot.minute}`;
    if (seen.has(key)) continue;
    seen.add(key);
    blockNotifications.push({
      id: `${OWNED_PREFIX}block-${block.id}`,
      title: block.title,
      body: block.body,
      route: '/planning',
      trigger: { kind: 'weekly', ...slot },
    });
  }

  blockNotifications.sort((a, b) => {
    const left = a.trigger as Extract<PlannedTrigger, { kind: 'weekly' }>;
    const right = b.trigger as Extract<PlannedTrigger, { kind: 'weekly' }>;
    return (
      left.weekday - right.weekday ||
      left.hour - right.hour ||
      left.minute - right.minute
    );
  });

  return [...planned, ...blockNotifications].slice(0, Math.max(0, max));
}

/** expo-notifications counts weekdays from 1 = Sunday; the app counts 0 = Monday. */
export function toExpoWeekday(weekday: number): number {
  return weekday === 6 ? 1 : weekday + 2;
}

/** A stable signature used to avoid re-registering an unchanged plan. */
export function planSignature(planned: PlannedNotification[]): string {
  return planned
    .map((item) =>
      item.trigger.kind === 'daily'
        ? `${item.id}|${item.title}|${item.body}|d${item.trigger.hour}:${item.trigger.minute}`
        : `${item.id}|${item.title}|${item.body}|w${item.trigger.weekday}:${item.trigger.hour}:${item.trigger.minute}`
    )
    .join('~');
}
