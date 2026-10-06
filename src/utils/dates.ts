export function dateKey(date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function isValidTime(value: string): boolean {
  return /^(?:[01]\d|2[0-3]):[0-5]\d$/.test(value);
}

export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

export function calendarDayDifference(from: string, to: string): number {
  const [fromYear, fromMonth, fromDay] = from.split('-').map(Number);
  const [toYear, toMonth, toDay] = to.split('-').map(Number);
  const fromUtc = Date.UTC(fromYear, fromMonth - 1, fromDay);
  const toUtc = Date.UTC(toYear, toMonth - 1, toDay);
  return Math.round((toUtc - fromUtc) / 86400000);
}

export const WEEK_DAY_KEYS = [
  'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche',
] as const;

export const WEEK_DAY_SHORT_KEYS = [
  'dayMonShort', 'dayTueShort', 'dayWedShort', 'dayThuShort', 'dayFriShort', 'daySatShort', 'daySunShort',
] as const;

export const WORK_WEEK = [0, 1, 2, 3, 4];
export const WEEKEND = [5, 6];
export const WHOLE_WEEK = [0, 1, 2, 3, 4, 5, 6];

export function weekDayIndex(date = new Date()): number {
  const day = date.getDay();
  return day === 0 ? 6 : day - 1;
}

export function shiftWeekDay(day: number, offset: number): number {
  return (day + offset + 7) % 7;
}
