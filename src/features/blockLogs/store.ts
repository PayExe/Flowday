import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { persistOptions } from '../../utils/persistence';
import { BlockLog, BlockStatus } from '../../types/blockLog';

interface BlockLogState {
  logs: BlockLog[];
  /** Records (or replaces) the outcome of one slot on one day. */
  setStatus: (entry: Omit<BlockLog, 'updatedAt'>) => void;
  clearStatus: (date: string, templateBlockId: string) => void;
  getLog: (date: string, templateBlockId: string) => BlockLog | undefined;
  getLogsForDate: (date: string) => BlockLog[];
}

const STATUSES: readonly BlockStatus[] = ['done', 'partial', 'skipped'];

export const useBlockLogStore = create<BlockLogState>()(
  persist(
    (set, get) => ({
      logs: [],

      setStatus: (entry) => {
        if (!STATUSES.includes(entry.status)) return;
        if (!Number.isFinite(entry.plannedMinutes) || entry.plannedMinutes < 0) return;
        set((state) => ({
          logs: [
            ...state.logs.filter(
              (log) => !(log.date === entry.date && log.templateBlockId === entry.templateBlockId)
            ),
            { ...entry, updatedAt: new Date().toISOString() },
          ],
        }));
      },

      clearStatus: (date, templateBlockId) =>
        set((state) => ({
          logs: state.logs.filter((log) => !(log.date === date && log.templateBlockId === templateBlockId)),
        })),

      getLog: (date, templateBlockId) =>
        get().logs.find((log) => log.date === date && log.templateBlockId === templateBlockId),

      getLogsForDate: (date) => get().logs.filter((log) => log.date === date),
    }),
    persistOptions<BlockLogState>('flowday-blocklogs', { version: 1 })
  )
);
