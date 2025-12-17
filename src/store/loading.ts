import { create } from 'zustand';

export type LoadingState = {
  pendingCount: number;
  isLoading: boolean;
  start: () => void;
  stop: () => void;
  reset: () => void;
  setLoading: (on: boolean) => void;
};

export const useLoadingStore = create<LoadingState>((set, get) => ({
  pendingCount: 0,
  isLoading: false,
  start: () => {
    const next = get().pendingCount + 1;
    set({ pendingCount: next, isLoading: true });
  },
  stop: () => {
    const next = Math.max(0, get().pendingCount - 1);
    set({ pendingCount: next, isLoading: next > 0 });
  },
  reset: () => set({ pendingCount: 0, isLoading: false }),
  setLoading: (on) =>
    set({ isLoading: on, pendingCount: on ? Math.max(1, get().pendingCount) : 0 }),
}));
