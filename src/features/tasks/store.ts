import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { generateId } from '../../utils/id';
import { Task } from '../../types/task';
import { dateKey } from '../../utils/dates';
import { useDayScoreStore } from '../dayScore/store';

interface TaskState {
  tasks: Task[];
  addTask: (task: Omit<Task, 'id' | 'createdAt'>) => void;
  toggleTask: (id: string) => void;
  deleteTask: (id: string) => void;
  updateTask: (id: string, updates: Partial<Omit<Task, 'id' | 'createdAt'>>) => void;
  getTodayTasks: () => Task[];
  getTodayTasksByLifeBlock: (lifeBlockId: string) => Task[];
  getIncompleteTodayTasks: () => Task[];
  getTasksByLifeBlock: (lifeBlockId: string) => Task[];
  getOverdueTasks: () => Task[];
  rescheduleTask: (id: string, newDate: string) => void;
}

export const useTaskStore = create<TaskState>()(
  persist(
    (set, get) => ({
      tasks: [],

      addTask: (taskData) =>
        set((state) => ({
          tasks: [
            ...state.tasks,
            {
              ...taskData,
              id: generateId(),
              createdAt: new Date().toISOString(),
            },
          ],
        })),

      toggleTask: (id) => {
        const task = get().tasks.find((candidate) => candidate.id === id);
        if (task) get().updateTask(id, { completed: !task.completed });
      },

      deleteTask: (id) =>
        set((state) => ({
          tasks: state.tasks.filter((task) => task.id !== id),
        })),

      updateTask: (id, updates) => {
        const task = get().tasks.find((candidate) => candidate.id === id);
        if (!task) return;

        const completionChanged =
          typeof updates.completed === 'boolean' && updates.completed !== task.completed;
        const nextTasks = get().tasks.map((candidate) => {
          if (candidate.id !== id) return candidate;

          return completionChanged
            ? {
                ...candidate,
                ...updates,
                completedAt: updates.completed ? new Date().toISOString() : undefined,
              }
            : { ...candidate, ...updates };
        });

        set({ tasks: nextTasks });

        if (completionChanged) {
          const date = task.scheduledDate || dateKey();
          const dateTasks = nextTasks.filter(
            (candidate) => (candidate.scheduledDate || dateKey()) === date
          );
          useDayScoreStore.getState().updateTasksPercent(
            date,
            dateTasks.filter((candidate) => candidate.completed).length,
            dateTasks.length
          );
        }
      },

      getTodayTasks: () => {
        const today = dateKey();
        return get().tasks.filter(
          (task) => !task.scheduledDate || task.scheduledDate === today
        );
      },

      getTodayTasksByLifeBlock: (lifeBlockId) => {
        const today = dateKey();
        return get().tasks.filter(
          (task) =>
            task.lifeBlockId === lifeBlockId &&
            (!task.scheduledDate || task.scheduledDate === today)
        );
      },

      getIncompleteTodayTasks: () => {
        return get().getTodayTasks().filter((t) => !t.completed);
      },

      getTasksByLifeBlock: (lifeBlockId) => {
        return get().tasks.filter((task) => task.lifeBlockId === lifeBlockId);
      },

      getOverdueTasks: () => {
        const today = dateKey();
        return get().tasks.filter(
          (task) =>
            !task.completed &&
            task.scheduledDate &&
            task.scheduledDate < today
        );
      },

      rescheduleTask: (id, newDate) =>
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === id ? { ...task, scheduledDate: newDate } : task
          ),
        })),
    }),
    {
      name: 'flowday-tasks',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
