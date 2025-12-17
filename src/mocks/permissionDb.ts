// frontend/src/mocks/permissionDb.ts
import type { PermissionItem } from '../pages/management/permission/types';

let mockData: PermissionItem[] = [
  {
    id: 1,
    permission_id: 'ADMIN',
    permission_name: '관리자',
    status: '활성',
    created_at: '2025-11-01 10:00:00',
    updated_at: '2025-11-25 14:30:00',
  },
  {
    id: 2,
    permission_id: 'OPERATOR',
    permission_name: 'CRUD',
    status: '활성',
    created_at: '2025-11-01 10:00:00',
    updated_at: '2025-11-20 09:15:00',
  },
  {
    id: 3,
    permission_id: 'VIEWER',
    permission_name: '조회',
    status: '활성',
    created_at: '2025-11-01 10:00:00',
    updated_at: '2025-11-18 16:45:00',
  },
];

let idCounter = 4;

export const permissionMockDb = {
  async listAll(): Promise<PermissionItem[]> {
    await new Promise((resolve) => setTimeout(resolve, 100));
    return [...mockData];
  },

  async getById(id: number | string): Promise<PermissionItem | null> {
    await new Promise((resolve) => setTimeout(resolve, 50));
    return mockData.find((item) => item.id === id) || null;
  },

  async create(
    data: Omit<PermissionItem, 'id' | 'created_at' | 'updated_at'>,
  ): Promise<PermissionItem> {
    await new Promise((resolve) => setTimeout(resolve, 100));
    const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const newItem: PermissionItem = {
      ...data,
      id: idCounter++,
      created_at: now,
      updated_at: now,
    };
    mockData.push(newItem);
    return newItem;
  },

  async update(id: number | string, data: Partial<PermissionItem>): Promise<PermissionItem> {
    await new Promise((resolve) => setTimeout(resolve, 100));
    const index = mockData.findIndex((item) => item.id === id);
    if (index === -1) throw new Error('Not found');
    const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
    mockData[index] = { ...mockData[index], ...data, updated_at: now };
    return mockData[index];
  },

  async delete(id: number | string): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 100));
    mockData = mockData.filter((item) => item.id !== id);
  },
};
