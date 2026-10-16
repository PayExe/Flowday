import { BlockLog } from '../../types/blockLog';
import { DayScore, WeekScore } from '../../types/dayScore';
import { TemplateBlock } from '../../types/template';
import { calendarDayDifference, dateKey, parseDateKey, shiftDateKey, weekDayIndex } from '../../utils/dates';
import { currentMinutes, timeToMinutes } from '../../utils/time';
import { FocusCredit, livedMinutesByBlock } from '../blockLogs/lived';

export type ReviewPeriod = 'week' | 'month';

export interface PeriodRange {
  from: string;
  to: string;
}

export function periodRange(period: ReviewPeriod, offset: number, today = dateKey()): PeriodRange {
  if (period === 'week') {
    const from = shiftDateKey(today, -weekDayIndex(parseDateKey(today)) + offset * 7);
    return { from, to: shiftDateKey(from, 6) };
  }
  const date = parseDateKey(today);
  const first = new Date(date.getFullYear(), date.getMonth() + offset, 1);
  const last = new Date(date.getFullYear(), date.getMonth() + offset + 1, 0);
  return { from: dateKey(first), to: dateKey(last) };
}

export function periodDays({ from, to }: PeriodRange): number {
  return calendarDayDifference(from, to) + 1;
}

export interface TrackingStart {
  day: string;
  fromMinutes: number;
}

// Measuring starts when the onboarding ended, or on the first rated block or Focus day
// if that came earlier. Slots that ended before that moment were never lived with the app.
export function trackingStart(
  logs: readonly BlockLog[],
  focus: readonly FocusCredit[],
  trackingSince?: string | null
): TrackingStart | null {
  let first: string | null = null;
  for (const { date } of [...logs, ...focus]) {
    if (first === null || date < first) first = date;
  }
  const since = trackingSince ? new Date(trackingSince) : null;
  if (since && !Number.isNaN(since.getTime()) && (first === null || dateKey(since) <= first)) {
    return { day: dateKey(since), fromMinutes: currentMinutes(since) };
  }
  return first === null ? null : { day: first, fromMinutes: -1 };
}

export interface DomainReview {
  plannedMinutes: number;
  livedMinutes: number;
  unratedMinutes: number;
}

interface ReviewInput {
  slots: readonly Pick<TemplateBlock, 'id' | 'lifeBlockId' | 'dayOfWeek' | 'startTime' | 'endTime'>[];
  logs: readonly BlockLog[];
  focus?: readonly FocusCredit[];
  range: PeriodRange;
  today: string;
  nowMinutes: number;
  trackingSince?: string | null;
}

export function reviewByBlock({
  slots,
  logs,
  focus = [],
  range,
  today,
  nowMinutes,
  trackingSince,
}: ReviewInput): Record<string, DomainReview> {
  const review: Record<string, DomainReview> = {};
  const entry = (lifeBlockId: string) =>
    (review[lifeBlockId] ??= { plannedMinutes: 0, livedMinutes: 0, unratedMinutes: 0 });

  const start = trackingStart(logs, focus, trackingSince);
  const from = start && start.day > range.from ? start.day : range.from;
  const to = today < range.to ? today : range.to;

  if (start !== null && from <= to) {
    const logsByDay = new Map<string, BlockLog[]>();
    for (const log of logs) {
      if (log.date < from || log.date > to) continue;
      logsByDay.set(log.date, [...(logsByDay.get(log.date) ?? []), log]);
    }

    for (let day = from; day <= to; day = shiftDateKey(day, 1)) {
      const dayLogs = logsByDay.get(day) ?? [];
      const dayOfWeek = weekDayIndex(parseDateKey(day));
      const daySlots = slots.filter((slot) => slot.dayOfWeek === dayOfWeek);

      for (const slot of daySlots) {
        const log = dayLogs.find((candidate) => candidate.templateBlockId === slot.id);
        if (log) continue;
        const end = timeToMinutes(slot.endTime);
        if (day === today && end > nowMinutes) continue;
        if (day === start.day && end <= start.fromMinutes) continue;
        const minutes = end - timeToMinutes(slot.startTime);
        entry(slot.lifeBlockId).plannedMinutes += minutes;
        entry(slot.lifeBlockId).unratedMinutes += minutes;
      }
      for (const log of dayLogs) {
        entry(log.lifeBlockId).plannedMinutes += log.plannedMinutes;
      }
    }
  }

  const lived = livedMinutesByBlock(logs, range.from, to, focus);
  for (const [lifeBlockId, minutes] of Object.entries(lived)) {
    entry(lifeBlockId).livedMinutes = minutes;
  }
  return review;
}

export interface ReviewGap {
  lifeBlockId: string;
  plannedMinutes: number;
  livedMinutes: number;
}

export const MIN_GAP_MINUTES = 30;

export function largestGap(review: Record<string, DomainReview>): ReviewGap | null {
  let largest: ReviewGap | null = null;
  let largestMissed = 0;
  for (const [lifeBlockId, domain] of Object.entries(review)) {
    const missed = domain.plannedMinutes - domain.unratedMinutes - domain.livedMinutes;
    if (missed >= MIN_GAP_MINUTES && missed > largestMissed) {
      largestMissed = missed;
      largest = { lifeBlockId, plannedMinutes: domain.plannedMinutes, livedMinutes: domain.livedMinutes };
    }
  }
  return largest;
}

export function balancePercent(review: Record<string, DomainReview>): number | null {
  const ratios = Object.values(review)
    .filter((domain) => domain.plannedMinutes > 0)
    .map((domain) => Math.min(domain.livedMinutes / domain.plannedMinutes, 1));
  if (ratios.length === 0) return null;
  return Math.round((ratios.reduce((sum, ratio) => sum + ratio, 0) / ratios.length) * 100);
}

export function averageScore(scores: readonly DayScore[], { from, to }: PeriodRange): number | null {
  const inRange = scores.filter((score) => score.date >= from && score.date <= to && score.blocksTracked > 0);
  if (inRange.length === 0) return null;
  return Math.round(inRange.reduce((sum, score) => sum + score.fidelity, 0) / inRange.length);
}

export function buildWeekScore(scores: readonly DayScore[], startDate: string): WeekScore | null {
  const range = { from: startDate, to: shiftDateKey(startDate, 6) };
  const averageDayScore = averageScore(scores, range);
  if (averageDayScore === null) return null;
  return {
    startDate: range.from,
    endDate: range.to,
    averageDayScore,
    previousWeekAverage: averageScore(scores, {
      from: shiftDateKey(startDate, -7),
      to: shiftDateKey(startDate, -1),
    }),
    dayScores: scores
      .filter((score) => score.date >= range.from && score.date <= range.to && score.blocksTracked > 0)
      .sort((a, b) => a.date.localeCompare(b.date)),
  };
}
