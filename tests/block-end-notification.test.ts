import { describe, expect, it } from 'vitest';
import { blockEndDate, blockLogFromResponse } from '../src/features/notifications/blockEnd';

const data = { templateBlockId: 'tb-1', lifeBlockId: 'sport', dayOfWeek: 2, plannedMinutes: 60, route: '/planning' };
const wednesdayEvening = new Date(2026, 9, 7, 20, 0);

describe('block end answers', () => {
  it('turns each action into a notification log for the block', () => {
    for (const status of ['done', 'partial', 'skipped'] as const) {
      expect(blockLogFromResponse(status, data, wednesdayEvening)).toEqual({
        date: '2026-10-07',
        templateBlockId: 'tb-1',
        lifeBlockId: 'sport',
        plannedMinutes: 60,
        status,
        source: 'notification',
      });
    }
  });

  it('ignores a plain tap and other notifications', () => {
    expect(blockLogFromResponse('expo.modules.notifications.actions.DEFAULT', data, wednesdayEvening)).toBeNull();
    expect(blockLogFromResponse('done', { route: '/morning-ritual' }, wednesdayEvening)).toBeNull();
    expect(blockLogFromResponse('done', undefined, wednesdayEvening)).toBeNull();
  });

  it('rejects a malformed payload', () => {
    expect(blockLogFromResponse('done', { ...data, dayOfWeek: 9 }, wednesdayEvening)).toBeNull();
    expect(blockLogFromResponse('done', { ...data, plannedMinutes: -5 }, wednesdayEvening)).toBeNull();
    expect(blockLogFromResponse('done', { ...data, templateBlockId: 3 }, wednesdayEvening)).toBeNull();
  });

  it('dates the answer on the block day, not the day it was delivered', () => {
    const thursdayMorning = new Date(2026, 9, 8, 0, 5);
    expect(blockEndDate(thursdayMorning, 2)).toBe('2026-10-07');
    expect(blockEndDate(wednesdayEvening, 2)).toBe('2026-10-07');
  });

  it('falls back to now when the delivery date is unknown', () => {
    const entry = blockLogFromResponse('done', data, new Date(Number.NaN));
    expect(entry?.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});
