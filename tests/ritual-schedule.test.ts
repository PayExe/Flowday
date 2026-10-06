import { describe, expect, it } from 'vitest';
import {
  MINUTES_PER_DAY,
  MORNING_AUTO_OPEN_WINDOW_MINUTES,
  autoOpenDelay,
  isPastTime,
} from '../src/utils/ritualNavigation';

function at(hours: number, minutes = 0): Date {
  const date = new Date(2026, 0, 2);
  date.setHours(hours, minutes, 0, 0);
  return date;
}

describe('ritual auto-open', () => {
  it('schedules the remaining delay when the time has not come yet', () => {
    const delay = autoOpenDelay('08:00', MORNING_AUTO_OPEN_WINDOW_MINUTES, at(7, 30));
    expect(delay).toBe(30 * 60 * 1000);
  });

  it('opens right away inside the window', () => {
    expect(autoOpenDelay('08:00', MORNING_AUTO_OPEN_WINDOW_MINUTES, at(8, 0))).toBe(100);
    expect(autoOpenDelay('08:00', MORNING_AUTO_OPEN_WINDOW_MINUTES, at(10, 59))).toBe(100);
  });

  it('never opens the Morning Ritual once its window has passed', () => {
    expect(autoOpenDelay('08:00', MORNING_AUTO_OPEN_WINDOW_MINUTES, at(11, 1))).toBeNull();
    expect(autoOpenDelay('08:00', MORNING_AUTO_OPEN_WINDOW_MINUTES, at(22, 0))).toBeNull();
  });

  it('keeps the Evening Wrap available until midnight', () => {
    expect(autoOpenDelay('20:00', MINUTES_PER_DAY, at(19, 59))).toBe(60 * 1000);
    expect(autoOpenDelay('20:00', MINUTES_PER_DAY, at(23, 59))).toBe(100);
  });

  it('ignores a malformed time instead of opening immediately', () => {
    expect(autoOpenDelay('nope', MINUTES_PER_DAY, at(12, 0))).toBeNull();
  });

  it('reports whether a configured time has passed', () => {
    expect(isPastTime('20:00', at(21, 0))).toBe(true);
    expect(isPastTime('20:00', at(19, 0))).toBe(false);
  });
});
