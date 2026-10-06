import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { generateId } from '../../utils/id';
import { useDayScoreStore } from '../../features/dayScore/store';
import { FocusSession, FocusState } from '../../types/focus';
import { dateKey } from '../../utils/dates';

const POMODORO_MINUTES = 25;
const BREAK_MINUTES = 5;

export const POMODORO_SECONDS = POMODORO_MINUTES * 60;
export const BREAK_SECONDS = BREAK_MINUTES * 60;

function todayISO(): string {
  return dateKey();
}

interface FocusStoreState {
  sessions: FocusSession[];
  focusState: FocusState;
  startFocus: (taskId: string, taskTitle: string) => boolean;
  pauseFocus: () => void;
  resumeFocus: () => void;
  stopFocus: () => void;
  abandonPomodoro: () => void;
  tick: () => void;
  syncTimer: (now?: number) => void;
  resetDailyCountIfNeeded: () => void;
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
        focusElapsedSeconds: 0,
      },

      startFocus: (taskId, taskTitle) => {
        if (!taskId.trim() || !taskTitle.trim()) return false;
        const state = get();
        if (state.focusState.currentTaskId || state.sessions.some((session) => !session.endedAt)) {
          return false;
        }

        set((current) => {
          const today = todayISO();
          const resetCount = current.focusState.lastResetDate !== today
            ? 0
            : current.focusState.dailyPomodoroCount;
          return {
            focusState: {
              ...current.focusState,
              isActive: true,
              currentTaskId: taskId,
              currentTaskTitle: taskTitle,
              timeRemaining: POMODORO_MINUTES * 60,
              isBreak: false,
              sessionPomodoroCount: 0,
              dailyPomodoroCount: resetCount,
              lastResetDate: today,
              lastTickAt: Date.now(),
              focusElapsedSeconds: 0,
            },
            sessions: [
              ...current.sessions,
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
          };
        });
        return true;
      },

      pauseFocus: () => {
        get().syncTimer();
        set((state) => ({
          focusState: { ...state.focusState, isActive: false, lastTickAt: undefined },
        }));
      },

      resumeFocus: () =>
        set((state) => ({
          focusState: { ...state.focusState, isActive: true, lastTickAt: Date.now() },
        })),

      stopFocus: () => {
        get().syncTimer();
        set((state) => {
          const currentSession = state.sessions[state.sessions.length - 1];
          const baseFocusState = {
            ...state.focusState,
            isActive: false,
            currentTaskId: undefined,
            currentTaskTitle: undefined,
            timeRemaining: POMODORO_MINUTES * 60,
            isBreak: false,
            sessionPomodoroCount: 0,
            lastTickAt: undefined,
            focusElapsedSeconds: 0,
          };

          if (!currentSession || currentSession.endedAt) {
            return { focusState: baseFocusState };
          }

          const endedAt = new Date().toISOString();
          const sessions = [...state.sessions];
          sessions[sessions.length - 1] = {
            ...currentSession,
            endedAt,
            totalFocusMinutes: Math.round((state.focusState.focusElapsedSeconds ?? 0) / 60),
          };
          return { sessions, focusState: baseFocusState };
        });
      },

      abandonPomodoro: () =>
        set((state) => {
          const currentSession = state.sessions[state.sessions.length - 1];
          if (!currentSession || currentSession.endedAt) return state;
          const sessions = [...state.sessions];
          sessions[sessions.length - 1] = {
            ...currentSession,
            pomodorosAbandoned: currentSession.pomodorosAbandoned + 1,
          };
          return {
            sessions,
            focusState: { ...state.focusState, isActive: false, lastTickAt: undefined },
          };
        }),

      tick: () => get().syncTimer(),

      resetDailyCountIfNeeded: () =>
        set((state) => {
          const today = todayISO();
          if (state.focusState.lastResetDate === today) return state;
          return {
            focusState: {
              ...state.focusState,
              dailyPomodoroCount: 0,
              lastResetDate: today,
            },
          };
        }),

      syncTimer: (now = Date.now()) =>
        set((state) => {
          const { focusState } = state;
          if (!focusState.isActive) return state;
          if (focusState.lastTickAt === undefined) {
            return {
              focusState: {
                ...focusState,
                lastTickAt: now,
                focusElapsedSeconds: focusState.focusElapsedSeconds ?? 0,
              },
            };
          }

          let elapsed = Math.max(0, Math.floor((now - focusState.lastTickAt) / 1000));
          if (elapsed === 0) return { focusState: { ...focusState, lastTickAt: now } };
          let elapsedAt = focusState.lastTickAt;

          let timeRemaining = focusState.timeRemaining;
          let isBreak = focusState.isBreak;
          let sessionPomodoroCount = focusState.sessionPomodoroCount;
          let dailyPomodoroCount = focusState.dailyPomodoroCount;
          let focusElapsedSeconds = focusState.focusElapsedSeconds ?? 0;
          let sessions = state.sessions;

          while (elapsed > 0) {
            const consumed = Math.min(elapsed, timeRemaining);
            if (!isBreak) focusElapsedSeconds += consumed;
            timeRemaining -= consumed;
            elapsed -= consumed;
            elapsedAt += consumed * 1000;
            if (timeRemaining > 0) continue;

            if (isBreak) {
              timeRemaining = POMODORO_MINUTES * 60;
              isBreak = false;
              continue;
            }

            const completedDate = dateKey(new Date(elapsedAt));
            const currentSession = sessions[sessions.length - 1];
            if (currentSession && !currentSession.endedAt) {
              sessions = sessions.map((session, index) =>
                index === sessions.length - 1
                  ? {
                      ...session,
                      pomodorosCompleted: session.pomodorosCompleted + 1,
                      pomodoroCompletedDates: [...(session.pomodoroCompletedDates ?? []), completedDate],
                    }
                  : session
              );
            }
            useDayScoreStore.getState().incrementPomodoro(completedDate);
            sessionPomodoroCount += 1;
            dailyPomodoroCount += 1;
            timeRemaining = BREAK_MINUTES * 60;
            isBreak = true;
          }

          return {
            sessions,
            focusState: {
              ...focusState,
              timeRemaining,
              isBreak,
              sessionPomodoroCount,
              dailyPomodoroCount,
              focusElapsedSeconds,
              lastTickAt: now,
            },
          };
        }),

      getTodaySessions: () => {
        const today = dateKey();
        return get().sessions.filter((session) =>
          dateKey(new Date(session.startedAt)) === today
          || session.pomodoroCompletedDates?.includes(today)
        );
      },

      getTodayPomodoroCount: () => {
        const today = dateKey();
        return get().getTodaySessions().reduce((sum, session) => {
          if (session.pomodoroCompletedDates) {
            return sum + session.pomodoroCompletedDates.filter((date) => date === today).length;
          }
          return sum + session.pomodorosCompleted;
        }, 0);
      },
    }),
    {
      name: 'flowday-focus',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
