import { beforeEach, describe, expect, it, vi } from 'vitest';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTaskStore } from '../src/features/tasks/store';
import { useDayScoreStore } from '../src/features/dayScore/store';
import { dateKey } from '../src/utils/dates';

vi.mock('@react-native-async-storage/async-storage', () => ({
  default: {
    getItem: vi.fn().mockResolvedValue(null),
    setItem: vi.fn().mockResolvedValue(undefined),
    removeItem: vi.fn().mockResolvedValue(undefined),
  },
}));

describe('tasks', () => {
  beforeEach(() => {
    useTaskStore.setState({ tasks: [] });
    useDayScoreStore.setState({ scores: [], currentDayScore: null, pomodoroGoal: 6 });
  });

  it('adds, toggles and filters today tasks', () => {
    useTaskStore.getState().addTask({ title: 'Focus', completed: false, priority: 'high' });
    const task = useTaskStore.getState().tasks[0];
    expect(useTaskStore.getState().getTodayTasks()).toHaveLength(1);
    useTaskStore.getState().toggleTask(task.id);
    expect(useTaskStore.getState().tasks[0].completed).toBe(true);
  });

  it('keeps completedAt consistent when completion changes through updateTask', () => {
    useTaskStore.getState().addTask({ title: 'Focus', completed: false, priority: 'high' });
    const task = useTaskStore.getState().tasks[0];

    useTaskStore.getState().updateTask(task.id, { completed: true });
    expect(useTaskStore.getState().tasks[0].completedAt).toEqual(expect.any(String));

    useTaskStore.getState().updateTask(task.id, { completed: false });
    expect(useTaskStore.getState().tasks[0].completedAt).toBeUndefined();
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

  it('updates the day score after completing a scheduled task', () => {
    const today = dateKey();
    useTaskStore.getState().addTask({
      title: 'Score task',
      completed: false,
      priority: 'medium',
      scheduledDate: today,
    });
    const task = useTaskStore.getState().tasks[0];

    useDayScoreStore.getState().updateTasksPercent(today, 0, 1);
    useTaskStore.getState().toggleTask(task.id);

    expect(useDayScoreStore.getState().getScoreForDate(today)).toMatchObject({
      tasksPercent: 100,
      total: 30,
    });
  });

  it('resynchronizes task percentages when a task changes day', () => {
    const today = dateKey();
    const tomorrow = '2099-01-01';
    useTaskStore.getState().addTask({
      title: 'Move me',
      completed: true,
      priority: 'medium',
      scheduledDate: today,
    });
    const task = useTaskStore.getState().tasks[0];

    useTaskStore.getState().rescheduleTask(task.id, tomorrow);

    expect(useDayScoreStore.getState().getScoreForDate(today)).toMatchObject({ tasksPercent: 0 });
    expect(useDayScoreStore.getState().getScoreForDate(tomorrow)).toMatchObject({ tasksPercent: 100 });
  });
});
