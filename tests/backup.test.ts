import { describe, expect, it, vi } from 'vitest';

const storage = vi.hoisted(
  () =>
    new Map<string, string>([
      ['flowday-tasks', JSON.stringify({ state: { tasks: [{ id: 't1' }] }, version: 1 })],
      ['flowday-theme', JSON.stringify({ state: { themeName: 'dark' }, version: 1 })],
      ['other-app', 'ignored'],
    ])
);

vi.mock('@react-native-async-storage/async-storage', () => ({
  default: {
    getAllKeys: vi.fn(async () => [...storage.keys()]),
    multiGet: vi.fn(async (keys: string[]) => keys.map((key) => [key, storage.get(key) ?? null])),
  },
}));
vi.mock('expo-constants', () => ({ default: { expoConfig: { version: '9.9.9' } } }));

describe('data export', () => {
  it('bundles every Flowday store and nothing else', async () => {
    const { buildExport } = await import('../src/features/backup/export');
    const exported = JSON.parse(await buildExport(new Date('2026-10-06T08:00:00.000Z')));

    expect(exported).toEqual({
      app: 'Flowday',
      appVersion: '9.9.9',
      exportedAt: '2026-10-06T08:00:00.000Z',
      stores: {
        tasks: { state: { tasks: [{ id: 't1' }] }, version: 1 },
        theme: { state: { themeName: 'dark' }, version: 1 },
      },
    });
  });
});
