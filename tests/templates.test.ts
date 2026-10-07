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

  it('copies a day onto other days, replacing what was there', () => {
    const template = useTemplateStore.getState().addTemplate('Semaine type');
    const store = () => useTemplateStore.getState();

    store().addBlockToTemplate(template.id, {
      lifeBlockId: 'work',
      dayOfWeek: 0,
      startTime: '09:00',
      endTime: '12:00',
      isFlexible: false,
    });
    store().addBlockToTemplate(template.id, {
      lifeBlockId: 'sport',
      dayOfWeek: 2,
      startTime: '19:00',
      endTime: '20:00',
      isFlexible: true,
    });

    store().copyDayBlocks(template.id, 0, [1, 2]);

    expect(store().getBlocksForDay(1)).toHaveLength(1);
    expect(store().getBlocksForDay(1)[0].startTime).toBe('09:00');
    expect(store().getBlocksForDay(2).map((b) => b.lifeBlockId)).toEqual(['work']);
    expect(store().getBlocksForDay(0)).toHaveLength(1);

    const ids = store().getActiveTemplate()!.blocks.map((b) => b.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('ignores the source day and out of range targets when copying', () => {
    const template = useTemplateStore.getState().addTemplate('Semaine type');
    const store = () => useTemplateStore.getState();

    store().addBlockToTemplate(template.id, {
      lifeBlockId: 'work',
      dayOfWeek: 3,
      startTime: '09:00',
      endTime: '10:00',
      isFlexible: false,
    });

    store().copyDayBlocks(template.id, 3, [3]);
    store().copyDayBlocks(template.id, 3, [9, -1]);

    expect(store().getActiveTemplate()!.blocks).toHaveLength(1);
  });

  it('clears every slot of a single day', () => {
    const template = useTemplateStore.getState().addTemplate('Semaine type');
    const store = () => useTemplateStore.getState();

    for (const dayOfWeek of [0, 1] as const) {
      store().addBlockToTemplate(template.id, {
        lifeBlockId: 'work',
        dayOfWeek,
        startTime: '09:00',
        endTime: '10:00',
        isFlexible: false,
      });
    }

    store().clearDay(template.id, 0);

    expect(store().getBlocksForDay(0)).toHaveLength(0);
    expect(store().getBlocksForDay(1)).toHaveLength(1);
  });
});
