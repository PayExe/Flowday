import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { persistOptions } from '../../utils/persistence';
import { generateId } from '../../utils/id';
import { LifeBlock } from '../../types/lifeBlock';
import type { Language } from '../language/store';

interface LifeBlocksState {
  blocks: LifeBlock[];
  addBlock: (data: Omit<LifeBlock, 'id' | 'createdAt' | 'updatedAt' | 'order'>) => void;
  updateBlock: (id: string, updates: Partial<Omit<LifeBlock, 'id' | 'createdAt'>>) => void;
  archiveBlock: (id: string) => void;
  unarchiveBlock: (id: string) => void;
  reorderBlock: (id: string, direction: 'up' | 'down') => void;
  getActiveBlocks: () => LifeBlock[];
  getBlockById: (id: string) => LifeBlock | undefined;
  initializeDefaults: () => void;
  localizeDefaults: (language: Language) => void;
}

/** Names of the starter blocks per language, used until the user renames them. */
const DEFAULT_BLOCK_NAMES: Record<string, Record<Language, string>> = {
  'default-work': { fr: 'Travail', en: 'Work' },
  'default-sport': { fr: 'Sport', en: 'Sport' },
  'default-health': { fr: 'Santé', en: 'Health' },
  'default-learning': { fr: 'Apprentissage', en: 'Learning' },
  'default-recharge': { fr: 'Recharge', en: 'Recharge' },
};

const DEFAULT_BLOCKS: LifeBlock[] = [
  { id: 'default-work', name: 'Work', emoji: '💻', color: '#0A84FF', isArchived: false, weeklyGoalMinutes: 35 * 60, order: 0, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'default-sport', name: 'Sport', emoji: '🏃', color: '#30D158', isArchived: false, weeklyGoalMinutes: 5 * 60, order: 1, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'default-health', name: 'Health', emoji: '🍳', color: '#FF9F0A', isArchived: false, weeklyGoalMinutes: 3 * 60, order: 2, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'default-learning', name: 'Learning', emoji: '📚', color: '#BF5AF2', isArchived: false, weeklyGoalMinutes: 3 * 60, order: 3, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'default-recharge', name: 'Recharge', emoji: '🧘', color: '#8E8E93', isArchived: false, weeklyGoalMinutes: 4 * 60, order: 4, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
];

export const useLifeBlocksStore = create<LifeBlocksState>()(
  persist(
    (set, get) => ({
      blocks: [],

      addBlock: (data) => {
        if (!Number.isFinite(data.weeklyGoalMinutes) || data.weeklyGoalMinutes < 0) return;
        set((state) => {
          const maxOrder = state.blocks.reduce((max, b) => Math.max(max, b.order), -1);
          return {
            blocks: [
              ...state.blocks,
              {
                ...data,
                id: generateId(),
                order: maxOrder + 1,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              },
            ],
          };
        });
      },

      updateBlock: (id, updates) => {
        if (updates.weeklyGoalMinutes !== undefined &&
            (!Number.isFinite(updates.weeklyGoalMinutes) || updates.weeklyGoalMinutes < 0)) return;
        set((state) => ({
          blocks: state.blocks.map((b) =>
            b.id === id ? { ...b, ...updates, updatedAt: new Date().toISOString() } : b
          ),
        }));
      },

      archiveBlock: (id) =>
        set((state) => ({
          blocks: state.blocks.map((b) =>
            b.id === id ? { ...b, isArchived: true, updatedAt: new Date().toISOString() } : b
          ),
        })),

      unarchiveBlock: (id) =>
        set((state) => ({
          blocks: state.blocks.map((b) =>
            b.id === id ? { ...b, isArchived: false, updatedAt: new Date().toISOString() } : b
          ),
        })),

      reorderBlock: (id, direction) =>
        set((state) => {
          const activeBlocks = state.blocks.filter((b) => !b.isArchived).sort((a, b) => a.order - b.order);
          const index = activeBlocks.findIndex((b) => b.id === id);
          if (index === -1) return state;

          const newIndex = direction === 'up' ? index - 1 : index + 1;
          if (newIndex < 0 || newIndex >= activeBlocks.length) return state;

          const newBlocks = [...activeBlocks];
          [newBlocks[index], newBlocks[newIndex]] = [newBlocks[newIndex], newBlocks[index]];

          const reordered = newBlocks.map((b, i) => ({ ...b, order: i }));
          const archived = state.blocks.filter((b) => b.isArchived);

          return { blocks: [...reordered, ...archived] };
        }),

      getActiveBlocks: () => {
        return get().blocks
          .filter((b) => !b.isArchived)
          .sort((a, b) => a.order - b.order);
      },

      getBlockById: (id) => {
        return get().blocks.find((b) => b.id === id);
      },

      initializeDefaults: () =>
        set((state) => {
          if (state.blocks.length === 0) {
            return { blocks: DEFAULT_BLOCKS };
          }
          return state;
        }),

      localizeDefaults: (language) =>
        set((state) => {
          let changed = false;
          const blocks = state.blocks.map((block) => {
            const names = DEFAULT_BLOCK_NAMES[block.id];
            // A name the user typed is theirs; only untouched starter names follow the language.
            if (!names || !Object.values(names).includes(block.name) || block.name === names[language]) {
              return block;
            }
            changed = true;
            return { ...block, name: names[language] };
          });
          return changed ? { blocks } : state;
        }),
    }),
    persistOptions<LifeBlocksState>('flowday-lifeblocks', { version: 1 })
  )
);
