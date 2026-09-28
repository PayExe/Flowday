import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useFocusStore } from '../src/features/focus/store';

vi.mock('@react-native-async-storage/async-storage', () => ({
  default: {
    getItem: vi.fn().mockResolvedValue(null),
    setItem: vi.fn().mockResolvedValue(undefined),
    removeItem: vi.fn().mockResolvedValue(undefined),
  },
}));

const emptyFocusState = {
  isActive: false,
  timeRemaining: 1500,
  isBreak: false,
  sessionPomodoroCount: 0,
  dailyPomodoroCount: 0,
  dailyPomodoroGoal: 6,
};

describe('pomodoro transitions', () => {
  beforeEach(() => {
    useFocusStore.setState({ sessions: [], focusState: { ...emptyFocusState } });
  });

  it('moves from focus to an active break and then back to focus', () => {
    useFocusStore.getState().startFocus('task-1', 'Focus');
    useFocusStore.setState((state) => ({ focusState: { ...state.focusState, timeRemaining: 1 } }));
    useFocusStore.getState().tick();
    expect(useFocusStore.getState().focusState).toMatchObject({ isBreak: true, isActive: true, timeRemaining: 300 });
    useFocusStore.setState((state) => ({ focusState: { ...state.focusState, timeRemaining: 1 } }));
    useFocusStore.getState().tick();
    expect(useFocusStore.getState().focusState).toMatchObject({ isBreak: false, isActive: true, timeRemaining: 1500 });
  });

  it('pauses and resumes without losing the remaining time', () => {
    useFocusStore.getState().startFocus('task-1', 'Focus');
    useFocusStore.setState((state) => ({ focusState: { ...state.focusState, timeRemaining: 42 } }));
    useFocusStore.getState().pauseFocus();
    expect(useFocusStore.getState().focusState).toMatchObject({ isActive: false, timeRemaining: 42 });
    useFocusStore.getState().resumeFocus();
    expect(useFocusStore.getState().focusState.isActive).toBe(true);
  });
});
