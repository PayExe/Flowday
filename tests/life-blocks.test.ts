import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useLifeBlocksStore } from '../src/features/lifeBlocks/store';

vi.mock('@react-native-async-storage/async-storage', () => ({
  default: {
    getItem: vi.fn().mockResolvedValue(null),
    setItem: vi.fn().mockResolvedValue(undefined),
    removeItem: vi.fn().mockResolvedValue(undefined),
  },
}));

describe('life blocks', () => {
  beforeEach(() => useLifeBlocksStore.setState({ blocks: [] }));

  it('initializes defaults and excludes archived blocks', () => {
    useLifeBlocksStore.getState().initializeDefaults();
    const block = useLifeBlocksStore.getState().getActiveBlocks()[0];

    expect(useLifeBlocksStore.getState().blocks).toHaveLength(5);
    useLifeBlocksStore.getState().archiveBlock(block.id);

    expect(useLifeBlocksStore.getState().getActiveBlocks()).toHaveLength(4);
    expect(useLifeBlocksStore.getState().getBlockById(block.id)?.isArchived).toBe(true);
  });

  it('rejects a negative weekly goal', () => {
    useLifeBlocksStore.getState().addBlock({
      name: 'Invalid',
      emoji: 'x',
      color: '#0A84FF',
      isArchived: false,
      weeklyGoalMinutes: -10,
    });

    expect(useLifeBlocksStore.getState().blocks).toHaveLength(0);
  });
});

describe('starter block names', () => {
  beforeEach(() => useLifeBlocksStore.setState({ blocks: [] }));

  it('follow the language until the user renames them', () => {
    const store = useLifeBlocksStore.getState();
    store.initializeDefaults();
    store.updateBlock('default-sport', { name: 'Course à pied' });

    useLifeBlocksStore.getState().localizeDefaults('fr');
    const names = () => Object.fromEntries(useLifeBlocksStore.getState().blocks.map((b) => [b.id, b.name]));
    expect(names()).toMatchObject({ 'default-work': 'Travail', 'default-health': 'Santé', 'default-sport': 'Course à pied' });

    useLifeBlocksStore.getState().localizeDefaults('en');
    expect(names()).toMatchObject({ 'default-work': 'Work', 'default-sport': 'Course à pied' });
  });
});
