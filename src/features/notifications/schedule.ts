import { shiftWeekDay } from '../../utils/dates';
import { timeToMinutes } from '../../utils/time';

export const MAX_SCHEDULED_NOTIFICATIONS = 56;

export const OWNED_PREFIX = 'flowday-';
export const MORNING_ID = `${OWNED_PREFIX}morning-ritual`;
export const EVENING_ID = `${OWNED_PREFIX}evening-wrap`;
export const FOCUS_ID = `${OWNED_PREFIX}focus-alert`;
export const BLOCK_END_CATEGORY = `${OWNED_PREFIX}block-end`;
export const MINUTES_IN_DAY = 24 * 60;

export type PlannedTrigger =
  | { kind: 'daily'; hour: number; minute: number }
  | { kind: 'weekly'; weekday: number; hour: number; minute: number };

export interface PlannedNotification {
  id: string;
  title: string;
  body: string;
  route?: string;
  categoryId?: string;
  data?: Record<string, string | number>;
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

export interface BlockEndInput {
  id: string;
  lifeBlockId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  title: string;
  body: string;
}

export interface NotificationPlanInput {
  morning?: RitualReminderInput;
  evening?: RitualReminderInput;
  blocks?: BlockReminderInput[];
  blockEnds?: BlockEndInput[];
  leadMinutes?: number;
  max?: number;
}

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

type WeeklyTrigger = Extract<PlannedTrigger, { kind: 'weekly' }>;

function byWeekTime(a: PlannedNotification, b: PlannedNotification): number {
  const left = a.trigger as WeeklyTrigger;
  const right = b.trigger as WeeklyTrigger;
  return left.weekday - right.weekday || left.hour - right.hour || left.minute - right.minute;
}

function blockEndNotification(block: BlockEndInput): PlannedNotification | null {
  const start = timeToMinutes(block.startTime);
  const end = timeToMinutes(block.endTime);
  if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) return null;
  return {
    id: `${OWNED_PREFIX}block-end-${block.id}`,
    title: block.title,
    body: block.body,
    route: '/planning',
    categoryId: BLOCK_END_CATEGORY,
    data: {
      templateBlockId: block.id,
      lifeBlockId: block.lifeBlockId,
      dayOfWeek: block.dayOfWeek,
      plannedMinutes: end - start,
    },
    trigger: { kind: 'weekly', ...shiftSlotBack(block.dayOfWeek, block.endTime, 0) },
  };
}

export function planNotifications({
  morning,
  evening,
  blocks = [],
  blockEnds = [],
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

  blockNotifications.sort(byWeekTime);

  const endNotifications = blockEnds
    .map(blockEndNotification)
    .filter((item): item is PlannedNotification => item !== null)
    .sort(byWeekTime);

  return [...planned, ...endNotifications, ...blockNotifications].slice(0, Math.max(0, max));
}

export function toExpoWeekday(weekday: number): number {
  return weekday === 6 ? 1 : weekday + 2;
}

export function planSignature(planned: PlannedNotification[]): string {
  return planned
    .map((item) => {
      const when =
        item.trigger.kind === 'daily'
          ? `d${item.trigger.hour}:${item.trigger.minute}`
          : `w${item.trigger.weekday}:${item.trigger.hour}:${item.trigger.minute}`;
      return `${item.id}|${item.title}|${item.body}|${when}|${JSON.stringify(item.data ?? {})}`;
    })
    .join('~');
}
