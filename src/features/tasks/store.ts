import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { persistOptions } from '../../utils/persistence';
import { generateId } from '../../utils/id';
import { Task } from '../../types/task';
import { dateKey } from '../../utils/dates';
import { useDayScoreStore } from '../dayScore/store';

interface TaskState {
  tasks: Task[];
  addTask: (task: Omit<Task, 'id' | 'createdAt'>) => void;
  restoreTask: (task: Task) => void;
  toggleTask: (id: string) => void;
  deleteTask: (id: string) => void;
  updateTask: (id: string, updates: Partial<Omit<Task, 'id' | 'createdAt'>>) => void;
  getTasksForDate: (date: string) => Task[];
  getTasksForDateByLifeBlock: (date: string, lifeBlockId: string) => Task[];
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
        set((state) => {
          const tasks = [
            ...state.tasks,
            {
              ...taskData,
              id: generateId(),
              createdAt: new Date().toISOString(),
            },
          ];
          const date = taskData.scheduledDate || dateKey();
          const dateTasks = tasks.filter((task) => (task.scheduledDate || dateKey()) === date);
          useDayScoreStore.getState().updateTasksPercent(
            date,
            dateTasks.filter((task) => task.completed).length,
            dateTasks.length
          );
          return { tasks };
        }),

      restoreTask: (task) => {
        if (get().tasks.some((candidate) => candidate.id === task.id)) return;
        const tasks = [...get().tasks, task];
        const date = task.scheduledDate || dateKey();
        const dateTasks = tasks.filter((candidate) => (candidate.scheduledDate || dateKey()) === date);
        useDayScoreStore.getState().updateTasksPercent(
          date,
          dateTasks.filter((candidate) => candidate.completed).length,
          dateTasks.length
        );
        set({ tasks });
      },

      toggleTask: (id) => {
        const task = get().tasks.find((candidate) => candidate.id === id);
        if (task) get().updateTask(id, { completed: !task.completed });
      },

      deleteTask: (id) => {
        const task = get().tasks.find((candidate) => candidate.id === id);
        if (!task) return;
        const tasks = get().tasks.filter((candidate) => candidate.id !== id);
        const date = task.scheduledDate || dateKey();
        const dateTasks = tasks.filter((candidate) => (candidate.scheduledDate || dateKey()) === date);
        useDayScoreStore.getState().updateTasksPercent(
          date,
          dateTasks.filter((candidate) => candidate.completed).length,
          dateTasks.length
        );
        set({ tasks });
      },

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

      getTasksForDate: (date) => {
        const today = dateKey();
        return get().tasks.filter((task) => (task.scheduledDate || today) === date);
      },

      getTasksForDateByLifeBlock: (date, lifeBlockId) => {
        return get()
          .getTasksForDate(date)
          .filter((task) => task.lifeBlockId === lifeBlockId);
      },

      getTodayTasks: () => get().getTasksForDate(dateKey()),

      getTodayTasksByLifeBlock: (lifeBlockId) =>
        get().getTasksForDateByLifeBlock(dateKey(), lifeBlockId),

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

      rescheduleTask: (id, newDate) => {
        const task = get().tasks.find((candidate) => candidate.id === id);
        if (!task) return;
        const oldDate = task.scheduledDate || dateKey();
        const tasks = get().tasks.map((candidate) =>
          candidate.id === id ? { ...candidate, scheduledDate: newDate } : candidate
        );
        for (const date of new Set([oldDate, newDate])) {
          const dateTasks = tasks.filter((candidate) => (candidate.scheduledDate || dateKey()) === date);
          useDayScoreStore.getState().updateTasksPercent(
            date,
            dateTasks.filter((candidate) => candidate.completed).length,
            dateTasks.length
          );
        }
        set({ tasks });
      },
    }),
    persistOptions<TaskState>('flowday-tasks', { version: 1 })
  )
);
