import { describe, expect, it, vi } from 'vitest';
import { isReturningUser } from '../src/features/onboarding/returningUser';
import { useTemplateStore } from '../src/features/templates/store';

vi.mock('@react-native-async-storage/async-storage', () => ({
  default: {
    getItem: vi.fn().mockResolvedValue(null),
    setItem: vi.fn().mockResolvedValue(undefined),
    removeItem: vi.fn().mockResolvedValue(undefined),
  },
}));

describe('onboarding', () => {
  const starters = [{ id: 'default-work' }, { id: 'default-sport' }];

  it('shows onboarding on a first launch with only starter blocks', () => {
    expect(isReturningUser({ tasks: [], ritualLogs: [], lifeBlocks: starters })).toBe(false);
  });

  it('skips it for people who already used the app', () => {
    expect(isReturningUser({ tasks: [{}], ritualLogs: [], lifeBlocks: starters })).toBe(true);
    expect(isReturningUser({ tasks: [], ritualLogs: [{}], lifeBlocks: starters })).toBe(true);
    expect(isReturningUser({ tasks: [], ritualLogs: [], lifeBlocks: [...starters, { id: 'abc' }] })).toBe(true);
  });

  it('remembers when the first onboarding ended, even if it is replayed', async () => {
    const { useOnboardingStore } = await import('../src/features/onboarding/store');
    useOnboardingStore.setState({ completed: false, completedAt: undefined });
    useOnboardingStore.getState().complete();
    const first = useOnboardingStore.getState().completedAt;
    expect(first).toEqual(expect.any(String));

    useOnboardingStore.getState().complete();
    expect(useOnboardingStore.getState().completedAt).toBe(first);
  });

  it('removes the week slots of declined blocks', () => {
    useTemplateStore.setState({ templates: [], activeTemplateId: null });
    useTemplateStore.getState().initializeDefaults(['default-work', 'default-sport', 'default-health']);
    useTemplateStore.getState().removeBlocksForLifeBlocks(['default-sport']);

    const blocks = useTemplateStore.getState().templates[0].blocks;
    expect(blocks.length).toBeGreaterThan(0);
    expect(blocks.some((block) => block.lifeBlockId === 'default-sport')).toBe(false);
  });
});
