import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  dateKey,
  parseDateKey,
  relativeDay,
  shiftDateKey,
  weekDayIndex,
} from '../src/utils/dates';
import { useTaskStore } from '../src/features/tasks/store';
import { useDayScoreStore } from '../src/features/dayScore/store';

vi.mock('@react-native-async-storage/async-storage', () => ({
  default: {
    getItem: vi.fn().mockResolvedValue(null),
    setItem: vi.fn().mockResolvedValue(undefined),
    removeItem: vi.fn().mockResolvedValue(undefined),
  },
}));

describe('date keys', () => {
  it('parses a key back to the same local day', () => {
    const parsed = parseDateKey('2026-03-08');
    expect(dateKey(parsed)).toBe('2026-03-08');
    expect(parsed.getHours()).toBe(0);
  });

  it('keeps the Monday-first weekday of a parsed key', () => {
    // 2026-03-08 is a Sunday, 2026-03-09 a Monday.
    expect(weekDayIndex(parseDateKey('2026-03-08'))).toBe(6);
    expect(weekDayIndex(parseDateKey('2026-03-09'))).toBe(0);
  });

  it('shifts across month and year boundaries', () => {
    expect(shiftDateKey('2026-01-31', 1)).toBe('2026-02-01');
    expect(shiftDateKey('2026-01-01', -1)).toBe('2025-12-31');
    expect(shiftDateKey('2026-02-28', 1)).toBe('2026-03-01');
  });

  it('names only the three days around today', () => {
    expect(relativeDay('2026-05-10', '2026-05-10')).toBe('today');
    expect(relativeDay('2026-05-11', '2026-05-10')).toBe('tomorrow');
    expect(relativeDay('2026-05-09', '2026-05-10')).toBe('yesterday');
    expect(relativeDay('2026-05-12', '2026-05-10')).toBeNull();
  });
});

describe('tasks per day', () => {
  beforeEach(() => {
    useTaskStore.setState({ tasks: [] });
    useDayScoreStore.setState({ scores: [], currentDayScore: null, pomodoroGoal: 6 });
  });

  const addTask = (title: string, scheduledDate?: string, lifeBlockId?: string) =>
    useTaskStore.getState().addTask({
      title,
      completed: false,
      priority: 'medium',
      scheduledDate,
      lifeBlockId,
    });

  it('reads a future day without mixing in today', () => {
    const today = dateKey();
    const tomorrow = shiftDateKey(today, 1);
    addTask('today task', today);
    addTask('tomorrow task', tomorrow);

    const { getTasksForDate } = useTaskStore.getState();
    expect(getTasksForDate(today).map((task) => task.title)).toEqual(['today task']);
    expect(getTasksForDate(tomorrow).map((task) => task.title)).toEqual(['tomorrow task']);
  });

  it('keeps an undated task on today only', () => {
    const today = dateKey();
    addTask('floating');

    const { getTasksForDate } = useTaskStore.getState();
    expect(getTasksForDate(today)).toHaveLength(1);
    expect(getTasksForDate(shiftDateKey(today, 1))).toHaveLength(0);
  });

  it('filters a day by life block', () => {
    const tomorrow = shiftDateKey(dateKey(), 1);
    addTask('work', tomorrow, 'block-work');
    addTask('sport', tomorrow, 'block-sport');

    const tasks = useTaskStore.getState().getTasksForDateByLifeBlock(tomorrow, 'block-work');
    expect(tasks.map((task) => task.title)).toEqual(['work']);
  });

  it('surfaces past unfinished tasks and lets them be replanned', () => {
    const today = dateKey();
    const yesterday = shiftDateKey(today, -1);
    addTask('forgotten', yesterday);

    const store = useTaskStore.getState();
    expect(store.getOverdueTasks().map((task) => task.title)).toEqual(['forgotten']);

    const task = store.getOverdueTasks()[0];
    store.rescheduleTask(task.id, today);

    expect(useTaskStore.getState().getOverdueTasks()).toHaveLength(0);
    expect(useTaskStore.getState().getTasksForDate(today)).toHaveLength(1);
  });

  it('leaves a completed past task out of the overdue list', () => {
    const yesterday = shiftDateKey(dateKey(), -1);
    addTask('done late', yesterday);
    const task = useTaskStore.getState().tasks[0];
    useTaskStore.getState().toggleTask(task.id);

    expect(useTaskStore.getState().getOverdueTasks()).toHaveLength(0);
  });
});
