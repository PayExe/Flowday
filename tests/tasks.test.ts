import { beforeEach, describe, expect, it, vi } from 'vitest';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTaskStore } from '../src/features/tasks/store';

vi.mock('@react-native-async-storage/async-storage', () => ({
  default: {
    getItem: vi.fn().mockResolvedValue(null),
    setItem: vi.fn().mockResolvedValue(undefined),
    removeItem: vi.fn().mockResolvedValue(undefined),
  },
}));

describe('tasks', () => {
  beforeEach(() => useTaskStore.setState({ tasks: [] }));

  it('adds, toggles and filters today tasks', () => {
    useTaskStore.getState().addTask({ title: 'Focus', completed: false, priority: 'high' });
    const task = useTaskStore.getState().tasks[0];
    expect(useTaskStore.getState().getTodayTasks()).toHaveLength(1);
    useTaskStore.getState().toggleTask(task.id);
    expect(useTaskStore.getState().tasks[0].completed).toBe(true);
  });

  it('does not include tasks scheduled for another day', () => {
    useTaskStore.getState().addTask({ title: 'Tomorrow', completed: false, priority: 'low', scheduledDate: '2099-01-01' });
    expect(useTaskStore.getState().getTodayTasks()).toHaveLength(0);
    expect(useTaskStore.getState().getOverdueTasks()).toHaveLength(0);
  });

  it('persists task changes', async () => {
    const setItem = vi.mocked(AsyncStorage.setItem);
    setItem.mockClear();
    useTaskStore.getState().addTask({ title: 'Persisted', completed: false, priority: 'medium' });
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(setItem).toHaveBeenCalledWith('flowday-tasks', expect.any(String));
  });
});
