import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { v4 as uuidv4 } from 'uuid';
import { LifeBlock, LifeBlockColor } from '../../types/lifeBlock';

interface LifeBlocksState {
  blocks: LifeBlock[];
  addBlock: (data: Omit<LifeBlock, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateBlock: (id: string, updates: Partial<Omit<LifeBlock, 'id' | 'createdAt'>>) => void;
  archiveBlock: (id: string) => void;
  unarchiveBlock: (id: string) => void;
  reorderBlock: (id: string, direction: 'up' | 'down') => void;
  getActiveBlocks: () => LifeBlock[];
  getBlockById: (id: string) => LifeBlock | undefined;
}

export const useLifeBlocksStore = create<LifeBlocksState>()(
  persist(
    (set, get) => ({
      blocks: [],

      addBlock: (data) =>
        set((state) => {
          const maxOrder = state.blocks.reduce((max, b) => Math.max(max, b.order), -1);
          return {
            blocks: [
              ...state.blocks,
              {
                ...data,
                id: uuidv4(),
                order: maxOrder + 1,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              },
            ],
          };
        }),

      updateBlock: (id, updates) =>
        set((state) => ({
          blocks: state.blocks.map((b) =>
            b.id === id ? { ...b, ...updates, updatedAt: new Date().toISOString() } : b
          ),
        })),

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
    }),
    {
      name: 'flowday-lifeblocks',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
