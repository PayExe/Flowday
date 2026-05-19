export interface DayScore {
  date: string; // YYYY-MM-DD
  total: number; // 0-100
  blocksPercent: number; // 0-100
  tasksPercent: number; // 0-100
  pomodorosPercent: number; // 0-100
  ritualsPercent: number; // 0-100
  pomodorosCompleted: number;
  pomodorosGoal: number;
  morningRitualDone: boolean;
  eveningWrapDone: boolean;
}

export interface WeekScore {
  startDate: string;
  endDate: string;
  averageDayScore: number;
  previousWeekAverage: number | null;
  dayScores: DayScore[];
}
