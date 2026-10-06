import { describe, expect, it } from 'vitest';
import { countBlockValidation } from '../src/features/dayScore/blockValidation';

describe('block validation', () => {
  it('ignores planned blocks that carry no task', () => {
    const result = countBlockValidation(
      ['work', 'lunch', 'sport'],
      [{ lifeBlockId: 'work', completed: true }]
    );

    expect(result).toEqual({ validated: 1, tracked: 1 });
  });

  it('counts a block as missed while none of its tasks are done', () => {
    const result = countBlockValidation(
      ['work', 'sport'],
      [
        { lifeBlockId: 'work', completed: true },
        { lifeBlockId: 'sport', completed: false },
      ]
    );

    expect(result).toEqual({ validated: 1, tracked: 2 });
  });

  it('validates a block as soon as one of its tasks is done', () => {
    const result = countBlockValidation(
      ['work'],
      [
        { lifeBlockId: 'work', completed: false },
        { lifeBlockId: 'work', completed: true },
      ]
    );

    expect(result).toEqual({ validated: 1, tracked: 1 });
  });

  it('counts a block planned several times in the day only once', () => {
    const result = countBlockValidation(
      ['work', 'work', 'work'],
      [{ lifeBlockId: 'work', completed: true }]
    );

    expect(result).toEqual({ validated: 1, tracked: 1 });
  });

  it('tracks nothing when no task is attached to a block', () => {
    const result = countBlockValidation(
      ['work'],
      [{ lifeBlockId: undefined, completed: true }]
    );

    expect(result).toEqual({ validated: 0, tracked: 0 });
  });
});
