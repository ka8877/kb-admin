// Temporary in-memory mock DB for Service Name management
import type { RowItem } from '../pages/management/service-name/types';

let seq = 16;
let items: RowItem[] = [
  { no: 1, category_nm: '적금', service_cd: 'SVC_AI_SEARCH', status_code: 'Y' },
  { no: 2, category_nm: '적금', service_cd: 'SVC_AI_RECOMMEND', status_code: 'Y' },
  { no: 3, category_nm: '대출', service_cd: 'SVC_LOAN_INFO', status_code: 'N' },
  { no: 4, category_nm: '신용', service_cd: 'SVC_CREDIT_CHECK', status_code: 'Y' },
  { no: 5, category_nm: '예금', service_cd: 'SVC_DEPOSIT_PROMO', status_code: 'N' },
  { no: 6, category_nm: '적금', service_cd: 'SVC_SAVINGS_PLUS', status_code: 'Y' },
  { no: 7, category_nm: '예금', service_cd: 'SVC_HIGH_INTEREST', status_code: 'Y' },
  { no: 8, category_nm: '대출', service_cd: 'SVC_MORTGAGE_HELP', status_code: 'N' },
  { no: 9, category_nm: '보험', service_cd: 'SVC_INSURANCE_BASIC', status_code: 'Y' },
  { no: 10, category_nm: '신용', service_cd: 'SVC_CREDIT_CARD', status_code: 'Y' },
  { no: 11, category_nm: '투자', service_cd: 'SVC_INVEST_SIMPLE', status_code: 'N' },
  { no: 12, category_nm: '투자', service_cd: 'SVC_ROBO_ADVISOR', status_code: 'Y' },
  { no: 13, category_nm: '서비스', service_cd: 'SVC_CUSTOMER_SUPPORT', status_code: 'Y' },
  { no: 14, category_nm: '예금', service_cd: 'SVC_FIXED_DEPOSIT', status_code: 'N' },
  { no: 15, category_nm: '적금', service_cd: 'SVC_MONTHLY_SAVE', status_code: 'Y' },
];

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

export type ListParams = { page: number; size: number };

export const serviceNameMockDb = {
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
  async create(input: Omit<RowItem, 'no'>) {
    await delay(200);
    const nowNo = seq++;
    const newItem: RowItem = {
      no: nowNo,
      category_nm: input.category_nm,
      service_cd: input.service_cd,
      status_code: input.status_code,
    };
    // append new items to the end so newly created entries appear as the last row
    items = [...items, newItem];
    return newItem;
  },
  async update(service_cd: string, data: Partial<RowItem>) {
    await delay(200);
    items = items.map((it) => (it.service_cd === service_cd ? { ...it, ...data } : it));
    return items.find((it) => it.service_cd === service_cd) ?? null;
  },
};
