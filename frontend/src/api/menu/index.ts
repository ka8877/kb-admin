import type { MenuItem } from '../../routes/menu';

// 메뉴/URL은 실제로는 DB에서 제공된다고 가정합니다.
export const menuApi = {
  getMenus: async (): Promise<MenuItem[]> => {
    return [
      { label: '홈', path: '/' },
      { label: '대시보드', path: '/dashboard' },
    ];
  },
};
