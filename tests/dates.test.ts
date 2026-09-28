import { describe, expect, it } from 'vitest';
import { addDays, dateKey, isValidTime } from '../src/utils/dates';

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
});
