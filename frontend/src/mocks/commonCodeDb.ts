// Temporary in-memory mock DB for Common Code management
// Single source of truth for all category data (Service Names, Question Categories, Age Groups)

export type CodeType = string; // 동적으로 추가 가능한 코드 타입

export interface CodeTypeOption {
  value: string;
  label: string;
}

export interface CommonCodeItem extends Record<string, unknown> {
  no: number;
  code_type: CodeType;
  category_nm: string;
  service_cd: string; // 각 타입의 고유 코드 (서비스명: service_cd, 질문: qst_ctgr_cd, 연령대: age_grp_cd)
  status_code: string;
  parent_service_cd?: string; // 질문 카테고리가 속한 서비스 코드 (ai_search 등)
  service_group_name?: string; // 질문 카테고리의 서비스 그룹명 (AI 검색, AI 금융계산기 등)
}

// 서비스명 타입
export type ServiceNameItem = {
  no: number;
  service_cd: string;
  service_nm: string;
  category_nm: string;
  display_yn: string;
  sort_order: number;
};

// 질문 카테고리 타입
export type QuestionCategoryItem = {
  no: number;
  qst_ctgr_cd: string;
  service_cd: string;
  service_group_name?: string; // 서비스 그룹명 (AI 검색, AI 금융계산기 등)
  qst_ctgr_nm: string;
  display_yn: string;
  sort_order: number;
};

// 연령대 타입
export type AgeGroupItem = {
  no: number;
  age_grp_cd: string;
  age_grp_nm: string;
  display_yn: string;
  sort_order: number;
};

let codeTypeList: CodeTypeOption[] = [
  { value: 'SERVICE_NAME', label: '서비스명' },
  { value: 'QUESTION_CATEGORY', label: '질문 카테고리' },
  { value: 'AGE_GROUP', label: '연령대' },
];

let serviceGroupList: CodeTypeOption[] = [
  { value: 'AI 검색', label: 'AI 검색' },
  { value: 'AI 금융계산기', label: 'AI 금융계산기' },
  { value: 'AI 이체', label: 'AI 이체' },
  { value: 'AI 모임총무', label: 'AI 모임총무' },
];

// 서비스명 Mock 데이터
let serviceNameMockData: ServiceNameItem[] = [
  {
    no: 1,
    service_cd: 'ai_search',
    service_nm: 'AI 검색',
    category_nm: '서비스명',
    display_yn: 'Y',
    sort_order: 1,
  },
  {
    no: 2,
    service_cd: 'ai_calc',
    service_nm: 'AI 금융계산기',
    category_nm: '서비스명',
    display_yn: 'Y',
    sort_order: 2,
  },
  {
    no: 3,
    service_cd: 'ai_transfer',
    service_nm: 'AI 이체',
    category_nm: '서비스명',
    display_yn: 'Y',
    sort_order: 3,
  },
  {
    no: 4,
    service_cd: 'ai_shared_account',
    service_nm: 'AI 모임총무',
    category_nm: '서비스명',
    display_yn: 'Y',
    sort_order: 4,
  },
];

// 질문 카테고리 Mock 데이터
let questionCategoryMockData: QuestionCategoryItem[] = [
  // AI 검색
  {
    no: 1,
    qst_ctgr_cd: 'ai_search_mid',
    service_cd: 'ai_search',
    service_group_name: 'AI 검색',
    qst_ctgr_nm: 'mid (엔어드민아이디)',
    display_yn: 'Y',
    sort_order: 1,
  },
  {
    no: 2,
    qst_ctgr_cd: 'ai_search_story',
    service_cd: 'ai_search',
    service_group_name: 'AI 검색',
    qst_ctgr_nm: 'story (돈이뭔놈이야기)',
    display_yn: 'Y',
    sort_order: 2,
  },
  {
    no: 3,
    qst_ctgr_cd: 'ai_search_child',
    service_cd: 'ai_search',
    service_group_name: 'AI 검색',
    qst_ctgr_nm: 'child (아동보호)',
    display_yn: 'Y',
    sort_order: 3,
  },
  {
    no: 4,
    qst_ctgr_cd: 'ai_search_promo',
    service_cd: 'ai_search',
    service_group_name: 'AI 검색',
    qst_ctgr_nm: 'promo (프로모션)',
    display_yn: 'Y',
    sort_order: 4,
  },
  {
    no: 5,
    qst_ctgr_cd: 'ai_search_signature',
    service_cd: 'ai_search',
    service_group_name: 'AI 검색',
    qst_ctgr_nm: 'signature (시그니처)',
    display_yn: 'Y',
    sort_order: 5,
  },
  // AI 금융계산기
  {
    no: 6,
    qst_ctgr_cd: 'ai_calc_save',
    service_cd: 'ai_calc',
    service_group_name: 'AI 금융계산기',
    qst_ctgr_nm: 'save (저축)',
    display_yn: 'Y',
    sort_order: 6,
  },
  {
    no: 7,
    qst_ctgr_cd: 'ai_calc_loan',
    service_cd: 'ai_calc',
    service_group_name: 'AI 금융계산기',
    qst_ctgr_nm: 'loan (대출)',
    display_yn: 'Y',
    sort_order: 7,
  },
  {
    no: 8,
    qst_ctgr_cd: 'ai_calc_exchange',
    service_cd: 'ai_calc',
    service_group_name: 'AI 금융계산기',
    qst_ctgr_nm: 'exchange (환율)',
    display_yn: 'Y',
    sort_order: 8,
  },
  // AI 이체
  {
    no: 9,
    qst_ctgr_cd: 'ai_transfer_svc_intro',
    service_cd: 'ai_transfer',
    service_group_name: 'AI 이체',
    qst_ctgr_nm: 'svc_intro',
    display_yn: 'Y',
    sort_order: 9,
  },
  {
    no: 10,
    qst_ctgr_cd: 'ai_transfer_trn_nick',
    service_cd: 'ai_transfer',
    service_group_name: 'AI 이체',
    qst_ctgr_nm: 'trn_nick',
    display_yn: 'Y',
    sort_order: 10,
  },
  {
    no: 11,
    qst_ctgr_cd: 'ai_transfer_sec_auth',
    service_cd: 'ai_transfer',
    service_group_name: 'AI 이체',
    qst_ctgr_nm: 'sec_auth',
    display_yn: 'Y',
    sort_order: 11,
  },
  {
    no: 12,
    qst_ctgr_cd: 'ai_transfer_mstk_trn',
    service_cd: 'ai_transfer',
    service_group_name: 'AI 이체',
    qst_ctgr_nm: 'mstk_trn',
    display_yn: 'Y',
    sort_order: 12,
  },
  // AI 모임총무
  {
    no: 13,
    qst_ctgr_cd: 'ai_shared_dues_status',
    service_cd: 'ai_shared_account',
    service_group_name: 'AI 모임총무',
    qst_ctgr_nm: 'DUES_STATUS',
    display_yn: 'Y',
    sort_order: 13,
  },
  {
    no: 14,
    qst_ctgr_cd: 'ai_shared_dues_record',
    service_cd: 'ai_shared_account',
    service_group_name: 'AI 모임총무',
    qst_ctgr_nm: 'DUES_RECORD',
    display_yn: 'Y',
    sort_order: 14,
  },
  {
    no: 15,
    qst_ctgr_cd: 'ai_shared_dues_analysis',
    service_cd: 'ai_shared_account',
    service_group_name: 'AI 모임총무',
    qst_ctgr_nm: 'DUES_ANALYSIS',
    display_yn: 'Y',
    sort_order: 15,
  },
  {
    no: 16,
    qst_ctgr_cd: 'ai_shared_expense_overview',
    service_cd: 'ai_shared_account',
    service_group_name: 'AI 모임총무',
    qst_ctgr_nm: 'EXPENSE_OVERVIEW',
    display_yn: 'Y',
    sort_order: 16,
  },
  {
    no: 17,
    qst_ctgr_cd: 'ai_shared_expense_analysis',
    service_cd: 'ai_shared_account',
    service_group_name: 'AI 모임총무',
    qst_ctgr_nm: 'EXPENSE_ANALYSIS',
    display_yn: 'Y',
    sort_order: 17,
  },
  {
    no: 18,
    qst_ctgr_cd: 'ai_shared_moim_dues_status',
    service_cd: 'ai_shared_account',
    service_group_name: 'AI 모임총무',
    qst_ctgr_nm: 'MOIM_DUES_STATUS',
    display_yn: 'Y',
    sort_order: 18,
  },
  {
    no: 19,
    qst_ctgr_cd: 'ai_shared_moim_dues_record',
    service_cd: 'ai_shared_account',
    service_group_name: 'AI 모임총무',
    qst_ctgr_nm: 'MOIM_DUES_RECORD',
    display_yn: 'Y',
    sort_order: 19,
  },
];

// 연령대 Mock 데이터
let ageGroupMockData: AgeGroupItem[] = [
  {
    no: 1,
    age_grp_cd: '10',
    age_grp_nm: '10대',
    display_yn: 'Y',
    sort_order: 1,
  },
  {
    no: 2,
    age_grp_cd: '20',
    age_grp_nm: '20대',
    display_yn: 'Y',
    sort_order: 2,
  },
  {
    no: 3,
    age_grp_cd: '30',
    age_grp_nm: '30대',
    display_yn: 'Y',
    sort_order: 3,
  },
  {
    no: 4,
    age_grp_cd: '40',
    age_grp_nm: '40대',
    display_yn: 'Y',
    sort_order: 4,
  },
  {
    no: 5,
    age_grp_cd: '50',
    age_grp_nm: '50대',
    display_yn: 'Y',
    sort_order: 5,
  },
];

// 기타 동적 코드 타입 데이터 저장소
let otherCodeTypeMockData: CommonCodeItem[] = [];

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

// Helper function to convert category items to CommonCodeItem format
function getCategoryDataAsCommonCode(): CommonCodeItem[] {
  const result: CommonCodeItem[] = [];
  let globalNo = 1;

  // Convert service names
  serviceNameMockData.forEach((item) => {
    result.push({
      no: globalNo++,
      code_type: 'SERVICE_NAME',
      category_nm: item.service_nm,
      service_cd: item.service_cd,
      status_code: item.display_yn,
    });
  });

  // Convert question categories
  questionCategoryMockData.forEach((item) => {
    result.push({
      no: globalNo++,
      code_type: 'QUESTION_CATEGORY',
      category_nm: item.qst_ctgr_nm,
      service_cd: item.qst_ctgr_cd,
      status_code: item.display_yn,
      parent_service_cd: item.service_cd,
      service_group_name: item.service_group_name,
    });
  });

  // Convert age groups
  ageGroupMockData.forEach((item) => {
    result.push({
      no: globalNo++,
      code_type: 'AGE_GROUP',
      category_nm: item.age_grp_nm,
      service_cd: item.age_grp_cd,
      status_code: item.display_yn,
    });
  });

  // Convert other code types
  otherCodeTypeMockData.forEach((item) => {
    result.push({
      no: globalNo++,
      ...item,
    });
  });

  return result;
}

export type ListParams = { page: number; size: number };

// CommonCode DB (for management pages)
export const commonCodeMockDb = {
  async list({ page, size }: ListParams) {
    await delay(200);
    const items = getCategoryDataAsCommonCode();
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
    return getCategoryDataAsCommonCode();
  },

  async delete(service_cd: string) {
    await delay(150);
    const items = getCategoryDataAsCommonCode();
    const item = items.find((it) => it.service_cd === service_cd);

    if (!item) return false;

    switch (item.code_type) {
      case 'SERVICE_NAME':
        serviceNameMockData = serviceNameMockData.filter((it) => it.service_cd !== service_cd);
        break;
      case 'QUESTION_CATEGORY':
        questionCategoryMockData = questionCategoryMockData.filter(
          (it) => it.qst_ctgr_cd !== service_cd,
        );
        break;
      case 'AGE_GROUP':
        ageGroupMockData = ageGroupMockData.filter((it) => it.age_grp_cd !== service_cd);
        break;
      default:
        otherCodeTypeMockData = otherCodeTypeMockData.filter((it) => it.service_cd !== service_cd);
        break;
    }

    return true;
  },

  async create(input: Omit<CommonCodeItem, 'no'>) {
    await delay(200);

    switch (input.code_type) {
      case 'SERVICE_NAME': {
        const newNo =
          serviceNameMockData.length > 0
            ? Math.max(...serviceNameMockData.map((item) => item.no)) + 1
            : 1;
        const newItem: ServiceNameItem = {
          no: newNo,
          service_cd: input.service_cd as string,
          service_nm: input.category_nm as string,
          category_nm: '서비스명',
          display_yn: input.status_code as string,
          sort_order: 999,
        };
        serviceNameMockData = [...serviceNameMockData, newItem];
        return {
          no: newNo,
          code_type: 'SERVICE_NAME' as CodeType,
          category_nm: input.category_nm as string,
          service_cd: input.service_cd as string,
          status_code: input.status_code as string,
        };
      }
      case 'QUESTION_CATEGORY': {
        const newNo =
          questionCategoryMockData.length > 0
            ? Math.max(...questionCategoryMockData.map((item) => item.no)) + 1
            : 1;

        const newItem: QuestionCategoryItem = {
          no: newNo,
          qst_ctgr_cd: input.service_cd as string,
          service_cd: (input.parent_service_cd as string) || '',
          service_group_name: input.service_group_name as string | undefined,
          qst_ctgr_nm: input.category_nm as string,
          display_yn: input.status_code as string,
          sort_order: 999,
        };
        questionCategoryMockData = [...questionCategoryMockData, newItem];
        return {
          no: newNo,
          code_type: 'QUESTION_CATEGORY' as CodeType,
          category_nm: input.category_nm as string,
          service_cd: input.service_cd as string,
          status_code: input.status_code as string,
          parent_service_cd: input.parent_service_cd as string | undefined,
          service_group_name: input.service_group_name as string | undefined,
        };
      }
      case 'AGE_GROUP': {
        const newNo =
          ageGroupMockData.length > 0
            ? Math.max(...ageGroupMockData.map((item) => item.no)) + 1
            : 1;
        const newItem: AgeGroupItem = {
          no: newNo,
          age_grp_cd: input.service_cd as string,
          age_grp_nm: input.category_nm as string,
          display_yn: input.status_code as string,
          sort_order: 999,
        };
        ageGroupMockData = [...ageGroupMockData, newItem];
        return {
          no: newNo,
          code_type: 'AGE_GROUP' as CodeType,
          category_nm: input.category_nm as string,
          service_cd: input.service_cd as string,
          status_code: input.status_code as string,
        };
      }
      default: {
        // 새로운 코드 타입 처리
        const newNo =
          otherCodeTypeMockData.length > 0
            ? Math.max(...otherCodeTypeMockData.map((item) => item.no)) + 1
            : 1;
        const newItem: CommonCodeItem = {
          no: newNo,
          code_type: input.code_type,
          category_nm: input.category_nm as string,
          service_cd: input.service_cd as string,
          status_code: input.status_code as string,
          parent_service_cd: input.parent_service_cd as string | undefined,
          service_group_name: input.service_group_name as string | undefined,
        };
        otherCodeTypeMockData = [...otherCodeTypeMockData, newItem];
        return newItem;
      }
    }
  },

  async update(service_cd: string, input: Partial<CommonCodeItem>) {
    await delay(150);
    const items = getCategoryDataAsCommonCode();
    const item = items.find((it) => it.service_cd === service_cd);

    if (!item) return undefined;

    switch (item.code_type) {
      case 'SERVICE_NAME': {
        const index = serviceNameMockData.findIndex((it) => it.service_cd === service_cd);
        if (index !== -1) {
          serviceNameMockData[index] = {
            ...serviceNameMockData[index],
            service_cd: (input.service_cd as string) || serviceNameMockData[index].service_cd,
            service_nm: (input.category_nm as string) || serviceNameMockData[index].service_nm,
            display_yn: (input.status_code as string) || serviceNameMockData[index].display_yn,
          };
        }
        break;
      }
      case 'QUESTION_CATEGORY': {
        const index = questionCategoryMockData.findIndex((it) => it.qst_ctgr_cd === service_cd);
        if (index !== -1) {
          questionCategoryMockData[index] = {
            ...questionCategoryMockData[index],
            qst_ctgr_cd:
              (input.service_cd as string) || questionCategoryMockData[index].qst_ctgr_cd,
            service_cd:
              (input.parent_service_cd as string) !== undefined
                ? (input.parent_service_cd as string)
                : questionCategoryMockData[index].service_cd,
            qst_ctgr_nm:
              (input.category_nm as string) || questionCategoryMockData[index].qst_ctgr_nm,
            display_yn: (input.status_code as string) || questionCategoryMockData[index].display_yn,
            service_group_name:
              input.service_group_name !== undefined
                ? input.service_group_name
                : questionCategoryMockData[index].service_group_name,
          };
        }
        break;
      }
      case 'AGE_GROUP': {
        const index = ageGroupMockData.findIndex((it) => it.age_grp_cd === service_cd);
        if (index !== -1) {
          ageGroupMockData[index] = {
            ...ageGroupMockData[index],
            age_grp_cd: (input.service_cd as string) || ageGroupMockData[index].age_grp_cd,
            age_grp_nm: (input.category_nm as string) || ageGroupMockData[index].age_grp_nm,
            display_yn: (input.status_code as string) || ageGroupMockData[index].display_yn,
          };
        }
        break;
      }
      default: {
        // 기타 코드 타입 업데이트
        const index = otherCodeTypeMockData.findIndex((it) => it.service_cd === service_cd);
        if (index !== -1) {
          otherCodeTypeMockData[index] = {
            ...otherCodeTypeMockData[index],
            ...(input as Partial<CommonCodeItem>),
          };
        }
        break;
      }
    }

    const updatedItems = getCategoryDataAsCommonCode();
    // service_cd가 변경된 경우 새로운 service_cd로 찾기
    return updatedItems.find(
      (it) => it.service_cd === ((input.service_cd as string) || service_cd),
    );
  },

  async reorder(orderedNos: number[]) {
    await delay(200);
    return getCategoryDataAsCommonCode();
  },

  async getCodeTypes(): Promise<CodeTypeOption[]> {
    await delay(100);
    return [...codeTypeList];
  },
  async saveCodeTypes(newCodeTypes: CodeTypeOption[]): Promise<CodeTypeOption[]> {
    await delay(150);
    codeTypeList = [...newCodeTypes];
    return [...codeTypeList];
  },

  async getServiceGroupOptions(): Promise<string[]> {
    await delay(100);
    return serviceGroupList.map((s) => s.value);
  },

  async getServiceGroups(): Promise<CodeTypeOption[]> {
    await delay(100);
    return [...serviceGroupList];
  },

  async saveServiceGroups(newServiceGroups: CodeTypeOption[]): Promise<CodeTypeOption[]> {
    await delay(150);
    serviceGroupList = [...newServiceGroups];
    return [...serviceGroupList];
  },

  async getServiceNames(): Promise<ServiceNameItem[]> {
    await delay(100);
    return [...serviceNameMockData];
  },

  async createServiceName(input: {
    service_cd: string;
    service_nm: string;
  }): Promise<ServiceNameItem> {
    await delay(150);
    const newNo =
      serviceNameMockData.length > 0
        ? Math.max(...serviceNameMockData.map((item) => item.no)) + 1
        : 1;
    const newItem: ServiceNameItem = {
      no: newNo,
      service_cd: input.service_cd,
      service_nm: input.service_nm,
      category_nm: '서비스명',
      display_yn: 'Y',
      sort_order: 999,
    };
    serviceNameMockData = [...serviceNameMockData, newItem];
    return newItem;
  },
};

// Category DB (for recommended questions pages)
export const categoryMockDb = {
  // 서비스명 - Read
  getServiceNames: async (): Promise<ServiceNameItem[]> => {
    return Promise.resolve([...serviceNameMockData]);
  },

  // 서비스명 - Create
  createServiceName: async (input: Omit<ServiceNameItem, 'no'>): Promise<ServiceNameItem> => {
    const newNo =
      serviceNameMockData.length > 0
        ? Math.max(...serviceNameMockData.map((item) => item.no)) + 1
        : 1;
    const newItem: ServiceNameItem = { no: newNo, ...input };
    serviceNameMockData = [...serviceNameMockData, newItem];
    return Promise.resolve(newItem);
  },

  // 서비스명 - Update
  updateServiceName: async (
    service_cd: string,
    input: Partial<ServiceNameItem>,
  ): Promise<ServiceNameItem | undefined> => {
    const index = serviceNameMockData.findIndex((item) => item.service_cd === service_cd);
    if (index === -1) return Promise.resolve(undefined);
    serviceNameMockData[index] = { ...serviceNameMockData[index], ...input };
    return Promise.resolve(serviceNameMockData[index]);
  },

  // 서비스명 - Delete
  deleteServiceName: async (service_cd: string): Promise<boolean> => {
    const initialLength = serviceNameMockData.length;
    serviceNameMockData = serviceNameMockData.filter((item) => item.service_cd !== service_cd);
    return Promise.resolve(serviceNameMockData.length < initialLength);
  },

  // 질문 카테고리 - Read
  getQuestionCategories: async (): Promise<QuestionCategoryItem[]> => {
    return Promise.resolve([...questionCategoryMockData]);
  },

  getQuestionCategoriesByService: async (serviceCd: string): Promise<QuestionCategoryItem[]> => {
    return Promise.resolve(
      questionCategoryMockData.filter((item) => item.service_cd === serviceCd),
    );
  },

  // 질문 카테고리 - Create
  createQuestionCategory: async (
    input: Omit<QuestionCategoryItem, 'no'>,
  ): Promise<QuestionCategoryItem> => {
    const newNo =
      questionCategoryMockData.length > 0
        ? Math.max(...questionCategoryMockData.map((item) => item.no)) + 1
        : 1;
    const newItem: QuestionCategoryItem = { no: newNo, ...input };
    questionCategoryMockData = [...questionCategoryMockData, newItem];
    return Promise.resolve(newItem);
  },

  // 질문 카테고리 - Update
  updateQuestionCategory: async (
    qst_ctgr_cd: string,
    input: Partial<QuestionCategoryItem>,
  ): Promise<QuestionCategoryItem | undefined> => {
    const index = questionCategoryMockData.findIndex((item) => item.qst_ctgr_cd === qst_ctgr_cd);
    if (index === -1) return Promise.resolve(undefined);
    questionCategoryMockData[index] = { ...questionCategoryMockData[index], ...input };
    return Promise.resolve(questionCategoryMockData[index]);
  },

  // 질문 카테고리 - Delete
  deleteQuestionCategory: async (qst_ctgr_cd: string): Promise<boolean> => {
    const initialLength = questionCategoryMockData.length;
    questionCategoryMockData = questionCategoryMockData.filter(
      (item) => item.qst_ctgr_cd !== qst_ctgr_cd,
    );
    return Promise.resolve(questionCategoryMockData.length < initialLength);
  },

  // 연령대 - Read
  getAgeGroups: async (): Promise<AgeGroupItem[]> => {
    return Promise.resolve([...ageGroupMockData]);
  },

  // 연령대 - Create
  createAgeGroup: async (input: Omit<AgeGroupItem, 'no'>): Promise<AgeGroupItem> => {
    const newNo =
      ageGroupMockData.length > 0 ? Math.max(...ageGroupMockData.map((item) => item.no)) + 1 : 1;
    const newItem: AgeGroupItem = { no: newNo, ...input };
    ageGroupMockData = [...ageGroupMockData, newItem];
    return Promise.resolve(newItem);
  },

  // 연령대 - Update
  updateAgeGroup: async (
    age_grp_cd: string,
    input: Partial<AgeGroupItem>,
  ): Promise<AgeGroupItem | undefined> => {
    const index = ageGroupMockData.findIndex((item) => item.age_grp_cd === age_grp_cd);
    if (index === -1) return Promise.resolve(undefined);
    ageGroupMockData[index] = { ...ageGroupMockData[index], ...input };
    return Promise.resolve(ageGroupMockData[index]);
  },

  // 연령대 - Delete
  deleteAgeGroup: async (age_grp_cd: string): Promise<boolean> => {
    const initialLength = ageGroupMockData.length;
    ageGroupMockData = ageGroupMockData.filter((item) => item.age_grp_cd !== age_grp_cd);
    return Promise.resolve(ageGroupMockData.length < initialLength);
  },
};
