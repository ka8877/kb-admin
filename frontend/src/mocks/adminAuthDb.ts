// frontend/src/mocks/adminAuthDb.ts
import type { AdminAuthItem, RowItem } from '../pages/management/admin-auth/types';

let mockData: AdminAuthItem[] = [
  {
    id: 1,
    user_name: '홍길동',
    position: '팀장',
    team_1st: '개발팀',
    team_2nd: '프론트엔드',
    use_permission: 'admin',
    approval_permission: '결재자',
    status: '활성',
  },
  {
    id: 2,
    user_name: '김철수',
    position: '과장',
    team_1st: '개발팀',
    team_2nd: '백엔드',
    use_permission: 'crud',
    approval_permission: '요청자',
    status: '활성',
  },
  {
    id: 3,
    user_name: '이영희',
    position: '대리',
    team_1st: '기획팀',
    team_2nd: 'UX/UI',
    use_permission: 'viewer',
    approval_permission: '요청자',
    status: '비활성',
  },
];

let idCounter = 4;

export const adminAuthMockDb = {
  async listAll(): Promise<RowItem[]> {
    await new Promise((resolve) => setTimeout(resolve, 100));
    return mockData.map((item, idx) => ({ ...item, no: idx + 1 }));
  },

  async getById(id: number): Promise<AdminAuthItem | null> {
    await new Promise((resolve) => setTimeout(resolve, 50));
    return mockData.find((item) => item.id === id) || null;
  },

  async create(data: Omit<AdminAuthItem, 'id'>): Promise<AdminAuthItem> {
    await new Promise((resolve) => setTimeout(resolve, 100));
    const newItem: AdminAuthItem = { ...data, id: idCounter++ };
    mockData.push(newItem);
    return newItem;
  },

  async update(id: number, data: Partial<AdminAuthItem>): Promise<AdminAuthItem> {
    await new Promise((resolve) => setTimeout(resolve, 100));
    const index = mockData.findIndex((item) => item.id === id);
    if (index === -1) throw new Error('Not found');
    mockData[index] = { ...mockData[index], ...data };
    return mockData[index];
  },

  async delete(id: number): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 100));
    mockData = mockData.filter((item) => item.id !== id);
  },
};
