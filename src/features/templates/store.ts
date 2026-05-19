import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { generateId } from '../../utils/id';
import { WeeklyTemplate, TemplateBlock } from '../../types/template';

interface TemplateState {
  templates: WeeklyTemplate[];
  activeTemplateId: string | null;
  addTemplate: (name: string) => WeeklyTemplate;
  setActiveTemplate: (id: string) => void;
  addBlockToTemplate: (templateId: string, block: Omit<TemplateBlock, 'id'>) => void;
  updateTemplateBlock: (templateId: string, blockId: string, updates: Partial<TemplateBlock>) => void;
  removeTemplateBlock: (templateId: string, blockId: string) => void;
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

      setActiveTemplate: (id) =>
        set((state) => ({
          templates: state.templates.map((t) => ({
            ...t,
            isActive: t.id === id,
          })),
          activeTemplateId: id,
        })),

      addBlockToTemplate: (templateId, block) =>
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
        })),

      updateTemplateBlock: (templateId, blockId, updates) =>
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
        })),

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
        // JS getDay(): 0=dimanche, 1=lundi... on veut 0=lundi
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
            // Lundi-Vendredi : Work 9h-12h
            ...[0, 1, 2, 3, 4].map((d) => ({
              id: generateId(),
              lifeBlockId: workBlockId,
              dayOfWeek: d as 0 | 1 | 2 | 3 | 4 | 5 | 6,
              startTime: '09:00',
              endTime: '12:00',
              title: 'Deep Work',
              isFlexible: false,
            })),
            // Lundi-Vendredi : Lunch 12h-13h
            ...[0, 1, 2, 3, 4].map((d) => ({
              id: generateId(),
              lifeBlockId: lunchBlockId,
              dayOfWeek: d as 0 | 1 | 2 | 3 | 4 | 5 | 6,
              startTime: '12:00',
              endTime: '13:00',
              title: 'Déjeuner',
              isFlexible: true,
            })),
            // Lundi-Vendredi : Work 14h-18h
            ...[0, 1, 2, 3, 4].map((d) => ({
              id: generateId(),
              lifeBlockId: workBlockId,
              dayOfWeek: d as 0 | 1 | 2 | 3 | 4 | 5 | 6,
              startTime: '14:00',
              endTime: '18:00',
              title: 'Work',
              isFlexible: false,
            })),
            // Lundi, Mercredi, Vendredi : Sport 19h-20h
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
    {
      name: 'flowday-templates',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
