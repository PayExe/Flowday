import { beforeEach, describe, expect, it, vi } from 'vitest';
import { blockFidelity, focusCredits, livedMinutes, livedMinutesByBlock } from '../src/features/blockLogs/lived';
import { useBlockLogStore } from '../src/features/blockLogs/store';
import type { BlockLog } from '../src/types/blockLog';

vi.mock('@react-native-async-storage/async-storage', () => ({
  default: {
    getItem: vi.fn().mockResolvedValue(null),
    setItem: vi.fn().mockResolvedValue(undefined),
    removeItem: vi.fn().mockResolvedValue(undefined),
  },
}));

function log(overrides: Partial<BlockLog>): BlockLog {
  return {
    date: '2026-10-05',
    lifeBlockId: 'sport',
    templateBlockId: 'slot-1',
    plannedMinutes: 60,
    status: 'done',
    source: 'manual',
    updatedAt: '2026-10-05T20:00:00.000Z',
    ...overrides,
  };
}

describe('lived time', () => {
  it('derives minutes from the status instead of asking for them', () => {
    expect(livedMinutes(log({ status: 'done' }))).toBe(60);
    expect(livedMinutes(log({ status: 'partial' }))).toBe(30);
    expect(livedMinutes(log({ status: 'skipped' }))).toBe(0);
  });

  it('sums lived minutes per block within the date range', () => {
    const logs = [
      log({ date: '2026-10-05' }),
      log({ date: '2026-10-06', status: 'partial', templateBlockId: 'slot-2' }),
      log({ date: '2026-10-06', lifeBlockId: 'work', plannedMinutes: 180 }),
      log({ date: '2026-09-28' }),
    ];
    expect(livedMinutesByBlock(logs, '2026-10-05', '2026-10-11')).toEqual({ sport: 90, work: 180 });
  });
});

describe('focus credit', () => {
  const session = {
    id: 's1',
    taskId: 't1',
    taskTitle: 'Read',
    startedAt: '2026-10-05T09:00:00.000Z',
    pomodorosCompleted: 1,
    pomodorosAbandoned: 0,
    totalFocusMinutes: 0,
  };

  it('turns measured focus seconds into minutes per day for the session domain', () => {
    expect(
      focusCredits([
        { ...session, lifeBlockId: 'learning', focusSecondsByDate: { '2026-10-05': 1500, '2026-10-06': 610 } },
        { ...session, id: 's2', focusSecondsByDate: { '2026-10-05': 1500 } },
        { ...session, id: 's3', lifeBlockId: 'sport' },
      ])
    ).toEqual([
      { date: '2026-10-05', lifeBlockId: 'learning', minutes: 25 },
      { date: '2026-10-06', lifeBlockId: 'learning', minutes: 10 },
    ]);
  });

  it('adds focus minutes to a domain with no rated block', () => {
    const focus = [{ date: '2026-10-06', lifeBlockId: 'learning', minutes: 25 }];
    expect(livedMinutesByBlock([log({})], '2026-10-05', '2026-10-11', focus)).toEqual({ sport: 60, learning: 25 });
  });

  it('keeps the larger of the rated block and the focus time on the same day, never both', () => {
    const logs = [log({ date: '2026-10-05' })];
    expect(
      livedMinutesByBlock(logs, '2026-10-05', '2026-10-11', [{ date: '2026-10-05', lifeBlockId: 'sport', minutes: 25 }])
    ).toEqual({ sport: 60 });
    expect(
      livedMinutesByBlock(logs, '2026-10-05', '2026-10-11', [{ date: '2026-10-05', lifeBlockId: 'sport', minutes: 75 }])
    ).toEqual({ sport: 75 });
  });

  it('ignores focus time outside the date range', () => {
    const focus = [{ date: '2026-09-30', lifeBlockId: 'learning', minutes: 25 }];
    expect(livedMinutesByBlock([], '2026-10-05', '2026-10-11', focus)).toEqual({});
  });
});

describe('block fidelity', () => {
  const slots = [
    { templateBlockId: 'morning', endMinutes: 12 * 60 },
    { templateBlockId: 'evening', endMinutes: 20 * 60 },
  ];

  it('judges blocks on their own, with no task needed', () => {
    expect(blockFidelity(slots, [{ templateBlockId: 'morning', status: 'done' }], 13 * 60)).toEqual({
      validated: 1,
      tracked: 1,
    });
  });

  it('leaves slots still ahead out until they end', () => {
    expect(blockFidelity(slots, [], 10 * 60)).toEqual({ validated: 0, tracked: 0 });
  });

  it('counts an ended slot left unrated as missed', () => {
    expect(blockFidelity(slots, [{ templateBlockId: 'morning', status: 'partial' }], Infinity)).toEqual({
      validated: 0.5,
      tracked: 2,
    });
  });

  it('counts a slot rated early, before it ends', () => {
    expect(blockFidelity(slots, [{ templateBlockId: 'evening', status: 'done' }], 9 * 60)).toEqual({
      validated: 1,
      tracked: 1,
    });
  });
});

describe('block log store', () => {
  beforeEach(() => useBlockLogStore.setState({ logs: [] }));

  it('keeps one answer per slot and day, and can take it back', () => {
    const store = useBlockLogStore.getState();
    const { updatedAt: _updatedAt, ...entry } = log({});
    store.setStatus(entry);
    store.setStatus({ ...entry, status: 'skipped' });

    expect(useBlockLogStore.getState().logs).toHaveLength(1);
    expect(useBlockLogStore.getState().getLog('2026-10-05', 'slot-1')?.status).toBe('skipped');

    useBlockLogStore.getState().clearStatus('2026-10-05', 'slot-1');
    expect(useBlockLogStore.getState().logs).toEqual([]);
  });

  it('rejects invalid entries', () => {
    const { updatedAt: _updatedAt, ...entry } = log({});
    useBlockLogStore.getState().setStatus({ ...entry, plannedMinutes: -5 });
    useBlockLogStore.getState().setStatus({ ...entry, status: 'maybe' as never });
    expect(useBlockLogStore.getState().logs).toEqual([]);
  });
});
