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
});
