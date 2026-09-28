import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useFocusStore } from '../src/features/focus/store';

vi.mock('@react-native-async-storage/async-storage', () => ({
  default: {
    getItem: vi.fn().mockResolvedValue(null),
    setItem: vi.fn().mockResolvedValue(undefined),
    removeItem: vi.fn().mockResolvedValue(undefined),
  },
}));

describe('focus action', () => {
  beforeEach(() => {
    useFocusStore.setState({
      sessions: [],
      focusState: {
        isActive: false,
        timeRemaining: 1500,
        isBreak: false,
        sessionPomodoroCount: 0,
        dailyPomodoroCount: 0,
        dailyPomodoroGoal: 6,
      },
    });
  });

  it('starts Focus for the selected task', () => {
    const task = { id: 'task-42', title: 'Préparer la présentation' };

    useFocusStore.getState().startFocus(task.id, task.title);

    expect(useFocusStore.getState().focusState).toMatchObject({
      isActive: true,
      currentTaskId: task.id,
      currentTaskTitle: task.title,
      timeRemaining: 1500,
      isBreak: false,
    });
    expect(useFocusStore.getState().sessions).toHaveLength(1);
    expect(useFocusStore.getState().sessions[0]).toMatchObject({
      taskId: task.id,
      taskTitle: task.title,
      pomodorosCompleted: 0,
    });
  });
});
