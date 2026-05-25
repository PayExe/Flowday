import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { generateId } from '../../utils/id';
import { useDayScoreStore } from '../../features/dayScore/store';
import { FocusSession, FocusState } from '../../types/focus';

const POMODORO_MINUTES = 25;
const BREAK_MINUTES = 5;

function todayISO(): string {
  return new Date().toISOString().split('T')[0];
}

interface FocusStoreState {
  sessions: FocusSession[];
  focusState: FocusState;
  startFocus: (taskId: string, taskTitle: string) => void;
  pauseFocus: () => void;
  resumeFocus: () => void;
  stopFocus: () => void;
  abandonPomodoro: () => void;
  tick: () => void;
  setDailyGoal: (goal: number) => void;
  getTodaySessions: () => FocusSession[];
  getTodayPomodoroCount: () => number;
}

export const useFocusStore = create<FocusStoreState>()(
  persist(
    (set, get) => ({
      sessions: [],
      focusState: {
        isActive: false,
        timeRemaining: POMODORO_MINUTES * 60,
        isBreak: false,
        sessionPomodoroCount: 0,
        dailyPomodoroCount: 0,
        dailyPomodoroGoal: 6,
      },

      startFocus: (taskId, taskTitle) =>
        set((state) => ({
          focusState: {
            ...state.focusState,
            isActive: true,
            currentTaskId: taskId,
            currentTaskTitle: taskTitle,
            timeRemaining: POMODORO_MINUTES * 60,
            isBreak: false,
            sessionPomodoroCount: 0,
          },
          sessions: [
            ...state.sessions,
            {
              id: generateId(),
              taskId,
              taskTitle,
              startedAt: new Date().toISOString(),
              pomodorosCompleted: 0,
              pomodorosAbandoned: 0,
              totalFocusMinutes: 0,
            },
          ],
        })),

      pauseFocus: () =>
        set((state) => ({
          focusState: { ...state.focusState, isActive: false },
        })),

      resumeFocus: () =>
        set((state) => ({
          focusState: { ...state.focusState, isActive: true },
        })),

      stopFocus: () =>
        set((state) => {
          const currentSession = state.sessions[state.sessions.length - 1];
          if (currentSession && !currentSession.endedAt) {
            const endedAt = new Date().toISOString();
            const duration =
              (new Date(endedAt).getTime() -
                new Date(currentSession.startedAt).getTime()) /
              60000;
            const updatedSessions = [...state.sessions];
            updatedSessions[updatedSessions.length - 1] = {
              ...currentSession,
              endedAt,
              totalFocusMinutes: Math.round(duration),
            };
            return {
              sessions: updatedSessions,
              focusState: {
                ...state.focusState,
                isActive: false,
                currentTaskId: undefined,
                currentTaskTitle: undefined,
                timeRemaining: POMODORO_MINUTES * 60,
                isBreak: false,
                sessionPomodoroCount: 0,
              },
            };
          }
          return {
            focusState: {
              ...state.focusState,
              isActive: false,
              currentTaskId: undefined,
              currentTaskTitle: undefined,
              timeRemaining: POMODORO_MINUTES * 60,
              isBreak: false,
              sessionPomodoroCount: 0,
            },
          };
        }),

      abandonPomodoro: () =>
        set((state) => {
          const currentSession = state.sessions[state.sessions.length - 1];
          if (currentSession && !currentSession.endedAt) {
            const updatedSessions = [...state.sessions];
            updatedSessions[updatedSessions.length - 1] = {
              ...currentSession,
              pomodorosAbandoned: currentSession.pomodorosAbandoned + 1,
            };
            return {
              sessions: updatedSessions,
              focusState: {
                ...state.focusState,
                isBreak: true,
                timeRemaining: BREAK_MINUTES * 60,
              },
            };
          }
          return state;
        }),

      tick: () =>
        set((state) => {
          if (!state.focusState.isActive || state.focusState.timeRemaining <= 0) {
            return state;
          }
          const newTime = state.focusState.timeRemaining - 1;
          if (newTime === 0 && !state.focusState.isBreak) {
            const currentSession = state.sessions[state.sessions.length - 1];
            const updatedSessions = currentSession && !currentSession.endedAt
              ? state.sessions.map((s, i) =>
                  i === state.sessions.length - 1
                    ? { ...s, pomodorosCompleted: s.pomodorosCompleted + 1 }
                    : s
                )
              : state.sessions;
            useDayScoreStore.getState().incrementPomodoro(todayISO());
            return {
              sessions: updatedSessions,
              focusState: {
                ...state.focusState,
                timeRemaining: BREAK_MINUTES * 60,
                isBreak: true,
                sessionPomodoroCount: state.focusState.sessionPomodoroCount + 1,
                dailyPomodoroCount: state.focusState.dailyPomodoroCount + 1,
              },
            };
          }
          if (newTime === 0 && state.focusState.isBreak) {
            return {
              focusState: {
                ...state.focusState,
                timeRemaining: POMODORO_MINUTES * 60,
                isBreak: false,
              },
            };
          }
          return {
            focusState: {
              ...state.focusState,
              timeRemaining: newTime,
            },
          };
        }),

      setDailyGoal: (goal) =>
        set((state) => ({
          focusState: { ...state.focusState, dailyPomodoroGoal: goal },
        })),

      getTodaySessions: () => {
        const today = new Date().toISOString().split('T')[0];
        return get().sessions.filter((s) => s.startedAt.startsWith(today));
      },

      getTodayPomodoroCount: () => {
        return get()
          .getTodaySessions()
          .reduce((sum, s) => sum + s.pomodorosCompleted, 0);
      },
    }),
    {
      name: 'flowday-focus',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
