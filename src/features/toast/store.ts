import { create } from 'zustand';

export interface Toast {
  id: number;
  message: string;
  symbol?: string;
  action?: { label: string; onPress: () => void };
}

interface ToastState {
  toast: Toast | null;
  show: (toast: Omit<Toast, 'id'>) => void;
  hide: (id?: number) => void;
}

let nextId = 1;

export const useToastStore = create<ToastState>()((set, get) => ({
  toast: null,
  show: (toast) => set({ toast: { ...toast, id: nextId++ } }),
  hide: (id) => {
    if (id === undefined || get().toast?.id === id) set({ toast: null });
  },
}));
