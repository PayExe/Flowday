import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { persistOptions } from '../../utils/persistence';
import { generateId } from '../../utils/id';
import { WeeklyTemplate, TemplateBlock } from '../../types/template';
import { isValidTime } from '../../utils/dates';

function isValidBlock(block: Omit<TemplateBlock, 'id'> | TemplateBlock): boolean {
  return Number.isInteger(block.dayOfWeek)
    && block.dayOfWeek >= 0
    && block.dayOfWeek <= 6
    && isValidTime(block.startTime)
    && isValidTime(block.endTime)
    && block.startTime < block.endTime
    && block.lifeBlockId.trim().length > 0;
}

interface TemplateState {
  templates: WeeklyTemplate[];
  activeTemplateId: string | null;
  addTemplate: (name: string) => WeeklyTemplate;
  setActiveTemplate: (id: string) => void;
  addBlockToTemplate: (templateId: string, block: Omit<TemplateBlock, 'id'>) => void;
  updateTemplateBlock: (templateId: string, blockId: string, updates: Partial<TemplateBlock>) => void;
  removeTemplateBlock: (templateId: string, blockId: string) => void;
  copyDayBlocks: (templateId: string, fromDay: number, toDays: number[]) => void;
  clearDay: (templateId: string, dayOfWeek: number) => void;
  getActiveTemplate: () => WeeklyTemplate | undefined;
  getBlocksForDay: (dayOfWeek: number) => TemplateBlock[];
  getTodayBlocks: () => TemplateBlock[];
  initializeDefaults: (lifeBlockIds: string[]) => void;
}

export const useTemplateStore = create<TemplateState>()(
  persist(
    (set, get) => ({
      templates: [],
      activeTemplateId: null,

      addTemplate: (name) => {
        const newTemplate: WeeklyTemplate = {
          id: generateId(),
          name,
          isActive: true,
          blocks: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        set((state) => ({
          templates: [...state.templates, newTemplate],
          activeTemplateId: newTemplate.id,
        }));
        return newTemplate;
      },

      setActiveTemplate: (id) => {
        if (!get().templates.some((template) => template.id === id)) return;
        set((state) => ({
          templates: state.templates.map((t) => ({
            ...t,
            isActive: t.id === id,
          })),
          activeTemplateId: id,
        }));
      },

      addBlockToTemplate: (templateId, block) => {
        if (!get().templates.some((template) => template.id === templateId) || !isValidBlock(block)) return;
        set((state) => ({
          templates: state.templates.map((t) =>
            t.id === templateId
              ? {
                  ...t,
                  blocks: [
                    ...t.blocks,
                    { ...block, id: generateId() },
                  ],
                  updatedAt: new Date().toISOString(),
                }
              : t
          ),
        }));
      },

      updateTemplateBlock: (templateId, blockId, updates) => {
        const template = get().templates.find((candidate) => candidate.id === templateId);
        const block = template?.blocks.find((candidate) => candidate.id === blockId);
        if (!block || !isValidBlock({ ...block, ...updates })) return;
        set((state) => ({
          templates: state.templates.map((t) =>
            t.id === templateId
              ? {
                  ...t,
                  blocks: t.blocks.map((b) =>
                    b.id === blockId ? { ...b, ...updates } : b
                  ),
                  updatedAt: new Date().toISOString(),
                }
              : t
          ),
        }));
      },

      removeTemplateBlock: (templateId, blockId) =>
        set((state) => ({
          templates: state.templates.map((t) =>
            t.id === templateId
              ? {
                  ...t,
                  blocks: t.blocks.filter((b) => b.id !== blockId),
                  updatedAt: new Date().toISOString(),
                }
              : t
          ),
        })),

      copyDayBlocks: (templateId, fromDay, toDays) => {
        const targets = Array.from(new Set(toDays)).filter(
          (day) => Number.isInteger(day) && day >= 0 && day <= 6 && day !== fromDay
        );
        if (targets.length === 0) return;
        set((state) => ({
          templates: state.templates.map((t) => {
            if (t.id !== templateId) return t;
            const source = t.blocks.filter((b) => b.dayOfWeek === fromDay);
            const kept = t.blocks.filter((b) => !targets.includes(b.dayOfWeek));
            const copies = targets.flatMap((day) =>
              source.map((b) => ({
                ...b,
                id: generateId(),
                dayOfWeek: day as TemplateBlock['dayOfWeek'],
              }))
            );
            return { ...t, blocks: [...kept, ...copies], updatedAt: new Date().toISOString() };
          }),
        }));
      },

      clearDay: (templateId, dayOfWeek) =>
        set((state) => ({
          templates: state.templates.map((t) =>
            t.id === templateId
              ? {
                  ...t,
                  blocks: t.blocks.filter((b) => b.dayOfWeek !== dayOfWeek),
                  updatedAt: new Date().toISOString(),
                }
              : t
          ),
        })),

      getActiveTemplate: () => {
        return get().templates.find((t) => t.id === get().activeTemplateId);
      },

      getBlocksForDay: (dayOfWeek) => {
        const template = get().getActiveTemplate();
        if (!template) return [];
        return template.blocks
          .filter((b) => b.dayOfWeek === dayOfWeek)
          .sort((a, b) => a.startTime.localeCompare(b.startTime));
      },

      getTodayBlocks: () => {
        const today = new Date().getDay();
        const dayOfWeek = today === 0 ? 6 : today - 1;
        return get().getBlocksForDay(dayOfWeek);
      },

      initializeDefaults: (lifeBlockIds) =>
        set((state) => {
          if (state.templates.length > 0) return state;
          const workBlockId = lifeBlockIds[0];
          const sportBlockId = lifeBlockIds[1];
          const lunchBlockId = lifeBlockIds[2];
          const templateId = generateId();
          const defaultBlocks: TemplateBlock[] = [
            ...[0, 1, 2, 3, 4].map((d) => ({
              id: generateId(),
              lifeBlockId: workBlockId,
              dayOfWeek: d as 0 | 1 | 2 | 3 | 4 | 5 | 6,
              startTime: '09:00',
              endTime: '12:00',
              title: 'Deep Work',
              isFlexible: false,
            })),
            ...[0, 1, 2, 3, 4].map((d) => ({
              id: generateId(),
              lifeBlockId: lunchBlockId,
              dayOfWeek: d as 0 | 1 | 2 | 3 | 4 | 5 | 6,
              startTime: '12:00',
              endTime: '13:00',
              title: 'Déjeuner',
              isFlexible: true,
            })),
            ...[0, 1, 2, 3, 4].map((d) => ({
              id: generateId(),
              lifeBlockId: workBlockId,
              dayOfWeek: d as 0 | 1 | 2 | 3 | 4 | 5 | 6,
              startTime: '14:00',
              endTime: '18:00',
              title: 'Work',
              isFlexible: false,
            })),
            ...[0, 2, 4].map((d) => ({
              id: generateId(),
              lifeBlockId: sportBlockId,
              dayOfWeek: d as 0 | 1 | 2 | 3 | 4 | 5 | 6,
              startTime: '19:00',
              endTime: '20:00',
              title: 'Sport',
              isFlexible: true,
            })),
          ];
          const newTemplate: WeeklyTemplate = {
            id: templateId,
            name: 'Semaine normale',
            isActive: true,
            blocks: defaultBlocks,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          return {
            templates: [newTemplate],
            activeTemplateId: templateId,
          };
        }),
    }),
    persistOptions<TemplateState>('flowday-templates', { version: 1 })
  )
);
