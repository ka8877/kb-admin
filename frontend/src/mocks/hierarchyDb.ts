// frontend/src/mocks/hierarchyDb.ts
import type { HierarchyDefinition } from '@/pages/management/code-hierarchy/types';

interface HierarchyDbItem extends HierarchyDefinition {
  createdAt: string;
  updatedAt: string;
}

let mockData: HierarchyDbItem[] = [
  {
    id: 'service-question',
    parentType: 'SERVICE_NAME',
    parentLabel: '서비스명',
    childType: 'QUESTION_CATEGORY',
    childLabel: '질문 카테고리',
    relationField: 'parent_service_cd',
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
  },
];

export const hierarchyMockDb = {
  // 전체 목록 조회
  async listAll(): Promise<HierarchyDbItem[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([...mockData]);
      }, 100);
    });
  },

  // ID로 조회
  async findById(id: string): Promise<HierarchyDbItem | null> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const item = mockData.find((h) => h.id === id);
        resolve(item || null);
      }, 100);
    });
  },

  // 생성
  async create(data: Omit<HierarchyDefinition, 'id'>): Promise<HierarchyDbItem> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // ID 생성 (parentType-childType 조합)
        const id = `${data.parentType.toLowerCase()}-${data.childType.toLowerCase()}`;

        // 중복 체크
        if (mockData.some((h) => h.id === id)) {
          reject(new Error('이미 존재하는 계층 구조입니다.'));
          return;
        }

        const now = new Date().toISOString();
        const newItem: HierarchyDbItem = {
          ...data,
          id,
          createdAt: now,
          updatedAt: now,
        };

        mockData.push(newItem);
        resolve(newItem);
      }, 100);
    });
  },

  // 수정
  async update(
    id: string,
    data: Partial<Omit<HierarchyDefinition, 'id'>>,
  ): Promise<HierarchyDbItem> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = mockData.findIndex((h) => h.id === id);
        if (index === -1) {
          reject(new Error('계층 구조를 찾을 수 없습니다.'));
          return;
        }

        const now = new Date().toISOString();
        mockData[index] = {
          ...mockData[index],
          ...data,
          updatedAt: now,
        };

        resolve(mockData[index]);
      }, 100);
    });
  },

  // 삭제
  async delete(id: string): Promise<void> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = mockData.findIndex((h) => h.id === id);
        if (index === -1) {
          reject(new Error('계층 구조를 찾을 수 없습니다.'));
          return;
        }

        mockData.splice(index, 1);
        resolve();
      }, 100);
    });
  },
};
