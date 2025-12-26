// frontend/src/mocks/adminAuthDb.ts
import type { UserAccountApiItem } from '../pages/management/admin-auth/types';

let mockData: UserAccountApiItem[] = [
  {
    kcUserId: 1,
    oidcSub: 'sub-001',
    username: 'hong.gildong',
    email: 'hong.gildong@example.com',
    hrEmployeeId: 1001,
    empNo: 'E001',
    empName: '홍길동',
    deptCode: 'D001',
    deptName1: '개발팀',
    deptName2: '프론트엔드',
    jobTitleCode: 'J01',
    jobTitleName: '팀장',
    isActive: true,
    createdAt: '2024-01-01T00:00:00',
    updatedAt: '2024-01-01T00:00:00',
    roleCodes: ['ROLE_ADMIN'],
  },
  {
    kcUserId: 2,
    oidcSub: 'sub-002',
    username: 'kim.chulsoo',
    email: 'kim.chulsoo@example.com',
    hrEmployeeId: 1002,
    empNo: 'E002',
    empName: '김철수',
    deptCode: 'D001',
    deptName1: '개발팀',
    deptName2: '백엔드',
    jobTitleCode: 'J02',
    jobTitleName: '과장',
    isActive: true,
    createdAt: '2024-01-01T00:00:00',
    updatedAt: '2024-01-01T00:00:00',
    roleCodes: ['ROLE_OPERATOR'],
  },
  {
    kcUserId: 3,
    oidcSub: 'sub-003',
    username: 'lee.younghee',
    email: 'lee.younghee@example.com',
    hrEmployeeId: 1003,
    empNo: 'E003',
    empName: '이영희',
    deptCode: 'D002',
    deptName1: '기획팀',
    deptName2: 'UX/UI',
    jobTitleCode: 'J03',
    jobTitleName: '대리',
    isActive: false,
    createdAt: '2024-01-01T00:00:00',
    updatedAt: '2024-01-01T00:00:00',
    roleCodes: ['ROLE_VIEWER'],
  },
];

let idCounter = 4;

export const adminAuthMockDb = {
  async listAll(): Promise<UserAccountApiItem[]> {
    await new Promise((resolve) => setTimeout(resolve, 100));
    return [...mockData];
  },

  async getById(id: number): Promise<UserAccountApiItem | null> {
    await new Promise((resolve) => setTimeout(resolve, 50));
    return mockData.find((item) => item.kcUserId === id) || null;
  },

  async create(data: Omit<UserAccountApiItem, 'kcUserId'>): Promise<UserAccountApiItem> {
    await new Promise((resolve) => setTimeout(resolve, 100));
    const newItem: UserAccountApiItem = { ...data, kcUserId: idCounter++ };
    mockData.push(newItem);
    return newItem;
  },

  async update(id: number, data: Partial<UserAccountApiItem>): Promise<UserAccountApiItem> {
    await new Promise((resolve) => setTimeout(resolve, 100));
    const index = mockData.findIndex((item) => item.kcUserId === id);
    if (index === -1) throw new Error('Not found');
    mockData[index] = { ...mockData[index], ...data };
    return mockData[index];
  },

  async delete(id: number): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 100));
    mockData = mockData.filter((item) => item.kcUserId !== id);
  },
};
