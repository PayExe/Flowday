import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useFocusStore } from '../src/features/focus/store';
import { dateKey } from '../src/utils/dates';

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
  focusElapsedSeconds: 0,
};

describe('pomodoro transitions', () => {
  beforeEach(() => {
    useFocusStore.setState({ sessions: [], focusState: { ...emptyFocusState } });
  });

  it('moves from focus to an active break and then back to focus', () => {
    useFocusStore.getState().startFocus('task-1', 'Focus');
    useFocusStore.setState((state) => ({ focusState: { ...state.focusState, timeRemaining: 1, lastTickAt: Date.now() - 1000 } }));
    useFocusStore.getState().tick();
    expect(useFocusStore.getState().focusState).toMatchObject({ isBreak: true, isActive: true, timeRemaining: 300 });
    useFocusStore.setState((state) => ({ focusState: { ...state.focusState, timeRemaining: 1, lastTickAt: Date.now() - 1000 } }));
    useFocusStore.getState().tick();
    expect(useFocusStore.getState().focusState).toMatchObject({ isBreak: false, isActive: true, timeRemaining: 1500 });
  });

  it('pauses and resumes without losing the remaining time', () => {
    useFocusStore.getState().startFocus('task-1', 'Focus');
    useFocusStore.setState((state) => ({ focusState: { ...state.focusState, timeRemaining: 42, lastTickAt: Date.now() } }));
    useFocusStore.getState().pauseFocus();
    expect(useFocusStore.getState().focusState).toMatchObject({ isActive: false, timeRemaining: 42 });
    useFocusStore.getState().resumeFocus();
    expect(useFocusStore.getState().focusState.isActive).toBe(true);
  });

  it('catches up elapsed focus time after returning from the background', () => {
    useFocusStore.getState().startFocus('task-1', 'Focus');
    const backgroundedAt = useFocusStore.getState().focusState.lastTickAt!;

    useFocusStore.getState().syncTimer(backgroundedAt + 12_000);

    expect(useFocusStore.getState().focusState.focusElapsedSeconds).toBe(12);
    expect(useFocusStore.getState().focusState.timeRemaining).toBe(1488);
  });

  it('counts focus time but excludes pauses', () => {
    useFocusStore.getState().startFocus('task-1', 'Focus');
    const startedAt = useFocusStore.getState().focusState.lastTickAt!;

    useFocusStore.getState().syncTimer(startedAt + 10_000);
    useFocusStore.getState().pauseFocus();
    useFocusStore.getState().resumeFocus();
    const resumedAt = useFocusStore.getState().focusState.lastTickAt!;
    useFocusStore.getState().syncTimer(resumedAt + 5_000);
    expect(useFocusStore.getState().focusState.focusElapsedSeconds).toBe(15);
    useFocusStore.getState().stopFocus();

    expect(useFocusStore.getState().sessions[0].totalFocusMinutes).toBe(0);
  });

  it('keeps a Pomodoro completed after midnight in the completion day', () => {
    const today = dateKey();
    useFocusStore.setState({
      sessions: [{
        id: 'session-1',
        taskId: 'task-1',
        taskTitle: 'Focus',
        startedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        endedAt: new Date().toISOString(),
        pomodorosCompleted: 1,
        pomodoroCompletedDates: [today],
        pomodorosAbandoned: 0,
        totalFocusMinutes: 25,
      }],
    });

    expect(useFocusStore.getState().getTodaySessions()).toHaveLength(1);
    expect(useFocusStore.getState().getTodayPomodoroCount()).toBe(1);
  });

  it('resets the daily count when a new local day starts', () => {
    useFocusStore.setState((state) => ({
      focusState: { ...state.focusState, dailyPomodoroCount: 3, lastResetDate: '2026-01-01' },
    }));

    useFocusStore.getState().resetDailyCountIfNeeded();

    expect(useFocusStore.getState().focusState.dailyPomodoroCount).toBe(0);
    expect(useFocusStore.getState().focusState.lastResetDate).toBe(dateKey());
  });
});

describe('focus credited to a life block', () => {
  beforeEach(() => {
    useFocusStore.setState({ sessions: [], focusState: { ...emptyFocusState } });
  });

  it('takes the domain of the task it starts from', () => {
    useFocusStore.getState().startFocus('task-1', 'Focus', 'learning');
    expect(useFocusStore.getState().sessions[0].lifeBlockId).toBe('learning');

    useFocusStore.setState({ sessions: [], focusState: { ...emptyFocusState } });
    useFocusStore.getState().startFocus('task-2', 'Focus');
    expect(useFocusStore.getState().sessions[0]).not.toHaveProperty('lifeBlockId');
  });

  it('records focus seconds per day while the session runs, breaks excluded', () => {
    useFocusStore.getState().startFocus('task-1', 'Focus', 'learning');
    const startedAt = useFocusStore.getState().focusState.lastTickAt!;

    useFocusStore.getState().syncTimer(startedAt + (1500 + 300 + 60) * 1000);

    const session = useFocusStore.getState().sessions[0];
    const total = Object.values(session.focusSecondsByDate ?? {}).reduce((sum, seconds) => sum + seconds, 0);
    expect(total).toBe(1560);
    expect(Object.keys(session.focusSecondsByDate ?? {})).toContain(dateKey(new Date(startedAt)));
  });
});
