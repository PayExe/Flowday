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
  blocksTracked?: number;
  tasksTotal?: number;
}

export interface WeekScore {
  startDate: string;
  endDate: string;
  averageDayScore: number;
  previousWeekAverage: number | null;
  dayScores: DayScore[];
}
