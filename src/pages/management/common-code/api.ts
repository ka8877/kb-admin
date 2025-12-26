// 공통코드 관련 API 함수
// API spec 5) 공통코드 섹션 기준으로 작성

import { getApi, postApi } from '@/utils/apiUtils';
import { API_ENDPOINTS } from '@/constants/endpoints';
import type {
  CodeGroup,
  CodeItem,
  CodeGroupDisplay,
  CodeItemDisplay,
  ServiceMapping,
  QuestionMapping,
  ServiceMappingDisplay,
  QuestionMappingDisplay,
} from './types';
import { env } from '@/config';

// ======================
// 코드그룹 (cm_code_group) API
// ======================

/**
 * 코드그룹 목록 조회
 * API spec: GET /api/v1/common-codes/groups?includeInactive=false
 */
export const fetchCodeGroups = async (params?: {
  includeInactive?: boolean;
}): Promise<CodeGroupDisplay[]> => {
  const { includeInactive = false } = params || {};

  const response = await getApi<CodeGroup[]>(API_ENDPOINTS.COMMON_CODE.CODE_GROUPS, {
    params: { includeInactive },
    errorMessage: '코드그룹 목록을 불러오지 못했습니다.',
  });

  const items = Array.isArray(response.data) ? response.data : [];

  // 활성 상태로 정렬 후 화면 표시용 no 추가
  return items
    .sort((a, b) => (b.isActive ? 1 : 0) - (a.isActive ? 1 : 0))
    .map((item, index) => ({
      ...item,
      no: index + 1,
    }));
};

/**
 * 코드그룹 생성
 * API spec: POST /api/v1/common-codes/groups
 */
export const createCodeGroup = async (data: {
  groupCode: string;
  groupName: string;
}): Promise<CodeGroup> => {
  const response = await postApi<CodeGroup>(API_ENDPOINTS.COMMON_CODE.CODE_GROUP_CREATE, data, {
    errorMessage: '코드그룹 생성에 실패했습니다.',
  });

  return response.data;
};

/**
 * 코드그룹 수정
 * API spec: POST /api/v1/common-codes/groups/{groupCode}
 */
export const updateCodeGroup = async (
  groupCode: string,
  data: { groupName: string },
): Promise<void> => {
  await postApi(API_ENDPOINTS.COMMON_CODE.CODE_GROUP_UPDATE(groupCode), data, {
    errorMessage: '코드그룹 수정에 실패했습니다.',
  });
};

/**
 * 코드그룹 비활성화
 * API spec: POST /api/v1/common-codes/groups/{groupCode}/deactivate
 */
export const deactivateCodeGroup = async (groupCode: string): Promise<void> => {
  await postApi(API_ENDPOINTS.COMMON_CODE.CODE_GROUP_DEACTIVATE(groupCode), {}, {
    errorMessage: '코드그룹 비활성화에 실패했습니다.',
  });
};

// 하위 호환성을 위한 함수들
export const fetchCodeGroup = async (groupCode: string): Promise<CodeGroup> => {
  const response = await getApi<CodeGroup>(API_ENDPOINTS.COMMON_CODE.CODE_GROUP_DETAIL(groupCode), {
    errorMessage: '코드그룹 상세 데이터를 불러오지 못했습니다.',
  });
  return response.data;
};

export const deleteCodeGroup = async (params: { groupCode: string }): Promise<void> => {
  await deactivateCodeGroup(params.groupCode);
};

// ======================
// 코드아이템 (cm_code_item) API
// ======================

/**
 * 코드아이템 목록 조회 파라미터
 */
export interface FetchCodeItemsParams {
  /** 코드그룹 코드 */
  groupCode: string;
  /** 사용 여부 필터 */
  includeInactive?: boolean;
}

/**
 * 코드아이템 목록 조회
 * API spec: GET /api/v1/common-codes/groups/{groupCode}/items?includeInactive=false
 */
export const fetchCodeItems = async (params: FetchCodeItemsParams): Promise<CodeItemDisplay[]> => {
  const { groupCode, includeInactive = false } = params;

  const response = await getApi<CodeItem[]>(API_ENDPOINTS.COMMON_CODE.CODE_ITEMS(groupCode), {
    params: { includeInactive },
    errorMessage: '코드아이템 데이터를 불러오지 못했습니다.',
  });

  const items = Array.isArray(response.data) ? response.data : [];

  // sortOrder로 정렬 후 화면 표시용 no 추가
  return items
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((item, index) => ({
      ...item,
      no: index + 1,
      groupCode,
    }));
};

/**
 * 코드아이템 상세 조회
 * API spec: GET /api/v1/common-codes/items/{codeItemId}
 */
export const fetchCodeItem = async (codeItemId: number): Promise<CodeItem> => {
  const response = await getApi<CodeItem>(API_ENDPOINTS.COMMON_CODE.CODE_ITEM_DETAIL(codeItemId), {
    errorMessage: '코드아이템 상세 데이터를 불러오지 못했습니다.',
  });

  return response.data;
};

/**
 * 코드아이템 생성
 * API spec: POST /api/v1/common-codes/groups/{groupCode}/items
 */
export const createCodeItem = async (
  groupCode: string,
  data: {
    code: string;
    codeName: string;
    sortOrder: number;
  },
): Promise<CodeItem> => {
  const response = await postApi<CodeItem>(
    API_ENDPOINTS.COMMON_CODE.CODE_ITEM_CREATE(groupCode),
    data,
    {
      errorMessage: '코드아이템 생성에 실패했습니다.',
    },
  );

  return response.data;
};

/**
 * 코드아이템 수정
 * API spec: POST /api/v1/common-codes/items/{codeItemId}
 */
export const updateCodeItem = async (
  codeItemId: number,
  data: {
    code: string;
    codeName: string;
    sortOrder: number;
  },
): Promise<void> => {
  await postApi(API_ENDPOINTS.COMMON_CODE.CODE_ITEM_UPDATE(codeItemId), data, {
    errorMessage: '코드아이템 수정에 실패했습니다.',
  });
};

/**
 * 코드아이템 비활성화
 * API spec: POST /api/v1/common-codes/items/{codeItemId}/deactivate
 */
export const deactivateCodeItem = async (codeItemId: number): Promise<void> => {
  await postApi(API_ENDPOINTS.COMMON_CODE.CODE_ITEM_DEACTIVATE(codeItemId), {}, {
    errorMessage: '코드아이템 비활성화에 실패했습니다.',
  });
};

/**
 * 코드아이템 선택 비활성화
 * API spec: POST /api/v1/common-codes/items/bulk-deactivate
 */
export const bulkDeactivateCodeItems = async (codeItemIds: number[]): Promise<void> => {
  await postApi(
    API_ENDPOINTS.COMMON_CODE.CODE_ITEMS_BULK_DEACTIVATE,
    { codeItemIds },
    {
      errorMessage: '코드아이템 일괄 비활성화에 실패했습니다.',
    },
  );
};

/**
 * 코드아이템 정렬순서 일괄 저장
 * API spec: POST /api/v1/common-codes/groups/{groupCode}/items/reorder
 */
export const reorderCodeItems = async (
  groupCode: string,
  items: Array<{ codeItemId: number; sortOrder: number }>,
): Promise<void> => {
  await postApi(
    API_ENDPOINTS.COMMON_CODE.CODE_ITEMS_REORDER(groupCode),
    { items },
    {
      errorMessage: '정렬순서 저장에 실패했습니다.',
    },
  );
};

// 하위 호환성을 위한 함수
export const deleteCodeItem = async (codeItemId: number): Promise<void> => {
  await deactivateCodeItem(codeItemId);
};

export const deleteCodeItems = async (items: Array<{ codeItemId: number }>): Promise<void> => {
  const codeItemIds = items.map((item) => item.codeItemId);
  await bulkDeactivateCodeItems(codeItemIds);
};

// ======================
// ServiceMapping (서비스코드 ↔ 서비스명) API
// Firebase 기반, API spec에 없으므로 기존 로직 유지
// ======================

const codeMappingsBasePath = 'management/common-code/code-mappings';

/**
 * ServiceMapping 변환 헬퍼 함수
 */
const transformServiceMappingItem = (
  v: Partial<ServiceMapping> & Record<string, unknown>,
  options: { index: number; fallbackId?: string | number },
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
 * 서비스 매핑 목록 조회 (Firebase)
 */
export const fetchServiceMappings = async (): Promise<ServiceMapping[]> => {
  const response = await getApi<ServiceMapping[]>(`${codeMappingsBasePath}.json`, {
    baseURL: env.testURL,
    transform: transformServiceMappings,
    errorMessage: '서비스 매핑 데이터를 불러오지 못했습니다.',
  });

  return response.data.filter((item) => item.mapping_type === 'SERVICE');
};

/**
 * 서비스 매핑 생성/수정 (upsert) (Firebase)
 */
export const upsertServiceMapping = async (
  data: Omit<
    ServiceMapping,
    'code_mapping_id' | 'created_by' | 'created_at' | 'updated_by' | 'updated_at' | 'firebaseKey'
  > & { firebaseKey?: string },
): Promise<ServiceMapping> => {
  const timestamp = Date.now();
  const code_mapping_id = timestamp;

  const mappingData = {
    ...data,
    code_mapping_id,
    mapping_type: 'SERVICE' as const,
    created_by: 1,
    created_at: new Date().toISOString(),
  };

  const path = data.firebaseKey
    ? `${codeMappingsBasePath}/${data.firebaseKey}.json`
    : `${codeMappingsBasePath}.json`;

  const response = await postApi<ServiceMapping>(path, mappingData, {
    baseURL: env.testURL,
    errorMessage: '서비스 매핑 저장에 실패했습니다.',
  });

  return response.data;
};

/**
 * QuestionMapping 변환 헬퍼 함수
 */
const transformQuestionMappingItem = (
  v: Partial<QuestionMapping> & Record<string, unknown>,
  options: { index: number; fallbackId?: string | number },
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
 * 질문 매핑 목록 조회 (Firebase)
 */
export const fetchQuestionMappings = async (): Promise<QuestionMapping[]> => {
  const response = await getApi<QuestionMapping[]>(`${codeMappingsBasePath}.json`, {
    baseURL: env.testURL,
    transform: transformQuestionMappings,
    errorMessage: '질문 매핑 데이터를 불러오지 못했습니다.',
  });

  return response.data.filter((item) => item.mapping_type === 'QUESTION');
};

/**
 * 질문 매핑 생성/수정 (upsert) (Firebase)
 */
export const upsertQuestionMapping = async (
  data: Omit<
    QuestionMapping,
    'code_mapping_id' | 'created_by' | 'created_at' | 'updated_by' | 'updated_at' | 'firebaseKey'
  > & { firebaseKey?: string },
): Promise<QuestionMapping> => {
  const timestamp = Date.now();
  const code_mapping_id = timestamp;

  const mappingData = {
    ...data,
    code_mapping_id,
    mapping_type: 'QUESTION' as const,
    created_by: 1,
    created_at: new Date().toISOString(),
  };

  const path = data.firebaseKey
    ? `${codeMappingsBasePath}/${data.firebaseKey}.json`
    : `${codeMappingsBasePath}.json`;

  const response = await postApi<QuestionMapping>(path, mappingData, {
    baseURL: env.testURL,
    errorMessage: '질문 매핑 저장에 실패했습니다.',
  });

  return response.data;
};

/**
 * 매핑 삭제 (Firebase)
 */
export const deleteMapping = async (firebaseKey: string): Promise<void> => {
  const path = `${codeMappingsBasePath}/${firebaseKey}.json`;

  const response = await fetch(`${env.testURL}/${path}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error('매핑 삭제에 실패했습니다.');
  }
};
