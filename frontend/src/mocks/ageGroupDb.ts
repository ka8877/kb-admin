// Temporary in-memory mock DB for Age Group management
import type { RowItem } from '../pages/management/age-group/types';

let seq = 7;
let items: RowItem[] = [
  { no: 1, category_nm: '10대', service_cd: 'AGE_10', status_code: 'Y' },
  { no: 2, category_nm: '20대', service_cd: 'AGE_20', status_code: 'Y' },
  { no: 3, category_nm: '30대', service_cd: 'AGE_30', status_code: 'Y' },
  { no: 4, category_nm: '40대', service_cd: 'AGE_40', status_code: 'N' },
  { no: 5, category_nm: '50대', service_cd: 'AGE_50', status_code: 'Y' },
  { no: 6, category_nm: '60대 이상', service_cd: 'AGE_60P', status_code: 'Y' },
];

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

export type ListParams = { page: number; size: number };

export const ageGroupMockDb = {
  async list({ page, size }: ListParams) {
    await delay(200);
    const start = page * size;
    const end = start + size;
    const slice = items.slice(start, end);
    return {
      items: slice,
      total: items.length,
      page,
      size,
    };
  },
  async listAll(): Promise<RowItem[]> {
    await delay(100);
    return [...items];
  },
  async delete(service_cd: string) {
    await delay(150);
    items = items.filter((it) => it.service_cd !== service_cd);
    items = items.map((it, idx) => ({ ...it, no: idx + 1 }));
    return true;
  },
  async create(input: Omit<RowItem, 'no'>) {
    await delay(200);
    const nowNo = seq++;
    const newItem: RowItem = {
      no: nowNo,
      category_nm: input.category_nm,
      service_cd: input.service_cd,
      status_code: input.status_code,
    };
    items = [...items, newItem];
    return newItem;
  },
  async update(service_cd: string, data: Partial<RowItem>) {
    await delay(200);
    items = items.map((it) => (it.service_cd === service_cd ? { ...it, ...data } : it));
    return items.find((it) => it.service_cd === service_cd) ?? null;
  },
  async reorder(order: string[]) {
    await delay(150);
    const indexMap = new Map(order.map((s, i) => [s, i]));
    items = [...items].sort((a, b) => {
      const ia = indexMap.has(a.service_cd) ? indexMap.get(a.service_cd)! : Number.MAX_SAFE_INTEGER;
      const ib = indexMap.has(b.service_cd) ? indexMap.get(b.service_cd)! : Number.MAX_SAFE_INTEGER;
      return ia - ib;
    });
    items = items.map((it, idx) => ({ ...it, no: idx + 1 }));
    return [...items];
  },
};
