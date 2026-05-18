import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Task } from '../../types/task';

interface TaskState {
  tasks: Task[];
  addTask: (task: Omit<Task, 'id' | 'createdAt'>) => void;
  toggleTask: (id: string) => void;
  deleteTask: (id: string) => void;
  updateTask: (id: string, updates: Partial<Omit<Task, 'id' | 'createdAt'>>) => void;
  getTodayTasks: () => Task[];
  getTasksByProject: (projectId: string) => Task[];
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
              id: Date.now().toString(),
              createdAt: new Date().toISOString(),
            },
          ],
        })),

      toggleTask: (id) =>
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === id ? { ...task, completed: !task.completed } : task
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
        const today = new Date().toISOString().split('T')[0];
        return get().tasks.filter(
          (task) => !task.dueDate || task.dueDate.startsWith(today)
        );
      },

      getTasksByProject: (projectId) => {
        return get().tasks.filter((task) => task.projectId === projectId);
      },
    }),
    {
      name: 'flowday-tasks',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
