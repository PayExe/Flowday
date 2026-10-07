export interface DayScore {
  date: string;
  total: number;
  blocksPercent: number;
  tasksPercent: number;
  pomodorosPercent: number;
  ritualsPercent: number;
  pomodorosCompleted: number;
  pomodorosGoal: number;
  morningRitualDone: boolean;
  eveningWrapDone: boolean;
  /** Planned blocks that have tasks to judge them by; 0 means nothing to score. */
  blocksTracked?: number;
  /** Tasks scheduled that day; 0 means nothing to score. */
  tasksTotal?: number;
}

export interface WeekScore {
  startDate: string;
  endDate: string;
  averageDayScore: number;
  previousWeekAverage: number | null;
  dayScores: DayScore[];
}
