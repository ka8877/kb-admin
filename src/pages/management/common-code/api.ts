// 공통코드 관련 API 함수
// 순수 함수로 비즈니스 로직만 담당 (React Query와 독립적)

import { getApi, postApi, putApi, deleteApi } from '@/utils/apiUtils';
import { API_ENDPOINTS } from '@/constants/endpoints';
import { env } from '@/config';
import type {
  CodeGroup,
  CodeItem,
  CodeGroupDisplay,
  CodeItemDisplay,
  ServiceMapping,
  QuestionMapping,
} from './types';

// Firebase POST 응답 타입
interface FirebasePostResponse {
  name: string;
}

const codeGroupsBasePath = 'management/common-code/code-groups';
const codeItemsBasePath = 'management/common-code/code-items';
const codeMappingsBasePath = 'management/common-code/code-mappings';

/**
 * Firebase 키에서 코드 생성 헬퍼 함수
 * 키의 뒤 6자리를 추출하고 대문자를 소문자로 변환하여 code_ 접두사 추가
 * (중복 방지를 위해 4자리 대신 6자리 사용 - 약 1600만 가지 조합)
 * @param firebaseKey Firebase 자동 생성 키
 * @returns code_xxxxxx 형식의 코드
 */
const generateCodeFromFirebaseKey = (firebaseKey: string): string => {
  // 뒤 6자리 추출 (중복 방지를 위해 4자리 대신 6자리 사용)
  const last6 = firebaseKey.slice(-6);
  // 대문자를 소문자로 변환
  const lowercased = last6.toLowerCase();
  // code_ 접두사 추가
  return `code_${lowercased}`;
};

/**
 * CodeGroup 변환 헬퍼 함수
 */
const transformCodeGroupItem = (
  v: Partial<CodeGroup> & Record<string, unknown>,
  options: { index: number; fallbackId?: string | number }
): CodeGroup => {
  const { fallbackId } = options;

  return {
    code_group_id: v.code_group_id || (fallbackId ? Number(fallbackId) : 0),
    group_code: v.group_code || '',
    group_name: v.group_name || '',
    is_active: v.is_active ?? 1,
    created_by: v.created_by || 0,
    created_at: v.created_at || new Date().toISOString(),
    updated_by: v.updated_by || null,
    updated_at: v.updated_at || null,
    firebaseKey: v.firebaseKey,
  };
};

/**
 * Firebase 응답 데이터를 CodeGroup 배열로 변환하는 헬퍼 함수
 */
const transformCodeGroups = (raw: unknown): CodeGroup[] => {
  if (!raw) return [];

  // 배열 형태 응답
  if (Array.isArray(raw)) {
    return raw
      .map((item, index) => {
        if (!item) return null;
        const v = item as Partial<CodeGroup> & Record<string, unknown>;
        return transformCodeGroupItem(v, { index });
      })
      .filter((item): item is CodeGroup => item !== null);
  }

  // 객체 형태 응답 (Firebase에서 ID를 키로 사용하는 경우)
  if (typeof raw === 'object' && raw !== null) {
    const entries = Object.entries(raw as Record<string, unknown>);
    return entries
      .map(([firebaseKey, value], index) => {
        const v = value as Partial<CodeGroup> & Record<string, unknown>;
        return transformCodeGroupItem({ ...v, firebaseKey }, { index, fallbackId: firebaseKey });
      })
      .filter((item) => item !== null);
  }

  return [];
};

/**
 * CodeItem 변환 헬퍼 함수
 */
const transformCodeItemItem = (
  v: Partial<CodeItem> & Record<string, unknown>,
  options: { index: number; fallbackId?: string | number }
): CodeItem | null => {
  const { fallbackId } = options;

  // code가 없으면 firebaseKey를 기반으로 code 생성
  let code = v.code || '';
  if (!code && v.firebaseKey) {
    code = generateCodeFromFirebaseKey(v.firebaseKey as string);
  } else if (!code && fallbackId) {
    code = generateCodeFromFirebaseKey(fallbackId as string);
  }

  // 유효한 데이터만 변환 (code_name, code_group_id가 있어야 함)
  if (!code || !v.code_name || !v.code_group_id || v.code_group_id === 0) {
    return null;
  }

  // code_item_id 결정: v.code_item_id가 있으면 사용, 없으면 fallbackId를 숫자로 변환 시도
  let codeItemId = v.code_item_id || 0;
  if (!codeItemId && fallbackId) {
    const numericId = typeof fallbackId === 'number' ? fallbackId : Number(fallbackId);
    // NaN이 아니면 사용, NaN이면 0
    codeItemId = isNaN(numericId) ? 0 : numericId;
  }

  return {
    code_item_id: codeItemId,
    code_group_id: v.code_group_id || 0,
    code: code,
    code_name: v.code_name || '',
    sort_order: v.sort_order ?? 0,
    is_active: v.is_active ?? 1,
    created_by: v.created_by || 0,
    created_at: v.created_at || new Date().toISOString(),
    updated_by: v.updated_by || null,
    updated_at: v.updated_at || null,
    firebaseKey: v.firebaseKey,
  };
};

/**
 * Firebase 응답 데이터를 CodeItem 배열로 변환하는 헬퍼 함수
 */
const transformCodeItems = (raw: unknown): CodeItem[] => {
  if (!raw) return [];

  // 배열 형태 응답
  if (Array.isArray(raw)) {
    return raw
      .map((item, index) => {
        if (!item) return null;
        const v = item as Partial<CodeItem> & Record<string, unknown>;
        return transformCodeItemItem(v, { index });
      })
      .filter((item): item is CodeItem => item !== null);
  }

  // 객체 형태 응답
  if (typeof raw === 'object' && raw !== null) {
    const entries = Object.entries(raw as Record<string, unknown>);

    const transformed = entries
      .map(([firebaseKey, value], index) => {
        const v = value as Partial<CodeItem> & Record<string, unknown>;
        return transformCodeItemItem({ ...v, firebaseKey }, { index, fallbackId: firebaseKey });
      })
      .filter((item): item is CodeItem => item !== null);

    return transformed;
  }

  return [];
};

// ======================
// 코드그룹 (cm_code_group) API
// ======================

/**
 * 코드그룹 목록 조회
 */
export const fetchCodeGroups = async (): Promise<CodeGroupDisplay[]> => {
  const response = await getApi<CodeGroup[]>(API_ENDPOINTS.COMMON_CODE.CODE_GROUPS, {
    baseURL: env.testURL,
    transform: transformCodeGroups,
    errorMessage: '코드그룹 목록을 불러오지 못했습니다.',
  });

  // 화면 표시용 no 추가 및 is_active로 정렬
  return response.data
    .sort((a, b) => b.is_active - a.is_active)
    .map((item, index) => ({
      ...item,
      no: index + 1,
    }));
};

/**
 * 코드그룹 상세 조회
 */
export const fetchCodeGroup = async (codeGroupId: number): Promise<CodeGroup> => {
  const response = await getApi<unknown>(API_ENDPOINTS.COMMON_CODE.CODE_GROUP_DETAIL(codeGroupId), {
    baseURL: env.testURL,
    errorMessage: '코드그룹 상세 데이터를 불러오지 못했습니다.',
  });

  const item = response.data as Partial<CodeGroup>;
  return {
    code_group_id: item.code_group_id || codeGroupId,
    group_code: item.group_code || '',
    group_name: item.group_name || '',
    is_active: item.is_active ?? 1,
    created_by: item.created_by || 0,
    created_at: item.created_at || new Date().toISOString(),
    updated_by: item.updated_by || null,
    updated_at: item.updated_at || null,
  };
};

/**
 * 코드그룹 수정
 */
export const updateCodeGroup = async (
  codeGroupId: number,
  data: Partial<Omit<CodeGroup, 'code_group_id' | 'created_by' | 'created_at'>>,
  firebaseKey?: string
): Promise<CodeGroup> => {
  const updateData = {
    ...data,
    updated_by: 1, // TODO: 실제 로그인 사용자 ID로 교체
    updated_at: new Date().toISOString(),
  };

  // firebaseKey가 있으면 사용, 없으면 codeGroupId 사용
  const endpointKey = firebaseKey || codeGroupId;

  const response = await putApi<CodeGroup>(
    `/${codeGroupsBasePath}/${endpointKey}.json`,
    updateData,
    {
      baseURL: env.testURL,
      errorMessage: '코드그룹 수정에 실패했습니다.',
    }
  );

  return response.data;
};

/**
 * 코드그룹 삭제
 */
export const deleteCodeGroup = async (params: {
  codeGroupId: number;
  firebaseKey?: string;
}): Promise<void> => {
  const { codeGroupId, firebaseKey } = params;
  const endpointKey = firebaseKey || codeGroupId;

  await deleteApi(`/${codeGroupsBasePath}/${endpointKey}.json`, {
    baseURL: env.testURL,
    errorMessage: '코드그룹 삭제에 실패했습니다.',
  });
};

// ======================
// 코드아이템 (cm_code_item) API
// ======================

/**
 * 코드아이템 목록 조회 파라미터
 */
export interface FetchCodeItemsParams {
  /** 코드그룹 ID 필터 */
  codeGroupId?: number;
  /** 사용 여부 필터 (1=활성, 0=비활성) */
  isActive?: number;
}

/**
 * 코드아이템 목록 조회 (code_group_id로 직접 필터링)
 */
export const fetchCodeItems = async (params?: FetchCodeItemsParams): Promise<CodeItemDisplay[]> => {
  const { codeGroupId, isActive } = params || {};

  // 코드아이템 조회
  const response = await getApi<CodeItem[]>(API_ENDPOINTS.COMMON_CODE.CODE_ITEMS, {
    baseURL: env.testURL,
    transform: transformCodeItems,
    errorMessage: '코드아이템 데이터를 불러오지 못했습니다.',
  });

  // 코드그룹 정보 조회 (group_code를 조인하기 위해)
  const groupsResponse = await getApi<CodeGroup[]>(API_ENDPOINTS.COMMON_CODE.CODE_GROUPS, {
    baseURL: env.testURL,
    transform: transformCodeGroups,
    errorMessage: '코드그룹 데이터를 불러오지 못했습니다.',
  });

  // 클라이언트 사이드 필터링
  let filteredData = response.data;
  if (codeGroupId !== undefined) {
    filteredData = filteredData.filter((item) => item.code_group_id === codeGroupId);
  }
  if (isActive !== undefined) {
    filteredData = filteredData.filter((item) => item.is_active === isActive);
  }

  // sort_order로 정렬 후 화면 표시용 no 추가 및 group_code 조인
  return filteredData
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((item, index) => {
      const group = groupsResponse.data.find((g) => g.code_group_id === item.code_group_id);
      return {
        ...item,
        no: index + 1,
        group_code: group?.group_code,
        group_name: group?.group_name,
      };
    });
};

/**
 * 코드아이템 상세 조회
 */
export const fetchCodeItem = async (codeItemId: number): Promise<CodeItem> => {
  const response = await getApi<unknown>(API_ENDPOINTS.COMMON_CODE.CODE_ITEM_DETAIL(codeItemId), {
    baseURL: env.testURL,
    errorMessage: '코드아이템 상세 데이터를 불러오지 못했습니다.',
  });

  const item = response.data as Partial<CodeItem>;
  return {
    code_item_id: item.code_item_id || codeItemId,
    code_group_id: item.code_group_id || 0,
    code: item.code || '',
    code_name: item.code_name || '',
    sort_order: item.sort_order ?? 0,
    is_active: item.is_active ?? 1,
    created_by: item.created_by || 0,
    created_at: item.created_at || new Date().toISOString(),
    updated_by: item.updated_by || null,
    updated_at: item.updated_at || null,
  };
};

/**
 * 코드그룹 생성
 */
export const createCodeGroup = async (
  data: Omit<CodeGroup, 'code_group_id' | 'created_by' | 'created_at' | 'updated_by' | 'updated_at'>
): Promise<CodeGroup> => {
  // Firebase에서는 Auto Increment가 없으므로 클라이언트에서 ID 생성
  const timestamp = Date.now();
  // eslint-disable-next-line @typescript-eslint/naming-convention
  const code_group_id = timestamp;

  const newData = {
    ...data,
    code_group_id,
    created_by: 1, // TODO: 실제 로그인 사용자 ID로 교체
    created_at: new Date().toISOString(),
  };

  const response = await postApi<CodeGroup>(API_ENDPOINTS.COMMON_CODE.CODE_GROUP_CREATE, newData, {
    baseURL: env.testURL,
    errorMessage: '코드그룹 생성에 실패했습니다.',
  });

  return response.data;
};

/**
 * 코드아이템 수정
 */
export const updateCodeItem = async (
  codeItemId: number,
  data: Partial<Omit<CodeItem, 'code_item_id' | 'created_by' | 'created_at'>>
): Promise<CodeItem> => {
  const { firebaseKey, ...restData } = data;
  const updateData = {
    ...restData,
    updated_by: 1, // TODO: 실제 로그인 사용자 ID로 교체
    updated_at: new Date().toISOString(),
  };

  // Firebase 키가 있으면 해당 키로 업데이트, 없으면 code_item_id 사용
  const endpointKey = firebaseKey || codeItemId;

  const response = await putApi<CodeItem>(
    API_ENDPOINTS.COMMON_CODE.CODE_ITEM_UPDATE(endpointKey),
    updateData,
    {
      baseURL: env.testURL,
      errorMessage: '코드아이템 수정에 실패했습니다.',
    }
  );

  return response.data;
};

/**
 * 코드아이템 생성
 */
export const createCodeItem = async (
  data: Omit<CodeItem, 'code_item_id' | 'created_by' | 'created_at' | 'updated_by' | 'updated_at'>
): Promise<CodeItem> => {
  // Firebase에서는 Auto Increment가 없으므로 클라이언트에서 ID 생성
  const timestamp = Date.now();
  // eslint-disable-next-line @typescript-eslint/naming-convention
  const code_item_id = timestamp;

  // 코드가 비어있으면 일단 임시로 저장 (나중에 firebaseKey로 업데이트)
  const codeValue = data.code && data.code.trim() !== '' ? data.code : null;

  const newData = {
    ...data,
    code: codeValue,
    code_item_id,
    created_by: 1, // TODO: 실제 로그인 사용자 ID로 교체
    created_at: new Date().toISOString(),
  };

  const response = await postApi<FirebasePostResponse>(
    API_ENDPOINTS.COMMON_CODE.CODE_ITEM_CREATE,
    newData,
    {
      baseURL: env.testURL,
      errorMessage: '코드아이템 생성에 실패했습니다.',
    }
  );

  // Firebase POST 응답: {name: "생성된키"}
  const firebaseKey = response.data.name;

  // 코드가 없었던 경우 Firebase 키에서 코드 생성
  const finalCode = codeValue || generateCodeFromFirebaseKey(firebaseKey);

  if (!codeValue) {
    // Firebase에 code 필드를 생성된 코드로 업데이트
    await putApi(`${codeItemsBasePath}/${firebaseKey}/code.json`, finalCode, {
      baseURL: env.testURL,
      errorMessage: '코드 업데이트에 실패했습니다.',
    });
  }

  // 생성된 아이템 반환
  const createdItem: CodeItem = {
    ...newData,
    code: finalCode,
    firebaseKey: firebaseKey,
    code_item_id,
    created_by: 1,
    created_at: newData.created_at,
    updated_by: null,
    updated_at: null,
  };

  return createdItem;
};

/**
 * 코드아이템 삭제
 */
export const deleteCodeItem = async (codeItemId: number, firebaseKey?: string): Promise<void> => {
  const endpointKey = firebaseKey || codeItemId;

  await deleteApi(API_ENDPOINTS.COMMON_CODE.CODE_ITEM_DELETE(endpointKey), {
    baseURL: env.testURL,
    errorMessage: '코드아이템 삭제에 실패했습니다.',
  });
};

/**
 * 여러 코드아이템을 한 번에 삭제
 */
export const deleteCodeItems = async (
  items: Array<{ codeItemId: number; firebaseKey?: string }>
): Promise<void> => {
  if (items.length === 0) {
    return;
  }

  // Firebase Multi-Path Update를 사용하여 일괄 삭제
  const updates: { [key: string]: null } = {};

  items.forEach(({ codeItemId, firebaseKey }) => {
    const endpointKey = firebaseKey || codeItemId;
    const path = `${codeItemsBasePath}/${endpointKey}`;
    updates[path] = null;
  });

  if (Object.keys(updates).length === 0) {
    return;
  }

  const databaseUrl = env.testURL.replace(/\/$/, '');
  const updatesUrl = `${databaseUrl}/.json`;

  const response = await fetch(updatesUrl, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updates),
  });

  if (!response.ok) {
    throw new Error(`코드아이템 일괄 삭제에 실패했습니다. (${response.status})`);
  }
};

// ======================
// ServiceMapping (서비스코드 ↔ 서비스명) API
// ======================

/**
 * ServiceMapping 변환 헬퍼 함수
 */
const transformServiceMappingItem = (
  v: Partial<ServiceMapping> & Record<string, unknown>,
  options: { index: number; fallbackId?: string | number }
): ServiceMapping | null => {
  const { fallbackId } = options;

  if (!v.parent_code_item_id || !v.child_code_item_id) {
    return null;
  }

  return {
    code_mapping_id: v.code_mapping_id || (fallbackId ? Number(fallbackId) : 0),
    mapping_type: 'SERVICE',
    parent_code_item_id: v.parent_code_item_id,
    child_code_item_id: v.child_code_item_id,
    sort_order: v.sort_order ?? 0,
    is_active: v.is_active ?? 1,
    created_by: v.created_by || 0,
    created_at: v.created_at || new Date().toISOString(),
    updated_by: v.updated_by || null,
    updated_at: v.updated_at || null,
    firebaseKey: fallbackId as string,
  };
};

/**
 * Firebase 응답을 ServiceMapping 배열로 변환
 */
const transformServiceMappings = (raw: unknown): ServiceMapping[] => {
  if (!raw) return [];

  if (typeof raw === 'object' && raw !== null) {
    const entries = Object.entries(raw as Record<string, unknown>);
    return entries
      .map(([firebaseKey, value], index) => {
        const v = value as Partial<ServiceMapping> & Record<string, unknown>;
        return transformServiceMappingItem(v, { index, fallbackId: firebaseKey });
      })
      .filter((item): item is ServiceMapping => item !== null);
  }

  return [];
};

/**
 * 서비스 매핑 목록 조회
 */
export const fetchServiceMappings = async (): Promise<ServiceMapping[]> => {
  const response = await getApi<ServiceMapping[]>(`${codeMappingsBasePath}.json`, {
    baseURL: env.testURL,
    transform: transformServiceMappings,
    errorMessage: '서비스 매핑 데이터를 불러오지 못했습니다.',
  });

  // mapping_type이 'SERVICE'인 것만 필터링
  return response.data.filter((item) => item.mapping_type === 'SERVICE');
};

/**
 * 서비스 매핑 생성/수정 (upsert)
 */
export const upsertServiceMapping = async (
  data: Omit<
    ServiceMapping,
    'code_mapping_id' | 'created_by' | 'created_at' | 'updated_by' | 'updated_at' | 'firebaseKey'
  > & { firebaseKey?: string }
): Promise<ServiceMapping> => {
  const timestamp = Date.now();
  // eslint-disable-next-line @typescript-eslint/naming-convention
  const code_mapping_id = timestamp;

  const mappingData = {
    ...data,
    code_mapping_id,
    mapping_type: 'SERVICE' as const,
    created_by: 1,
    created_at: new Date().toISOString(),
  };

  // firebaseKey가 있으면 해당 위치에 저장 (update), 없으면 새로 생성 (create)
  const path = data.firebaseKey
    ? `${codeMappingsBasePath}/${data.firebaseKey}.json`
    : `${codeMappingsBasePath}.json`;

  const response = await (data.firebaseKey ? putApi : postApi)<ServiceMapping>(path, mappingData, {
    baseURL: env.testURL,
    errorMessage: '서비스 매핑 저장에 실패했습니다.',
  });

  return response.data;
};

/**
 * 서비스 매핑 삭제
 */
export const deleteServiceMapping = async (firebaseKey: string): Promise<void> => {
  await deleteApi(`${codeMappingsBasePath}/${firebaseKey}.json`, {
    baseURL: env.testURL,
    errorMessage: '서비스 매핑 삭제에 실패했습니다.',
  });
};

// ======================
// QuestionMapping (서비스코드 ↔ 질문카테고리) API
// ======================

/**
 * QuestionMapping 변환 헬퍼 함수
 */
const transformQuestionMappingItem = (
  v: Partial<QuestionMapping> & Record<string, unknown>,
  options: { index: number; fallbackId?: string | number }
): QuestionMapping | null => {
  const { fallbackId } = options;

  if (!v.parent_code_item_id || !v.child_code_item_id) {
    return null;
  }

  return {
    code_mapping_id: v.code_mapping_id || (fallbackId ? Number(fallbackId) : 0),
    mapping_type: 'QUESTION',
    parent_code_item_id: v.parent_code_item_id,
    child_code_item_id: v.child_code_item_id,
    sort_order: v.sort_order ?? 0,
    is_active: v.is_active ?? 1,
    created_by: v.created_by || 0,
    created_at: v.created_at || new Date().toISOString(),
    updated_by: v.updated_by || null,
    updated_at: v.updated_at || null,
    firebaseKey: fallbackId as string,
  };
};

/**
 * Firebase 응답을 QuestionMapping 배열로 변환
 */
const transformQuestionMappings = (raw: unknown): QuestionMapping[] => {
  if (!raw) return [];

  if (typeof raw === 'object' && raw !== null) {
    const entries = Object.entries(raw as Record<string, unknown>);
    return entries
      .map(([firebaseKey, value], index) => {
        const v = value as Partial<QuestionMapping> & Record<string, unknown>;
        return transformQuestionMappingItem(v, { index, fallbackId: firebaseKey });
      })
      .filter((item): item is QuestionMapping => item !== null);
  }

  return [];
};

/**
 * 질문 매핑 목록 조회
 */
export const fetchQuestionMappings = async (params?: {
  serviceCodeItemId?: number;
}): Promise<QuestionMapping[]> => {
  const response = await getApi<QuestionMapping[]>(`${codeMappingsBasePath}.json`, {
    baseURL: env.testURL,
    transform: transformQuestionMappings,
    errorMessage: '질문 매핑 데이터를 불러오지 못했습니다.',
  });

  let filteredData = response.data.filter((item) => item.mapping_type === 'QUESTION');

  // 필터링
  if (params?.serviceCodeItemId) {
    filteredData = filteredData.filter(
      (item) => item.parent_code_item_id === params.serviceCodeItemId
    );
  }

  return filteredData;
};

/**
 * 질문 매핑 생성
 */
export const createQuestionMapping = async (
  data: Omit<
    QuestionMapping,
    'code_mapping_id' | 'created_by' | 'created_at' | 'updated_by' | 'updated_at' | 'firebaseKey'
  >
): Promise<QuestionMapping> => {
  const timestamp = Date.now();
  // eslint-disable-next-line @typescript-eslint/naming-convention
  const code_mapping_id = timestamp;

  const newData = {
    ...data,
    code_mapping_id,
    mapping_type: 'QUESTION' as const,
    created_by: 1,
    created_at: new Date().toISOString(),
  };

  const response = await postApi<QuestionMapping>(`${codeMappingsBasePath}.json`, newData, {
    baseURL: env.testURL,
    errorMessage: '질문 매핑 생성에 실패했습니다.',
  });

  return response.data;
};

/**
 * 질문 매핑 삭제
 */
export const deleteQuestionMapping = async (firebaseKey: string): Promise<void> => {
  await deleteApi(`${codeMappingsBasePath}/${firebaseKey}.json`, {
    baseURL: env.testURL,
    errorMessage: '질문 매핑 삭제에 실패했습니다.',
  });
};

/**
 * 특정 서비스의 모든 질문 매핑 삭제
 */
export const deleteQuestionMappingsByService = async (serviceCodeItemId: number): Promise<void> => {
  const mappings = await fetchQuestionMappings({ serviceCodeItemId });

  if (mappings.length === 0) {
    return;
  }

  const updates: { [key: string]: null } = {};
  mappings.forEach((mapping) => {
    if (mapping.firebaseKey) {
      const path = `${codeMappingsBasePath}/${mapping.firebaseKey}`;
      updates[path] = null;
    }
  });

  const databaseUrl = env.testURL.replace(/\/$/, '');
  const updatesUrl = `${databaseUrl}/.json`;

  const response = await fetch(updatesUrl, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updates),
  });

  if (!response.ok) {
    throw new Error(`질문 매핑 일괄 삭제에 실패했습니다. (${response.status})`);
  }
};
