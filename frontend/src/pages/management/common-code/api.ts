// 공통코드 관련 API 함수
// 순수 함수로 비즈니스 로직만 담당 (React Query와 독립적)

import { getApi, postApi, putApi, deleteApi } from '@/utils/apiUtils';
import { API_ENDPOINTS } from '@/constants/endpoints';
import { env } from '@/config';
import type { CodeGroup, CodeItem, CodeGroupDisplay, CodeItemDisplay } from './types';

const codeGroupsBasePath = 'management/common-code/code-groups';
const codeItemsBasePath = 'management/common-code/code-items';

/**
 * CodeGroup 변환 헬퍼 함수
 */
const transformCodeGroupItem = (
  v: Partial<CodeGroup> & Record<string, any>,
  options: { index: number; fallbackId?: string | number },
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
        const v = item as Partial<CodeGroup> & Record<string, any>;
        return transformCodeGroupItem(v, { index });
      })
      .filter((item): item is CodeGroup => item !== null);
  }

  // 객체 형태 응답 (Firebase에서 ID를 키로 사용하는 경우)
  if (typeof raw === 'object' && raw !== null) {
    const entries = Object.entries(raw as Record<string, any>);
    return entries
      .map(([firebaseKey, value], index) => {
        const v = value as Partial<CodeGroup> & Record<string, any>;
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
  v: Partial<CodeItem> & Record<string, any>,
  options: { index: number; fallbackId?: string | number },
): CodeItem | null => {
  const { fallbackId } = options;

  // 유효한 데이터만 변환 (code, code_name, code_group_id가 있어야 함)
  if (!v.code || !v.code_name || !v.code_group_id || v.code_group_id === 0) {
    return null;
  }

  return {
    code_item_id: v.code_item_id || (fallbackId ? Number(fallbackId) : 0),
    code_group_id: v.code_group_id || 0,
    code: v.code || '',
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
        const v = item as Partial<CodeItem> & Record<string, any>;
        return transformCodeItemItem(v, { index });
      })
      .filter((item): item is CodeItem => item !== null);
  }

  // 객체 형태 응답
  if (typeof raw === 'object' && raw !== null) {
    const entries = Object.entries(raw as Record<string, any>);
    return entries
      .map(([firebaseKey, value], index) => {
        const v = value as Partial<CodeItem> & Record<string, any>;
        return transformCodeItemItem({ ...v, firebaseKey }, { index, fallbackId: firebaseKey });
      })
      .filter((item): item is CodeItem => item !== null);
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
  const response = await getApi<any>(API_ENDPOINTS.COMMON_CODE.CODE_GROUP_DETAIL(codeGroupId), {
    baseURL: env.testURL,
    errorMessage: '코드그룹 상세 데이터를 불러오지 못했습니다.',
  });

  const item = response.data;
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
): Promise<CodeGroup> => {
  const updateData = {
    ...data,
    updated_by: 1, // TODO: 실제 로그인 사용자 ID로 교체
    updated_at: new Date().toISOString(),
  };

  const response = await putApi<CodeGroup>(
    API_ENDPOINTS.COMMON_CODE.CODE_GROUP_UPDATE(codeGroupId),
    updateData,
    {
      baseURL: env.testURL,
      errorMessage: '코드그룹 수정에 실패했습니다.',
    },
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

  console.log('🔍 코드아이템 목록 조회 파라미터:', { codeGroupId, isActive });

  const response = await getApi<CodeItem[]>(API_ENDPOINTS.COMMON_CODE.CODE_ITEMS, {
    baseURL: env.testURL,
    transform: transformCodeItems,
    errorMessage: '코드아이템 데이터를 불러오지 못했습니다.',
  });

  console.log('📦 Firebase에서 받은 전체 코드아이템:', response.data);
  console.log('📦 Firebase에서 받은 전체 코드아이템:', response);

  // 클라이언트 사이드 필터링 (Firebase의 경우)
  let filteredData = response.data;
  if (codeGroupId !== undefined) {
    console.log('🔍 code_group_id로 필터링 시작. 찾는 ID:', codeGroupId);
    filteredData = filteredData.filter((item) => {
      console.log(
        `   - item.code_group_id: ${item.code_group_id} (타입: ${typeof item.code_group_id}), 비교 대상: ${codeGroupId} (타입: ${typeof codeGroupId}), 일치: ${item.code_group_id === codeGroupId}`,
      );
      return item.code_group_id === codeGroupId;
    });
    console.log('✅ 필터링 후 결과:', filteredData);
  }
  if (isActive !== undefined) {
    filteredData = filteredData.filter((item) => item.is_active === isActive);
  }

  // sort_order로 정렬 후 화면 표시용 no 추가
  return filteredData
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((item, index) => ({
      ...item,
      no: index + 1,
    }));
};

/**
 * 코드아이템 상세 조회
 */
export const fetchCodeItem = async (codeItemId: number): Promise<CodeItem> => {
  const response = await getApi<any>(API_ENDPOINTS.COMMON_CODE.CODE_ITEM_DETAIL(codeItemId), {
    baseURL: env.testURL,
    errorMessage: '코드아이템 상세 데이터를 불러오지 못했습니다.',
  });

  const item = response.data;
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
  data: Omit<
    CodeGroup,
    'code_group_id' | 'created_by' | 'created_at' | 'updated_by' | 'updated_at'
  >,
): Promise<CodeGroup> => {
  // Firebase에서는 Auto Increment가 없으므로 클라이언트에서 ID 생성
  const timestamp = Date.now();
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
  data: Partial<Omit<CodeItem, 'code_item_id' | 'created_by' | 'created_at'>>,
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
    },
  );

  return response.data;
};

/**
 * 코드아이템 생성
 */
export const createCodeItem = async (
  data: Omit<CodeItem, 'code_item_id' | 'created_by' | 'created_at' | 'updated_by' | 'updated_at'>,
): Promise<CodeItem> => {
  // Firebase에서는 Auto Increment가 없으므로 클라이언트에서 ID 생성
  const timestamp = Date.now();
  const code_item_id = timestamp;

  const newData = {
    ...data,
    code_item_id,
    created_by: 1, // TODO: 실제 로그인 사용자 ID로 교체
    created_at: new Date().toISOString(),
  };

  const response = await postApi<CodeItem>(API_ENDPOINTS.COMMON_CODE.CODE_ITEM_CREATE, newData, {
    baseURL: env.testURL,
    errorMessage: '코드아이템 생성에 실패했습니다.',
  });

  return response.data;
};

/**
 * 코드아이템 삭제
 */
export const deleteCodeItem = async (codeItemId: number, firebaseKey?: string): Promise<void> => {
  // Firebase 키가 있으면 해당 키로 삭제, 없으면 code_item_id 사용
  const endpointKey = firebaseKey || codeItemId;
  console.log('삭제 요청:', { codeItemId, firebaseKey, endpointKey });

  await deleteApi(API_ENDPOINTS.COMMON_CODE.CODE_ITEM_DELETE(endpointKey), {
    baseURL: env.testURL,
    errorMessage: '코드아이템 삭제에 실패했습니다.',
  });
};

/**
 * 여러 코드아이템을 한 번에 삭제
 */
export const deleteCodeItems = async (
  items: Array<{ codeItemId: number; firebaseKey?: string }>,
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

  console.log(`코드아이템 ${items.length}개 항목이 삭제되었습니다.`);
};
