import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { generateId } from '../../utils/id';
import { Task } from '../../types/task';
import { dateKey } from '../../utils/dates';

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

      toggleTask: (id) =>
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === id
              ? {
                  ...task,
                  completed: !task.completed,
                  completedAt: !task.completed ? new Date().toISOString() : undefined,
                }
              : task
          ),
        })),

      deleteTask: (id) =>
        set((state) => ({
          tasks: state.tasks.filter((task) => task.id !== id),
        })),

      updateTask: (id, updates) =>
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === id ? { ...task, ...updates } : task
          ),
        })),

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
