import AsyncStorage from '@react-native-async-storage/async-storage';
import { createJSONStorage, type PersistOptions } from 'zustand/middleware';

export type Migrations = Record<number, (state: Record<string, unknown>) => Record<string, unknown>>;

export function runMigrations(
  persisted: unknown,
  fromVersion: number,
  toVersion: number,
  migrations: Migrations
): unknown {
  if (persisted === null || typeof persisted !== 'object') return persisted;
  if (fromVersion >= toVersion) return persisted;

  let state = persisted as Record<string, unknown>;
  try {
    for (let version = fromVersion + 1; version <= toVersion; version++) {
      const step = migrations[version];
      if (step) state = step(state);
    }
    return state;
  } catch (error) {
    console.warn(`[persistence] migration from v${fromVersion} to v${toVersion} failed`, error);
    return persisted;
  }
}

interface StoreConfig {
  version: number;
  migrations?: Migrations;
}

export function persistOptions<S>(
  name: string,
  { version, migrations = {} }: StoreConfig
): PersistOptions<S> {
  return {
    name,
    storage: createJSONStorage(() => AsyncStorage),
    version,
    migrate: (persisted, fromVersion) =>
      runMigrations(persisted, fromVersion, version, migrations) as S,
  };
}
