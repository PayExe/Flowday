import { describe, expect, it, vi } from 'vitest';
import { runMigrations } from '../src/utils/persistence';

const storage = vi.hoisted(() => new Map<string, string>());

vi.mock('@react-native-async-storage/async-storage', () => ({
  default: {
    getItem: vi.fn(async (key: string) => storage.get(key) ?? null),
    setItem: vi.fn(async (key: string, value: string) => {
      storage.set(key, value);
    }),
    removeItem: vi.fn(async (key: string) => {
      storage.delete(key);
    }),
  },
}));

describe('runMigrations', () => {
  const migrations = {
    1: (state: Record<string, unknown>) => ({ ...state, steps: [...(state.steps as number[]), 1] }),
    2: (state: Record<string, unknown>) => ({ ...state, steps: [...(state.steps as number[]), 2] }),
  };

  it('applies each step after the stored version, in order', () => {
    expect(runMigrations({ steps: [] }, 0, 2, migrations)).toEqual({ steps: [1, 2] });
    expect(runMigrations({ steps: [] }, 1, 2, migrations)).toEqual({ steps: [2] });
  });

  it('treats missing steps as no-ops', () => {
    expect(runMigrations({ steps: [] }, 2, 3, migrations)).toEqual({ steps: [] });
  });

  it('leaves data from a newer build untouched', () => {
    const state = { steps: [9] };
    expect(runMigrations(state, 5, 2, migrations)).toBe(state);
  });

  it('keeps the saved data when a step throws', () => {
    const state = { steps: [] };
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const failing = { 1: () => { throw new Error('boom'); } };

    expect(runMigrations(state, 0, 1, failing)).toBe(state);
    expect(warn).toHaveBeenCalled();
    warn.mockRestore();
  });
});

describe('versioned stores', () => {
  it('hydrates data saved before versioning existed', async () => {
    const block = {
      id: 'legacy',
      name: 'Legacy',
      emoji: '💻',
      color: '#0A84FF',
      isArchived: false,
      weeklyGoalMinutes: 60,
      order: 0,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    };
    storage.set('flowday-lifeblocks', JSON.stringify({ state: { blocks: [block] }, version: 0 }));

    const { useLifeBlocksStore } = await import('../src/features/lifeBlocks/store');
    await useLifeBlocksStore.persist.rehydrate();

    expect(useLifeBlocksStore.getState().blocks).toEqual([block]);
    useLifeBlocksStore.getState().updateBlock('legacy', { name: 'Renamed' });
    expect(JSON.parse(storage.get('flowday-lifeblocks')!).version).toBe(1);
  });
});
