// Temporary in-memory mock DB for Common Code management
export type CodeType = 'SERVICE_NAME' | 'QUESTION_CATEGORY' | 'AGE_GROUP';

export interface CommonCodeItem extends Record<string, unknown> {
  no: number;
  code_type: CodeType;
  category_nm: string;
  service_cd: string;
  status_code: string;
}

let seq = 27;
let items: CommonCodeItem[] = [
  // 서비스명 (기존 serviceNameDb 데이터)
  {
    no: 1,
    code_type: 'SERVICE_NAME',
    category_nm: '적금',
    service_cd: 'SVC_AI_SEARCH',
    status_code: 'Y',
  },
  {
    no: 2,
    code_type: 'SERVICE_NAME',
    category_nm: '적금',
    service_cd: 'SVC_AI_RECOMMEND',
    status_code: 'Y',
  },
  {
    no: 3,
    code_type: 'SERVICE_NAME',
    category_nm: '대출',
    service_cd: 'SVC_LOAN_INFO',
    status_code: 'N',
  },
  {
    no: 4,
    code_type: 'SERVICE_NAME',
    category_nm: '신용',
    service_cd: 'SVC_CREDIT_CHECK',
    status_code: 'Y',
  },
  {
    no: 5,
    code_type: 'SERVICE_NAME',
    category_nm: '예금',
    service_cd: 'SVC_DEPOSIT_PROMO',
    status_code: 'N',
  },
  {
    no: 6,
    code_type: 'SERVICE_NAME',
    category_nm: '적금',
    service_cd: 'SVC_SAVINGS_PLUS',
    status_code: 'Y',
  },
  {
    no: 7,
    code_type: 'SERVICE_NAME',
    category_nm: '예금',
    service_cd: 'SVC_HIGH_INTEREST',
    status_code: 'Y',
  },
  {
    no: 8,
    code_type: 'SERVICE_NAME',
    category_nm: '대출',
    service_cd: 'SVC_MORTGAGE_HELP',
    status_code: 'N',
  },
  {
    no: 9,
    code_type: 'SERVICE_NAME',
    category_nm: '보험',
    service_cd: 'SVC_INSURANCE_BASIC',
    status_code: 'Y',
  },
  {
    no: 10,
    code_type: 'SERVICE_NAME',
    category_nm: '신용',
    service_cd: 'SVC_CREDIT_CARD',
    status_code: 'Y',
  },
  {
    no: 11,
    code_type: 'SERVICE_NAME',
    category_nm: '투자',
    service_cd: 'SVC_INVEST_SIMPLE',
    status_code: 'N',
  },
  {
    no: 12,
    code_type: 'SERVICE_NAME',
    category_nm: '투자',
    service_cd: 'SVC_ROBO_ADVISOR',
    status_code: 'Y',
  },
  {
    no: 13,
    code_type: 'SERVICE_NAME',
    category_nm: '서비스',
    service_cd: 'SVC_CUSTOMER_SUPPORT',
    status_code: 'Y',
  },
  {
    no: 14,
    code_type: 'SERVICE_NAME',
    category_nm: '예금',
    service_cd: 'SVC_FIXED_DEPOSIT',
    status_code: 'N',
  },
  {
    no: 15,
    code_type: 'SERVICE_NAME',
    category_nm: '적금',
    service_cd: 'SVC_MONTHLY_SAVE',
    status_code: 'Y',
  },

  // 질문 카테고리 (기존 questionsCategoryDb 데이터)
  {
    no: 16,
    code_type: 'QUESTION_CATEGORY',
    category_nm: '상품문의',
    service_cd: 'QCAT_PRODUCT',
    status_code: 'Y',
  },
  {
    no: 17,
    code_type: 'QUESTION_CATEGORY',
    category_nm: '결제문의',
    service_cd: 'QCAT_PAYMENT',
    status_code: 'Y',
  },
  {
    no: 18,
    code_type: 'QUESTION_CATEGORY',
    category_nm: '계정문의',
    service_cd: 'QCAT_ACCOUNT',
    status_code: 'N',
  },
  {
    no: 19,
    code_type: 'QUESTION_CATEGORY',
    category_nm: '이용방법',
    service_cd: 'QCAT_USAGE',
    status_code: 'Y',
  },
  {
    no: 20,
    code_type: 'QUESTION_CATEGORY',
    category_nm: '기타',
    service_cd: 'QCAT_OTHER',
    status_code: 'Y',
  },

  // 연령대 (기존 ageGroupDb 데이터)
  { no: 21, code_type: 'AGE_GROUP', category_nm: '10대', service_cd: 'AGE_10', status_code: 'Y' },
  { no: 22, code_type: 'AGE_GROUP', category_nm: '20대', service_cd: 'AGE_20', status_code: 'Y' },
  { no: 23, code_type: 'AGE_GROUP', category_nm: '30대', service_cd: 'AGE_30', status_code: 'Y' },
  { no: 24, code_type: 'AGE_GROUP', category_nm: '40대', service_cd: 'AGE_40', status_code: 'N' },
  { no: 25, code_type: 'AGE_GROUP', category_nm: '50대', service_cd: 'AGE_50', status_code: 'Y' },
  {
    no: 26,
    code_type: 'AGE_GROUP',
    category_nm: '60대 이상',
    service_cd: 'AGE_60P',
    status_code: 'Y',
  },
];

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

export type ListParams = { page: number; size: number };

export const commonCodeMockDb = {
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

  async listAll(): Promise<CommonCodeItem[]> {
    await delay(100);
    return [...items];
  },

  async delete(service_cd: string) {
    await delay(150);
    items = items.filter((it) => it.service_cd !== service_cd);
    // reassign nos
    items = items.map((it, idx) => ({ ...it, no: idx + 1 }));
    return true;
  },

  async create(input: Omit<CommonCodeItem, 'no'>) {
    await delay(200);
    const nowNo = seq++;
    const newItem: CommonCodeItem = {
      no: nowNo,
      code_type: input.code_type as CodeType,
      category_nm: input.category_nm as string,
      service_cd: input.service_cd as string,
      status_code: input.status_code as string,
    };
    items = [...items, newItem];
    return newItem;
  },

  async update(service_cd: string, input: Partial<CommonCodeItem>) {
    await delay(150);
    items = items.map((it) => (it.service_cd === service_cd ? { ...it, ...input } : it));
    return items.find((it) => it.service_cd === service_cd);
  },

  async reorder(orderedNos: number[]) {
    await delay(200);
    const sorted = orderedNos
      .map((no) => items.find((it) => it.no === no))
      .filter(Boolean) as CommonCodeItem[];
    items = sorted.map((it, idx) => ({ ...it, no: idx + 1 }));
    return [...items];
  },
};
