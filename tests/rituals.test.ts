import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useRitualStore } from '../src/features/rituals/store';

vi.mock('@react-native-async-storage/async-storage', () => ({
  default: {
    getItem: vi.fn().mockResolvedValue(null),
    setItem: vi.fn().mockResolvedValue(undefined),
    removeItem: vi.fn().mockResolvedValue(undefined),
  },
}));

describe('rituals', () => {
  beforeEach(() => {
    useRitualStore.setState({ logs: [] });
  });

  it('logs one morning ritual for the current day', () => {
    useRitualStore.getState().logMorningRitual({ mood: 'good', intention: 'Focus' });

    expect(useRitualStore.getState().hasDoneMorningToday()).toBe(true);
    expect(useRitualStore.getState().getTodayLog('morning')).toMatchObject({
      type: 'morning',
      mood: 'good',
      intention: 'Focus',
    });
  });

  it('updates morning configuration without losing existing options', () => {
    useRitualStore.getState().updateMorningConfig({ fastMode: true });

    expect(useRitualStore.getState().morningConfig).toMatchObject({
      fastMode: true,
      enabled: true,
    });
  });
});
