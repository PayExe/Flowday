import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { persistOptions } from '../../utils/persistence';

interface OnboardingState {
  completed: boolean;
  completedAt?: string;
  complete: () => void;
}

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set) => ({
      completed: false,
      complete: () =>
        set((state) => ({ completed: true, completedAt: state.completedAt ?? new Date().toISOString() })),
    }),
    persistOptions<OnboardingState>('flowday-onboarding', { version: 1 })
  )
);
