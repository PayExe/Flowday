import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { persistOptions } from '../../utils/persistence';

interface OnboardingState {
  completed: boolean;
  complete: () => void;
}

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set) => ({
      completed: false,
      complete: () => set({ completed: true }),
    }),
    persistOptions<OnboardingState>('flowday-onboarding', { version: 1 })
  )
);
