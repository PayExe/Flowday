import { beforeEach, describe, expect, it, vi } from 'vitest';
import { blockFidelity, livedMinutes, livedMinutesByBlock } from '../src/features/blockLogs/lived';
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
