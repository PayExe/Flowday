import { useEffect, useState } from 'react';

export interface PersistedStore {
  persist: {
    hasHydrated: () => boolean;
    onFinishHydration: (listener: () => void) => () => void;
  };
}

/**
 * True once every given store has loaded its saved state. Decisions that depend
 * on saved data (is this a first launch?) must wait for it, since AsyncStorage
 * hydration finishes after the first render.
 */
export function useStoresHydrated(stores: readonly PersistedStore[]): boolean {
  const [hydrated, setHydrated] = useState(() => stores.every((store) => store.persist.hasHydrated()));

  useEffect(() => {
    if (hydrated) return;
    const check = () => {
      if (stores.every((store) => store.persist.hasHydrated())) setHydrated(true);
    };
    const unsubscribes = stores.map((store) => store.persist.onFinishHydration(check));
    check();
    return () => unsubscribes.forEach((unsubscribe) => unsubscribe());
  }, [hydrated, stores]);

  return hydrated;
}
