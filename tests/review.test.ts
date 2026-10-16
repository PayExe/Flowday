import { describe, expect, it } from 'vitest';
import {
  averageScore,
  balancePercent,
  buildWeekScore,
  largestGap,
  periodDays,
  periodRange,
  reviewByBlock,
  trackingStart,
} from '../src/features/review/review';
import type { BlockLog } from '../src/types/blockLog';
import type { DayScore } from '../src/types/dayScore';

function log(overrides: Partial<BlockLog>): BlockLog {
  return {
    date: '2026-10-05',
    lifeBlockId: 'sport',
    templateBlockId: 'sport-mon',
    plannedMinutes: 60,
    status: 'done',
    source: 'notification',
    updatedAt: '2026-10-05T20:00:00.000Z',
    ...overrides,
  };
}

function score(date: string, fidelity: number, blocksTracked = 2): DayScore {
  return { date, fidelity, blocksTracked };
}

const slots = [
  { id: 'sport-mon', lifeBlockId: 'sport', dayOfWeek: 0 as const, startTime: '19:00', endTime: '20:00' },
  { id: 'sport-wed', lifeBlockId: 'sport', dayOfWeek: 2 as const, startTime: '19:00', endTime: '20:00' },
  { id: 'work-mon', lifeBlockId: 'work', dayOfWeek: 0 as const, startTime: '09:00', endTime: '12:00' },
];

const week = { from: '2026-10-05', to: '2026-10-11' };

describe('review periods', () => {
  it('starts weeks on Monday and steps by whole weeks', () => {
    expect(periodRange('week', 0, '2026-10-08')).toEqual(week);
    expect(periodRange('week', -1, '2026-10-05')).toEqual({ from: '2026-09-28', to: '2026-10-04' });
  });

  it('covers whole calendar months, across a year boundary', () => {
    expect(periodRange('month', 0, '2026-10-13')).toEqual({ from: '2026-10-01', to: '2026-10-31' });
    expect(periodRange('month', -10, '2026-10-13')).toEqual({ from: '2025-12-01', to: '2025-12-31' });
    expect(periodDays(periodRange('month', -8, '2026-10-13'))).toBe(28);
  });

  it('starts tracking on the first rated block or focus day', () => {
    expect(trackingStart([], [])).toBeNull();
    expect(
      trackingStart([log({ date: '2026-10-06' })], [{ date: '2026-10-04', lifeBlockId: 'sport', minutes: 25 }])
    ).toEqual({ day: '2026-10-04', fromMinutes: -1 });
  });

  it('starts tracking when the onboarding ended, unless the journal is older', () => {
    const installedAt = new Date(2026, 9, 5, 15, 30).toISOString();
    expect(trackingStart([], [], installedAt)).toEqual({ day: '2026-10-05', fromMinutes: 15 * 60 + 30 });
    expect(trackingStart([log({ date: '2026-10-07' })], [], installedAt)).toEqual({
      day: '2026-10-05',
      fromMinutes: 15 * 60 + 30,
    });
    expect(trackingStart([log({ date: '2026-09-30' })], [], installedAt)).toEqual({ day: '2026-09-30', fromMinutes: -1 });
  });
});

describe('planned vs lived', () => {
  const base = { slots, range: week, today: '2026-10-11', nowMinutes: 23 * 60 };

  it('plans nothing before the journal exists, rather than inventing a gap', () => {
    expect(reviewByBlock({ ...base, logs: [] })).toEqual({});
  });

  it('compares the planned template with the lived journal per domain', () => {
    const logs = [
      log({}),
      log({ date: '2026-10-07', templateBlockId: 'sport-wed', status: 'partial' }),
      log({ templateBlockId: 'work-mon', lifeBlockId: 'work', plannedMinutes: 180, status: 'skipped' }),
    ];
    expect(reviewByBlock({ ...base, logs })).toEqual({
      sport: { plannedMinutes: 120, livedMinutes: 90, unratedMinutes: 0 },
      work: { plannedMinutes: 180, livedMinutes: 0, unratedMinutes: 0 },
    });
  });

  it('counts a slot nobody answered as planned and unrated, not as skipped', () => {
    expect(reviewByBlock({ ...base, logs: [log({})] }).sport).toEqual({
      plannedMinutes: 120,
      livedMinutes: 60,
      unratedMinutes: 60,
    });
  });

  it('starts planning on the first day of the journal', () => {
    const review = reviewByBlock({ ...base, logs: [log({ date: '2026-10-07', templateBlockId: 'sport-wed' })] });
    expect(review.work).toBeUndefined();
    expect(review.sport.plannedMinutes).toBe(60);
  });

  it('counts nothing that ended before the app was installed', () => {
    const trackingSince = new Date(2026, 9, 5, 15, 30).toISOString();
    expect(reviewByBlock({ ...base, logs: [], trackingSince })).toEqual({
      sport: { plannedMinutes: 120, livedMinutes: 0, unratedMinutes: 120 },
    });
  });

  it('ignores slots that are still to come today, and future days', () => {
    const review = reviewByBlock({ ...base, logs: [log({})], today: '2026-10-07', nowMinutes: 19 * 60 + 30 });
    expect(review.sport).toEqual({ plannedMinutes: 60, livedMinutes: 60, unratedMinutes: 0 });
  });

  it('keeps the minutes planned when the block was rated, even after the template changed', () => {
    const logs = [
      log({ plannedMinutes: 90 }),
      log({ date: '2026-10-06', templateBlockId: 'removed-slot', lifeBlockId: 'reading', plannedMinutes: 30 }),
    ];
    const review = reviewByBlock({ ...base, logs });
    expect(review.sport.plannedMinutes).toBe(150);
    expect(review.reading).toEqual({ plannedMinutes: 30, livedMinutes: 30, unratedMinutes: 0 });
  });

  it('adds focus time to the lived side', () => {
    const review = reviewByBlock({
      ...base,
      logs: [log({})],
      focus: [{ date: '2026-10-08', lifeBlockId: 'learning', minutes: 50 }],
    });
    expect(review.learning).toEqual({ plannedMinutes: 0, livedMinutes: 50, unratedMinutes: 0 });
  });
});

describe('largest gap', () => {
  it('points at the domain that missed the most confirmed time', () => {
    expect(
      largestGap({
        sport: { plannedMinutes: 360, livedMinutes: 100, unratedMinutes: 0 },
        work: { plannedMinutes: 1200, livedMinutes: 1860, unratedMinutes: 0 },
        reading: { plannedMinutes: 120, livedMinutes: 0, unratedMinutes: 0 },
      })
    ).toEqual({ lifeBlockId: 'sport', plannedMinutes: 360, livedMinutes: 100 });
  });

  it('does not blame a domain for slots nobody answered, or for small gaps', () => {
    expect(
      largestGap({
        sport: { plannedMinutes: 360, livedMinutes: 0, unratedMinutes: 360 },
        reading: { plannedMinutes: 60, livedMinutes: 40, unratedMinutes: 0 },
      })
    ).toBeNull();
  });
});

describe('balance', () => {
  it('averages each domain lived share of its plan, capped so an overflow never compensates', () => {
    expect(
      balancePercent({
        sport: { plannedMinutes: 360, livedMinutes: 90, unratedMinutes: 0 },
        work: { plannedMinutes: 1200, livedMinutes: 1860, unratedMinutes: 0 },
      })
    ).toBe(63);
  });

  it('ignores domains with nothing planned, and has nothing to say without a plan', () => {
    expect(
      balancePercent({
        reading: { plannedMinutes: 120, livedMinutes: 60, unratedMinutes: 0 },
        learning: { plannedMinutes: 0, livedMinutes: 50, unratedMinutes: 0 },
      })
    ).toBe(50);
    expect(balancePercent({ learning: { plannedMinutes: 0, livedMinutes: 50, unratedMinutes: 0 } })).toBeNull();
  });
});

describe('week score', () => {
  const scores = [
    score('2026-09-29', 50),
    score('2026-10-05', 80),
    score('2026-10-06', 61),
    score('2026-10-07', 0, 0),
    score('2026-10-12', 99),
  ];

  it('averages the fidelity of the days that had something planned', () => {
    expect(averageScore(scores, week)).toBe(71);
    expect(averageScore(scores, { from: '2026-10-13', to: '2026-10-19' })).toBeNull();
  });

  it('compares the week with the previous one', () => {
    expect(buildWeekScore(scores, '2026-10-05')).toEqual({
      startDate: '2026-10-05',
      endDate: '2026-10-11',
      averageDayScore: 71,
      previousWeekAverage: 50,
      dayScores: [scores[1], scores[2]],
    });
    expect(buildWeekScore(scores, '2026-10-12')?.previousWeekAverage).toBe(71);
    expect(buildWeekScore(scores, '2026-10-19')).toBeNull();
  });
});
