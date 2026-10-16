import { describe, expect, it } from 'vitest';
import {
  BLOCK_END_CATEGORY,
  EVENING_ID,
  MORNING_ID,
  planNotifications,
  planSignature,
  shiftSlotBack,
  toExpoWeekday,
} from '../src/features/notifications/schedule';

const morning = {
  time: '07:30',
  title: 'Morning Ritual',
  body: 'Cadre ta journée.',
  route: '/morning-ritual',
};

const evening = {
  time: '21:05',
  title: 'Evening Wrap',
  body: 'Bilan du jour.',
  route: '/evening-wrap',
};

function block(id: string, dayOfWeek: number, startTime: string) {
  return { id, dayOfWeek, startTime, title: id, body: 'body' };
}

function blockEnd(id: string, dayOfWeek: number, startTime: string, endTime: string) {
  return { id, lifeBlockId: 'sport', dayOfWeek, startTime, endTime, title: id, body: 'body' };
}

describe('planNotifications', () => {
  it('plans both rituals as daily triggers', () => {
    const planned = planNotifications({ morning, evening });

    expect(planned).toHaveLength(2);
    expect(planned[0]).toMatchObject({
      id: MORNING_ID,
      route: '/morning-ritual',
      trigger: { kind: 'daily', hour: 7, minute: 30 },
    });
    expect(planned[1]).toMatchObject({
      id: EVENING_ID,
      trigger: { kind: 'daily', hour: 21, minute: 5 },
    });
  });

  it('ignores a disabled ritual and a malformed time', () => {
    expect(planNotifications({})).toEqual([]);
    expect(planNotifications({ morning: { ...morning, time: 'nope' } })).toEqual([]);
  });

  it('plans one weekly trigger per block, applying the lead time', () => {
    const planned = planNotifications({
      blocks: [block('a', 0, '09:00')],
      leadMinutes: 10,
    });

    expect(planned).toHaveLength(1);
    expect(planned[0].trigger).toEqual({ kind: 'weekly', weekday: 0, hour: 8, minute: 50 });
    expect(planned[0].route).toBe('/planning');
  });

  it('rolls the lead time back to the previous day across midnight', () => {
    expect(shiftSlotBack(0, '00:15', 30)).toEqual({ weekday: 6, hour: 23, minute: 45 });
  });

  it('buzzes once when two blocks start at the same minute', () => {
    const planned = planNotifications({
      blocks: [block('a', 2, '14:00'), block('b', 2, '14:00'), block('c', 2, '15:00')],
    });

    expect(planned).toHaveLength(2);
    expect(planned.map((item) => item.title)).toEqual(['a', 'c']);
  });

  it('sorts block reminders chronologically through the week', () => {
    const planned = planNotifications({
      blocks: [block('fri', 4, '08:00'), block('mon-late', 0, '18:00'), block('mon-early', 0, '07:00')],
    });

    expect(planned.map((item) => item.title)).toEqual(['mon-early', 'mon-late', 'fri']);
  });

  it('keeps the rituals when the block budget overflows', () => {
    const blocks = Array.from({ length: 10 }, (_, index) =>
      block(`b${index}`, 3, `${String(8 + index).padStart(2, '0')}:00`)
    );
    const planned = planNotifications({ morning, evening, blocks, max: 4 });

    expect(planned).toHaveLength(4);
    expect(planned.map((item) => item.id).slice(0, 2)).toEqual([MORNING_ID, EVENING_ID]);
  });

  it('maps Monday-first weekdays onto the expo Sunday-first scale', () => {
    expect(toExpoWeekday(0)).toBe(2);
    expect(toExpoWeekday(5)).toBe(7);
    expect(toExpoWeekday(6)).toBe(1);
  });

  it('changes its signature when the copy or the time changes', () => {
    const base = planNotifications({ morning });
    expect(planSignature(base)).toBe(planSignature(planNotifications({ morning })));
    expect(planSignature(base)).not.toBe(
      planSignature(planNotifications({ morning: { ...morning, time: '08:00' } }))
    );
    expect(planSignature(base)).not.toBe(
      planSignature(planNotifications({ morning: { ...morning, body: 'Wake up.' } }))
    );
  });
});

describe('block end notifications', () => {
  it('fires at the end of the block with the answer category and the log payload', () => {
    const [planned] = planNotifications({ blockEnds: [blockEnd('a', 2, '19:00', '20:30')] });

    expect(planned).toMatchObject({
      id: 'flowday-block-end-a',
      categoryId: BLOCK_END_CATEGORY,
      route: '/planning',
      trigger: { kind: 'weekly', weekday: 2, hour: 20, minute: 30 },
      data: { templateBlockId: 'a', lifeBlockId: 'sport', dayOfWeek: 2, plannedMinutes: 90 },
    });
  });

  it('ignores the start lead time', () => {
    const [planned] = planNotifications({ blockEnds: [blockEnd('a', 0, '09:00', '10:00')], leadMinutes: 10 });
    expect(planned.trigger).toEqual({ kind: 'weekly', weekday: 0, hour: 10, minute: 0 });
  });

  it('skips blocks with a malformed or empty time range', () => {
    expect(planNotifications({ blockEnds: [blockEnd('a', 0, 'nope', '10:00')] })).toEqual([]);
    expect(planNotifications({ blockEnds: [blockEnd('b', 0, '10:00', '10:00')] })).toEqual([]);
  });

  it('asks about each block even when two end at the same minute', () => {
    const planned = planNotifications({
      blockEnds: [blockEnd('a', 1, '08:00', '09:00'), blockEnd('b', 1, '08:30', '09:00')],
    });
    expect(planned).toHaveLength(2);
  });

  it('keeps block ends ahead of start reminders when the budget overflows', () => {
    const planned = planNotifications({
      morning,
      blocks: [block('start', 0, '07:00')],
      blockEnds: [blockEnd('end', 4, '18:00', '19:00')],
      max: 2,
    });
    expect(planned.map((item) => item.id)).toEqual([MORNING_ID, 'flowday-block-end-end']);
  });

  it('changes its signature when the planned duration changes', () => {
    const before = planNotifications({ blockEnds: [blockEnd('a', 0, '09:00', '10:00')] });
    const after = planNotifications({ blockEnds: [blockEnd('a', 0, '09:30', '10:00')] });
    expect(planSignature(before)).not.toBe(planSignature(after));
  });
});
