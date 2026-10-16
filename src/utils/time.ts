export function timeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

export function currentMinutes(now = new Date()): number {
  return now.getHours() * 60 + now.getMinutes();
}

export function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h > 0 && m > 0) return `${h}h${m.toString().padStart(2, '0')}`;
  if (h > 0) return `${h}h`;
  return `${m} min`;
}

const WEEKDAYS = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];
const MONTHS = [
  'janvier', 'février', 'mars', 'avril', 'mai', 'juin',
  'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre',
];

export function formatLongDate(date: Date, t: (key: string) => string): string {
  return `${t(WEEKDAYS[date.getDay()])} ${date.getDate()} ${t(MONTHS[date.getMonth()])}`;
}

export function formatDayMonth(date: Date, t: (key: string) => string): string {
  return `${date.getDate()} ${t(MONTHS[date.getMonth()])}`;
}

export function formatMonthYear(date: Date, t: (key: string) => string): string {
  const month = t(MONTHS[date.getMonth()]);
  return `${month.charAt(0).toUpperCase()}${month.slice(1)} ${date.getFullYear()}`;
}
