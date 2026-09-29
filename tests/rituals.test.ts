import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useRitualStore } from '../src/features/rituals/store';
import { skipMorningRitual } from '../src/utils/ritualNavigation';

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

  it('rejects invalid ritual times', () => {
    const initialTime = useRitualStore.getState().morningConfig.time;

    useRitualStore.getState().updateMorningConfig({ time: '25:99' });

    expect(useRitualStore.getState().morningConfig.time).toBe(initialTime);
  });

  it('navigates home when the morning ritual is postponed', () => {
    const replace = vi.fn();

    skipMorningRitual({ replace });

    expect(replace).toHaveBeenCalledWith('/');
  });
});
