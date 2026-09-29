export interface FocusSession {
  id: string;
  taskId: string;
  taskTitle: string;
  startedAt: string;
  endedAt?: string;
  pomodorosCompleted: number;
  pomodoroCompletedDates?: string[];
  pomodorosAbandoned: number;
  totalFocusMinutes: number;
}

export interface FocusState {
  isActive: boolean;
  currentTaskId?: string;
  currentTaskTitle?: string;
  timeRemaining: number;
  isBreak: boolean;
  sessionPomodoroCount: number;
  dailyPomodoroCount: number;
  dailyPomodoroGoal: number;
  lastResetDate?: string;
  lastTickAt?: number;
  focusElapsedSeconds: number;
}
