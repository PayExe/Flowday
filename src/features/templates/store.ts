import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { v4 as uuidv4 } from 'uuid';
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
}

export const useTemplateStore = create<TemplateState>()(
  persist(
    (set, get) => ({
      templates: [],
      activeTemplateId: null,

      addTemplate: (name) => {
        const newTemplate: WeeklyTemplate = {
          id: uuidv4(),
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
                    { ...block, id: uuidv4() },
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
    }),
    {
      name: 'flowday-templates',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
