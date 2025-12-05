// 메뉴 관리 Mock Database
import type { MenuScreenItem } from '@/pages/management/menu/types';

class MenuMockDb {
  private data: MenuScreenItem[] = [
    // === 기본 페이지 ===
    {
      id: 1,
      screen_id: 'HOME',
      screen_name: '홈',
      path: '/',
      depth: 0,
      order: 1,
      screen_type: '페이지',
      display_yn: 'Y',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    },

    // === 데이터 등록/노출 ===
    {
      id: 2,
      screen_id: 'DATA_REG',
      screen_name: '데이터 등록/노출',
      path: '/data-reg',
      depth: 0,
      order: 2,
      screen_type: '메뉴',
      display_yn: 'Y',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    },
    {
      id: 3,
      screen_id: 'RECOMMENDED_QUESTIONS',
      screen_name: '추천 질문',
      path: '/data-reg/recommended-questions',
      depth: 1,
      order: 1,
      parent_screen_id: 'DATA_REG',
      screen_type: '페이지',
      display_yn: 'Y',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    },
    {
      id: 4,
      screen_id: 'APP_SCHEME',
      screen_name: '앱스킴',
      path: '/data-reg/app-scheme',
      depth: 1,
      order: 2,
      parent_screen_id: 'DATA_REG',
      screen_type: '페이지',
      display_yn: 'Y',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    },

    // === 관리 ===
    {
      id: 5,
      screen_id: 'MANAGEMENT',
      screen_name: '관리',
      path: '/management',
      depth: 0,
      order: 3,
      screen_type: '메뉴',
      display_yn: 'Y',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    },
    {
      id: 6,
      screen_id: 'COMMON_CODE',
      screen_name: '공통 코드 관리',
      path: '/management/common-code',
      depth: 1,
      order: 1,
      parent_screen_id: 'MANAGEMENT',
      screen_type: '페이지',
      display_yn: 'Y',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    },
    {
      id: 7,
      screen_id: 'CODE_HIERARCHY',
      screen_name: '코드 계층 관리',
      path: '/management/code-hierarchy',
      depth: 1,
      order: 2,
      parent_screen_id: 'MANAGEMENT',
      screen_type: '페이지',
      display_yn: 'N',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    },
    {
      id: 8,
      screen_id: 'ADMIN_AUTH',
      screen_name: '사용자 관리',
      path: '/management/admin-auth',
      depth: 1,
      order: 3,
      parent_screen_id: 'MANAGEMENT',
      screen_type: '페이지',
      display_yn: 'Y',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    },
    {
      id: 9,
      screen_id: 'MENU_MANAGEMENT',
      screen_name: '메뉴 관리',
      path: '/management/menu',
      depth: 1,
      order: 4,
      parent_screen_id: 'MANAGEMENT',
      screen_type: '페이지',
      display_yn: 'Y',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    },
    {
      id: 10,
      screen_id: 'PERMISSION_MANAGEMENT',
      screen_name: '권한 관리',
      path: '/management/permission',
      depth: 1,
      order: 5,
      parent_screen_id: 'MANAGEMENT',
      screen_type: '페이지',
      display_yn: 'Y',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    },

    // === 이력 ===
    {
      id: 11,
      screen_id: 'HISTORY',
      screen_name: '이력',
      path: '/history',
      depth: 0,
      order: 4,
      screen_type: '메뉴',
      display_yn: 'Y',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    },
    {
      id: 12,
      screen_id: 'USER_LOGIN',
      screen_name: '로그인 이력',
      path: '/history/login',
      depth: 1,
      order: 1,
      parent_screen_id: 'HISTORY',
      screen_type: '페이지',
      display_yn: 'Y',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    },
    {
      id: 13,
      screen_id: 'USER_ROLE_CHANGE',
      screen_name: '사용자 역할 변경 이력',
      path: '/history/user-role-change',
      depth: 1,
      order: 2,
      parent_screen_id: 'HISTORY',
      screen_type: '페이지',
      display_yn: 'Y',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    },
  ];

  private nextId = 14;

  async listAll(): Promise<MenuScreenItem[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([...this.data]);
      }, 100);
    });
  }

  async findById(id: string | number): Promise<MenuScreenItem | undefined> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(this.data.find((item) => item.id === id));
      }, 100);
    });
  }

  async create(
    item: Omit<MenuScreenItem, 'id' | 'created_at' | 'updated_at'>,
  ): Promise<MenuScreenItem> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newItem: MenuScreenItem = {
          ...item,
          id: this.nextId++,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        this.data.push(newItem);
        resolve(newItem);
      }, 100);
    });
  }

  async update(
    id: string | number,
    updates: Partial<Omit<MenuScreenItem, 'id' | 'created_at'>>,
  ): Promise<MenuScreenItem> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = this.data.findIndex((item) => item.id === id);
        if (index === -1) {
          reject(new Error('Menu item not found'));
          return;
        }

        this.data[index] = {
          ...this.data[index],
          ...updates,
          updated_at: new Date().toISOString(),
        };
        resolve(this.data[index]);
      }, 100);
    });
  }

  async delete(id: string | number): Promise<void> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = this.data.findIndex((item) => item.id === id);
        if (index === -1) {
          reject(new Error('Menu item not found'));
          return;
        }
        this.data.splice(index, 1);
        resolve();
      }, 100);
    });
  }

  async reorder(orderedIds: (string | number)[]): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const reordered: MenuScreenItem[] = [];
        orderedIds.forEach((id) => {
          const item = this.data.find((d) => d.id === id);
          if (item) reordered.push(item);
        });
        this.data = reordered;
        resolve();
      }, 100);
    });
  }
}

export const menuMockDb = new MenuMockDb();
