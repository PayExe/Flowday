import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useTemplateStore } from '../src/features/templates/store';

vi.mock('@react-native-async-storage/async-storage', () => ({
  default: {
    getItem: vi.fn().mockResolvedValue(null),
    setItem: vi.fn().mockResolvedValue(undefined),
    removeItem: vi.fn().mockResolvedValue(undefined),
  },
}));

describe('templates', () => {
  beforeEach(() => useTemplateStore.setState({ templates: [], activeTemplateId: null }));

  it('adds and retrieves template blocks by day', () => {
    const template = useTemplateStore.getState().addTemplate('Semaine type');
    useTemplateStore.getState().addBlockToTemplate(template.id, {
      lifeBlockId: 'work',
      dayOfWeek: 0,
      startTime: '08:00',
      endTime: '09:00',
      isFlexible: false,
    });

    expect(useTemplateStore.getState().getBlocksForDay(0)).toHaveLength(1);
    expect(useTemplateStore.getState().getActiveTemplate()?.name).toBe('Semaine type');
  });

  it('rejects invalid template block times and unknown template ids', () => {
    const template = useTemplateStore.getState().addTemplate('Semaine type');

    useTemplateStore.getState().addBlockToTemplate(template.id, {
      lifeBlockId: 'work',
      dayOfWeek: 0,
      startTime: '10:00',
      endTime: '09:00',
      isFlexible: false,
    });
    useTemplateStore.getState().setActiveTemplate('missing-template');

    expect(template.blocks).toHaveLength(0);
    expect(useTemplateStore.getState().activeTemplateId).toBe(template.id);
  });
});
