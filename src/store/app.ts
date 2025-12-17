import { create } from 'zustand';

/**
 * Global app store (Zustand)
 */

const DEFAULT_TITLE = 'kakaobank AI';

export type AppState = {
  appTitle: string;
};

export const useAppStore = create<AppState>(() => ({
  appTitle: DEFAULT_TITLE,
}));
