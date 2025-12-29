// 메뉴 관리 Mock Database
import type { MenuItem } from '@/pages/management/menu/types';

class MenuMockDb {
  private data: MenuItem[] = [
    {
      menuId: 1,
      menuCode: 'HOME',
      menuName: '홈',
      menuPath: '/',
      parentMenuCode: null,
      depth: 1,
      sortOrder: 1,
      isVisible: true,
      isActive: true,
    },
    {
      menuId: 2,
      menuCode: 'DATA_REG',
      menuName: '데이터 등록/노출',
      menuPath: '/data-reg',
      parentMenuCode: null,
      depth: 1,
      sortOrder: 2,
      isVisible: true,
      isActive: true,
    },
    {
      menuId: 3,
      menuCode: 'RECOMMENDED_QUESTIONS',
      menuName: '추천 질문',
      menuPath: '/data-reg/recommended-questions',
      parentMenuCode: 'DATA_REG',
      depth: 2,
      sortOrder: 1,
      isVisible: true,
      isActive: true,
    },
    {
      menuId: 4,
      menuCode: 'APP_SCHEME',
      menuName: '앱스킴',
      menuPath: '/data-reg/app-scheme',
      parentMenuCode: 'DATA_REG',
      depth: 2,
      sortOrder: 2,
      isVisible: true,
      isActive: true,
    },
    {
      menuId: 5,
      menuCode: 'MANAGEMENT',
      menuName: '관리',
      menuPath: '/management',
      parentMenuCode: null,
      depth: 1,
      sortOrder: 3,
      isVisible: true,
      isActive: true,
    },
    {
      menuId: 6,
      menuCode: 'COMMON_CODE',
      menuName: '공통 코드 관리',
      menuPath: '/management/common-code',
      parentMenuCode: 'MANAGEMENT',
      depth: 2,
      sortOrder: 1,
      isVisible: true,
      isActive: true,
    },
    {
      menuId: 7,
      menuCode: 'ADMIN_AUTH',
      menuName: '사용자 관리',
      menuPath: '/management/admin-auth',
      parentMenuCode: 'MANAGEMENT',
      depth: 2,
      sortOrder: 2,
      isVisible: true,
      isActive: true,
    },
    {
      menuId: 8,
      menuCode: 'MENU_MANAGEMENT',
      menuName: '메뉴 관리',
      menuPath: '/management/menu',
      parentMenuCode: 'MANAGEMENT',
      depth: 2,
      sortOrder: 3,
      isVisible: true,
      isActive: true,
    },
    {
      menuId: 9,
      menuCode: 'PERMISSION',
      menuName: '권한 관리',
      menuPath: '/management/permission',
      parentMenuCode: 'MANAGEMENT',
      depth: 2,
      sortOrder: 4,
      isVisible: true,
      isActive: true,
    },
  ];

  private idCounter = 10;

  async listAll(): Promise<MenuItem[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([...this.data]);
      }, 100);
    });
  }

  async getById(id: number): Promise<MenuItem | null> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const item = this.data.find((d) => d.menuId === id);
        resolve(item || null);
      }, 50);
    });
  }

  async create(data: Omit<MenuItem, 'menuId'>): Promise<MenuItem> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newItem: MenuItem = {
          ...data,
          menuId: this.idCounter++,
        };
        this.data.push(newItem);
        resolve(newItem);
      }, 100);
    });
  }

  async update(id: number, data: Partial<MenuItem>): Promise<MenuItem> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = this.data.findIndex((d) => d.menuId === id);
        if (index === -1) {
          reject(new Error('Menu not found'));
          return;
        }
        this.data[index] = { ...this.data[index], ...data };
        resolve(this.data[index]);
      }, 100);
    });
  }

  async delete(id: number): Promise<void> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = this.data.findIndex((d) => d.menuId === id);
        if (index === -1) {
          reject(new Error('Menu not found'));
          return;
        }
        this.data.splice(index, 1);
        resolve();
      }, 100);
    });
  }

  async reorder(orderedIds: number[]): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const reordered: MenuItem[] = [];
        orderedIds.forEach((id) => {
          const item = this.data.find((d) => d.menuId === id);
          if (item) reordered.push(item);
        });
        this.data = reordered;
        resolve();
      }, 100);
    });
  }
}

export const menuMockDb = new MenuMockDb();
