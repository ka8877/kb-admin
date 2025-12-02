// 공통코드 관련 API 함수
// 순수 함수로 비즈니스 로직만 담당 (React Query와 독립적)

import { getApi, postApi, putApi, deleteApi } from '@/utils/apiUtils';
import { API_ENDPOINTS } from '@/constants/endpoints';
import { env } from '@/config';
import type { CodeTypeOption } from '@/mocks/commonCodeDb';
import type { RowItem } from './types';

/**
 * Firebase 응답 데이터를 CodeTypeOption 배열로 변환하는 헬퍼 함수
 */
const transformCodeTypes = (raw: unknown): CodeTypeOption[] => {
  if (!raw) return [];

  // 배열 형태 응답
  if (Array.isArray(raw)) {
    return raw
      .filter((item): item is CodeTypeOption => item !== null && item !== undefined)
      .map((item) => ({
        value: item.value || '',
        label: item.label || '',
        useYn: item.useYn || 'Y',
      }));
  }

  // 객체 형태 응답
  if (typeof raw === 'object' && raw !== null) {
    return Object.entries(raw as Record<string, any>).map(([key, value]) => ({
      value: value.value || key,
      label: value.label || '',
      useYn: value.useYn || 'Y',
    }));
  }

  return [];
};

/**
 * Firebase 응답 데이터를 CommonCodeItem 배열로 변환하는 헬퍼 함수
 */
const transformCommonCodeItems = (raw: unknown): RowItem[] => {
  if (!raw) return [];

  // 배열 형태 응답
  if (Array.isArray(raw)) {
    return raw
      .filter((item) => item !== null && item !== undefined)
      .map((item, index) => ({
        no: item.no ?? index + 1,
        code_type: item.code_type || '',
        category_nm: item.category_nm || '',
        service_cd: item.service_cd || '',
        status_code: item.status_code || 'Y',
        parent_service_cd: item.parent_service_cd || undefined,
        service_group_name: item.service_group_name || undefined,
      }));
  }

  // 객체 형태 응답
  if (typeof raw === 'object' && raw !== null) {
    return Object.entries(raw as Record<string, any>).map(([key, value], index) => ({
      no: value.no ?? index + 1,
      code_type: value.code_type || '',
      category_nm: value.category_nm || '',
      service_cd: value.service_cd || key,
      status_code: value.status_code || 'Y',
      parent_service_cd: value.parent_service_cd || undefined,
      service_group_name: value.service_group_name || undefined,
    }));
  }

  return [];
};

/**
 * 코드 타입 목록 조회
 */
export const fetchCodeTypes = async (): Promise<CodeTypeOption[]> => {
  const response = await getApi<CodeTypeOption[]>(API_ENDPOINTS.COMMON_CODE.CODE_TYPES, {
    baseURL: env.testURL,
    transform: transformCodeTypes,
    errorMessage: '코드 타입 목록을 불러오지 못했습니다.',
  });

  return response.data;
};

/**
 * 코드 타입 저장 (일괄 저장)
 */
export const saveCodeTypes = async (codeTypes: CodeTypeOption[]): Promise<void> => {
  await putApi(API_ENDPOINTS.COMMON_CODE.CODE_TYPES, codeTypes, {
    baseURL: env.testURL,
    errorMessage: '코드 타입 저장에 실패했습니다.',
  });
};

/**
 * 공통코드 목록 조회 파라미터 타입
 */
export interface FetchCommonCodesParams {
  /** 코드 타입 필터 */
  codeType?: string;
  /** 사용 여부 필터 (Y/N) */
  useYn?: string;
}

/**
 * 공통코드 목록 조회
 */
export const fetchCommonCodes = async (params?: FetchCommonCodesParams): Promise<RowItem[]> => {
  const { codeType, useYn } = params || {};

  console.log('🔍 공통코드 목록 조회 파라미터:', { codeType, useYn });

  // TODO: 실제 REST API로 전환 시 쿼리 파라미터 추가
  // const queryParams = new URLSearchParams();
  // if (codeType) queryParams.append('codeType', codeType);
  // if (useYn) queryParams.append('useYn', useYn);
  // const endpoint = `${API_ENDPOINTS.COMMON_CODE.LIST}?${queryParams.toString()}`;

  const response = await getApi<RowItem[]>(API_ENDPOINTS.COMMON_CODE.LIST, {
    baseURL: env.testURL,
    transform: transformCommonCodeItems,
    errorMessage: '공통코드 데이터를 불러오지 못했습니다.',
  });

  // 클라이언트 사이드 필터링 (Firebase의 경우)
  let filteredData = response.data;
  if (codeType) {
    filteredData = filteredData.filter((item) => item.code_type === codeType);
  }
  if (useYn) {
    filteredData = filteredData.filter((item) => item.status_code === useYn);
  }

  return filteredData;
};

/**
 * 공통코드 상세 조회
 */
export const fetchCommonCode = async (serviceCode: string): Promise<RowItem> => {
  const response = await getApi<any>(API_ENDPOINTS.COMMON_CODE.DETAIL(serviceCode), {
    baseURL: env.testURL,
    errorMessage: '공통코드 상세 데이터를 불러오지 못했습니다.',
  });

  // 단일 객체를 RowItem으로 변환
  const item = response.data;
  return {
    no: item.no ?? 0,
    code_type: item.code_type || '',
    category_nm: item.category_nm || '',
    service_cd: item.service_cd || serviceCode,
    status_code: item.status_code || 'Y',
    parent_service_cd: item.parent_service_cd || undefined,
    service_group_name: item.service_group_name || undefined,
  };
};

/**
 * 공통코드 생성
 */
export const createCommonCode = async (data: Omit<RowItem, 'no'>): Promise<RowItem> => {
  const response = await postApi<RowItem>(API_ENDPOINTS.COMMON_CODE.CREATE, data, {
    baseURL: env.testURL,
    errorMessage: '공통코드 생성에 실패했습니다.',
  });

  return response.data;
};

/**
 * 공통코드 수정
 */
export const updateCommonCode = async (
  serviceCode: string,
  data: Partial<RowItem>,
): Promise<RowItem> => {
  const response = await putApi<RowItem>(API_ENDPOINTS.COMMON_CODE.UPDATE(serviceCode), data, {
    baseURL: env.testURL,
    errorMessage: '공통코드 수정에 실패했습니다.',
  });

  return response.data;
};

/**
 * 공통코드 삭제
 */
export const deleteCommonCode = async (serviceCode: string): Promise<void> => {
  await deleteApi(API_ENDPOINTS.COMMON_CODE.DELETE(serviceCode), {
    baseURL: env.testURL,
    errorMessage: '공통코드 삭제에 실패했습니다.',
  });
};

/**
 * 여러 공통코드를 한 번에 삭제
 */
export const deleteCommonCodes = async (serviceCodes: string[]): Promise<void> => {
  if (serviceCodes.length === 0) {
    return;
  }

  // Firebase Multi-Path Update를 사용하여 일괄 삭제
  const updates: { [key: string]: null } = {};
  const basePath = 'common-codes'; // API_ENDPOINTS에서 경로 추출하여 사용

  serviceCodes.forEach((serviceCode) => {
    const path = `${basePath}/${serviceCode}`;
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
    throw new Error(`공통코드 일괄 삭제에 실패했습니다. (${response.status})`);
  }

  console.log(`공통코드 ${serviceCodes.length}개 항목이 삭제되었습니다.`);
};
