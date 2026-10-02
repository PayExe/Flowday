import { describe, expect, it } from 'vitest';
import { addDays, calendarDayDifference, dateKey, isValidTime } from '../src/utils/dates';

describe('dates', () => {
  it('uses the local calendar day, including month and year boundaries', () => {
    expect(dateKey(new Date(2026, 0, 2, 0, 30))).toBe('2026-01-02');
    expect(dateKey(addDays(new Date(2026, 0, 31), 1))).toBe('2026-02-01');
  });

  it('validates hours and minutes', () => {
    expect(isValidTime('00:00')).toBe(true);
    expect(isValidTime('23:59')).toBe(true);
    expect(isValidTime('24:00')).toBe(false);
    expect(isValidTime('12:60')).toBe(false);
    expect(isValidTime('99:99')).toBe(false);
  });

  it('compares calendar days without timezone or daylight-saving drift', () => {
    expect(calendarDayDifference('2026-03-28', '2026-03-29')).toBe(1);
    expect(calendarDayDifference('2026-03-29', '2026-03-30')).toBe(1);
    expect(calendarDayDifference('2026-03-30', '2026-03-28')).toBe(-2);
  });
});
