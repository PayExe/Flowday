export interface DayScore {
  date: string;
  fidelity: number;
  blocksTracked: number;
}

export interface WeekScore {
  startDate: string;
  endDate: string;
  averageDayScore: number;
  previousWeekAverage: number | null;
  dayScores: DayScore[];
}
