import { describe, expect, it } from 'vitest';
import { translate } from '../src/i18n';

describe('i18n', () => {
  it('translates the same UI key into French and English', () => {
    expect(translate('Réglages', 'fr')).toBe('Réglages');
    expect(translate('Réglages', 'en')).toBe('Settings');
  });

  it('keeps pluralized values grammatical in both languages', () => {
    expect(translate('pendingTasksCount', 'fr', { count: 2 })).toBe('2 tâches en attente');
    expect(translate('pendingTasksCount', 'en', { count: 1 })).toBe('1 pending task');
  });
});
