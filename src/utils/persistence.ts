import AsyncStorage from '@react-native-async-storage/async-storage';
import { createJSONStorage, type PersistOptions } from 'zustand/middleware';

/**
 * A migration upgrades persisted state by exactly one version: the function
 * stored under key N receives state at version N - 1 and returns version N.
 */
export type Migrations = Record<number, (state: Record<string, unknown>) => Record<string, unknown>>;

/**
 * Applies every migration between `fromVersion` (exclusive) and `toVersion`
 * (inclusive), in order. Missing steps are no-ops, so a version bump that only
 * adds an optional field needs no migration at all.
 *
 * If a step throws, the data is returned untouched rather than dropped:
 * zustand would otherwise start from defaults and overwrite the user's saved
 * data on the next write.
 */
export function runMigrations(
  persisted: unknown,
  fromVersion: number,
  toVersion: number,
  migrations: Migrations
): unknown {
  if (persisted === null || typeof persisted !== 'object') return persisted;
  // Data written by a newer build: leave it alone rather than guess.
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
  /** Bump when the persisted shape changes, and add the matching migration. */
  version: number;
  migrations?: Migrations;
}

/**
 * Shared persist options for every Flowday store: AsyncStorage, an explicit
 * schema version and the migration chain. Stores saved before versioning
 * existed are at version 0.
 */
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
