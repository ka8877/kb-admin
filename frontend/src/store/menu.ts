import { create } from 'zustand';
import type { MenuItem } from '../routes/menu';
import { menuApi } from '../api';

export type MenuState = {
  menus: MenuItem[];
  loading: boolean;
  error?: string;
  loadMenus: () => Promise<void>;
};

export const useMenuStore = create<MenuState>((set) => ({
  menus: [],
  loading: false,
  error: undefined,
  loadMenus: async () => {
    set({ loading: true, error: undefined });
    try {
      const data = await menuApi.getMenus();
      set({ menus: data, loading: false });
    } catch (e) {
      set({ error: e instanceof Error ? e.message : String(e), loading: false });
    }
  },
}));
