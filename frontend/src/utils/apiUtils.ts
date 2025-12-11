// 공통 API 유틸리티 함수
// 반환 타입, 엔드포인트 등을 props로 전달받아 유동적으로 사용 가능

import { useLoadingStore } from '@/store/loading';
import { env } from '@/config/env';
import { toast } from 'react-toastify';
import { TOAST_MESSAGES } from '@/constants/message';
import {
  DATA_REGISTRATION,
  DATA_MODIFICATION,
  DATA_DELETION,
  CREATE_REQUESTED,
  UPDATE_REQUESTED,
  DELETE_REQUESTED,
} from '@/constants/options';
import { ApprovalFormType, ApprovalRequestType, ApprovalRequestData } from '@/types/types';
import { formatDateForStorage } from '@/utils/dateUtils';

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

// CUD 작업인지 확인하는 헬퍼 함수
const isCudOperation = (method: HttpMethod): boolean => {
  return ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method);
};

import { keycloak } from '@/config/env';
import { updateToken } from '@/utils/keycloak';

/**
 * 공통 헤더를 반환하는 헬퍼 함수
 * Authorization 토큰 등 모든 요청에 포함되어야 할 헤더를 정의합니다.
 */
const getCommonHeaders = (): Record<string, string> => {
  const headers: Record<string, string> = {};

  if (keycloak.token) {
    // TODO 로그인 개발 후 주석 제거
    //  headers['Authorization'] = `Bearer ${keycloak.token}`;
  }

  return headers;
};

export interface FetchApiOptions<T = unknown> {
  /** HTTP 메서드 */
  method?: HttpMethod;
  /** API 엔드포인트 (baseURL 제외) */
  endpoint: string;
  /** Base URL (환경 변수에서 가져온 값) */
  baseURL?: string;
  /** 요청 본문 데이터 */
  body?: unknown;
  /** 요청 헤더 */
  headers?: Record<string, string>;
  /** 응답 데이터 변환 함수 (옵션) */
  transform?: (data: unknown) => T;
  /** 에러 메시지 (기본값: '데이터를 불러오지 못했습니다.') */
  errorMessage?: string;
  /** 성공 메시지 (옵션) */
  successMessage?: string;
}

export interface StandardApiResponse<T> {
  HEADER: Record<string, unknown>;
  COMMON: Record<string, unknown>;
  DATA: T;
  MESSAGE: Record<string, unknown>;
}

export interface FetchApiResponse<T> {
  data: T;
  status: number;
  statusText: string;
}

/**
 * 성공 메시지를 반환하는 헬퍼 함수
 */
const getSuccessMessage = (method: HttpMethod, customMessage?: string): string => {
  if (customMessage !== undefined) return customMessage;

  switch (method) {
    case 'POST':
      return TOAST_MESSAGES.SAVE_SUCCESS;
    case 'PUT':
    case 'PATCH':
      return TOAST_MESSAGES.SAVE_SUCCESS;
    case 'DELETE':
      return TOAST_MESSAGES.DELETE_SUCCESS;
    default:
      return '';
  }
};

/**
 * 범용 fetch API 함수
 * @param options - API 호출 옵션
 * @returns Promise<FetchApiResponse<T>>
 */
export async function fetchApi<T = unknown>(
  options: FetchApiOptions<T>,
): Promise<FetchApiResponse<T>> {
  const {
    method = 'GET',
    endpoint,
    baseURL = env.testURL,
    body,
    headers = {},
    transform,
    errorMessage: providedErrorMessage,
    successMessage: providedSuccessMessage,
  } = options;

  // API 요청 전 토큰 갱신 시도 (만료 임박 시)
  try {
    await updateToken();
  } catch (e) {
    console.warn('Token update failed, proceeding with existing token', e);
  }

  const url = `${baseURL}${endpoint}`;

  //const url = '';
  const requestHeaders: HeadersInit = {
    'Content-Type': 'application/json',
    ...getCommonHeaders(),
    ...headers,
  };

  const fetchOptions: RequestInit = {
    method,
    headers: requestHeaders,
  };

  if (body && method !== 'GET') {
    fetchOptions.body = JSON.stringify(body);
  }

  // CUD 작업인 경우 로딩 시작
  const shouldShowLoading = isCudOperation(method);
  if (shouldShowLoading) {
    useLoadingStore.getState().start();
  }

  try {
    const response = await fetch(url, fetchOptions);

    if (!response.ok) {
      let serverErrorMessage = response.statusText;
      try {
        const errorData = await response.json();
        if (errorData && typeof errorData.message === 'string') {
          serverErrorMessage = errorData.message;
        }
      } catch (e) {
        // ignore json parse error
      }
      throw new Error(serverErrorMessage);
    }

    const rawData = await response.json();

    // TODO: 백엔드 응답 구조 변경 시 아래 주석 해제 및 로직 적용
    /*
    const standardResponse = rawData as StandardApiResponse<T>;
    // 필요한 경우 HEADER, COMMON, MESSAGE 처리 로직 추가
    const data = transform ? transform(standardResponse.DATA) : (standardResponse.DATA as T);
    */

    // 현재 로직 (변경 전)
    const data = transform ? transform(rawData) : (rawData as T);

    // CUD 작업 성공 시 토스트 메시지 표시
    if (isCudOperation(method)) {
      const successMessage = getSuccessMessage(method, providedSuccessMessage);

      if (successMessage) {
        // toastId를 메시지 내용으로 설정하여 동일한 메시지가 중복되어 표시되지 않도록 함
        toast.success(successMessage, { toastId: successMessage });
      }
    }

    return {
      data,
      status: response.status,
      statusText: response.statusText,
    };
  } catch (error) {
    let message = '';
    if (providedErrorMessage) {
      message = providedErrorMessage;
    } else if (error instanceof Error) {
      message = error.message;
    } else {
      message = TOAST_MESSAGES.LOAD_DATA_FAILED;
    }

    // 중복 토스트 방지를 위해 toastId 설정
    toast.error(message, { toastId: `${endpoint}-${message}-${method}` });

    if (error instanceof Error) {
      throw error;
    }
    throw new Error(message);
  } finally {
    // CUD 작업인 경우 로딩 종료
    if (shouldShowLoading) {
      useLoadingStore.getState().stop();
    }
  }
}

/**
 * GET 요청 편의 함수
 */
export async function getApi<T = unknown>(
  endpoint: string,
  options?: Omit<FetchApiOptions<T>, 'method' | 'endpoint'>,
): Promise<FetchApiResponse<T>> {
  return fetchApi<T>({
    ...options,
    method: 'GET',
    endpoint,
  });
}

/**
 * POST 요청 편의 함수
 */
export async function postApi<T = unknown>(
  endpoint: string,
  body?: unknown,
  options?: Omit<FetchApiOptions<T>, 'method' | 'endpoint' | 'body'>,
): Promise<FetchApiResponse<T>> {
  return fetchApi<T>({
    ...options,
    method: 'POST',
    endpoint,
    body,
  });
}

/**
 * PUT 요청 편의 함수
 */
export async function putApi<T = unknown>(
  endpoint: string,
  body?: unknown,
  options?: Omit<FetchApiOptions<T>, 'method' | 'endpoint' | 'body'>,
): Promise<FetchApiResponse<T>> {
  return fetchApi<T>({
    ...options,
    method: 'PUT',
    endpoint,
    body,
  });
}

/**
 * PATCH 요청 편의 함수
 */
export async function patchApi<T = unknown>(
  endpoint: string,
  body?: unknown,
  options?: Omit<FetchApiOptions<T>, 'method' | 'endpoint' | 'body'>,
): Promise<FetchApiResponse<T>> {
  return fetchApi<T>({
    ...options,
    method: 'PATCH',
    endpoint,
    body,
  });
}

/**
 * DELETE 요청 편의 함수
 */
export async function deleteApi<T = unknown>(
  endpoint: string,
  options?: Omit<FetchApiOptions<T>, 'method' | 'endpoint'>,
): Promise<FetchApiResponse<T>> {
  return fetchApi<T>({
    ...options,
    method: 'DELETE',
    endpoint,
  });
}

/**
 * JSON 문자열로 저장된 검색 조건을 객체로 변환하는 유틸리티 함수
 * @param searchFieldsState - JSON 문자열로 직렬화된 검색 조건
 * @returns 검색 조건 객체 (파싱 실패 시 빈 객체 반환)
 *
 * @example
 * const searchParams = parseSearchParams(listState.searchFieldsState);
 * // { field1: 'value1', field2: 123 }
 */
export function parseSearchParams(searchFieldsState?: string): Record<string, string | number> {
  if (!searchFieldsState) return {};
  try {
    return JSON.parse(searchFieldsState) as Record<string, string | number>;
  } catch {
    return {};
  }
}

/**
 * 여러 아이템을 한 번에 삭제하는 공통 함수 (Firebase Multi-Path Update)
 * @param itemIds - 삭제할 아이템 ID 배열
 * @param getDeletePath - 아이템 ID를 받아 삭제 경로를 반환하는 함수
 * @param label - 에러 메시지에 사용할 라벨 (예: "추천질문")
 * @param baseURL - Firebase Realtime Database Base URL
 *
 * @example
 * await deleteItems(
 *   ['id1', 'id2'],
 *   (id) => API_ENDPOINTS.RECOMMENDED_QUESTIONS.DELETE(id),
 *   '추천질문',
 *   env.testURL
 * );
 */
export async function deleteItems(
  itemIds: (string | number)[],
  getDeletePath: (id: string | number) => string,
  label: string,
  baseURL: string,
): Promise<void> {
  if (itemIds.length === 0) {
    return;
  }

  // Firebase Realtime Database의 Multi-Path Update를 사용
  const updates: { [key: string]: null } = {};
  itemIds.forEach((id) => {
    // 각 아이템의 경로를 지정하고 값을 null로 설정하여 삭제
    // Firebase 경로는 앞의 슬래시와 .json을 제거해야 함
    const deletePath = getDeletePath(id)
      .replace(/^\//, '')
      .replace(/\.json$/, '');
    updates[deletePath] = null;
  });

  // Firebase REST API를 통해 Multi-Path Update 실행
  // Firebase Realtime Database REST API 사용
  const databaseUrl = baseURL.replace(/\/$/, ''); // 마지막 슬래시 제거
  const updatesUrl = `${databaseUrl}/.json`;

  // 삭제 작업이므로 로딩 시작
  useLoadingStore.getState().start();

  try {
    const response = await fetch(updatesUrl, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates),
    });

    if (!response.ok) {
      throw new Error(`${label} 삭제에 실패했습니다. (${response.status})`);
    }

    console.log(`선택된 ${label} 아이템들이 삭제되었습니다.`);
  } catch (error) {
    console.error(`${label} 삭제 오류:`, error);
    throw error;
  } finally {
    // 로딩 종료
    useLoadingStore.getState().stop();
  }
}

export type ApprovalRequestItem = {
  targetType: string; // 대상 타입
  targetId: string; // 대상 식별자
  updatedBy: string | null; // 최근 처리자
  isRetracted: number; // 회수 여부
};

/**
 * 승인 요청 API 호출
 */
export const sendApprovalRequest = async <T>(
  endpoint: string,
  approvalForm: ApprovalFormType,
  items: T[],
  label: string,
  targetType: string,
  targetId: string,
  successMessage: string = '',
): Promise<void> => {
  const titleMap: Record<ApprovalFormType, string> = {
    [DATA_REGISTRATION]: '데이터 등록',
    [DATA_MODIFICATION]: '데이터 수정',
    [DATA_DELETION]: '데이터 삭제',
  };

  const contentMap: Record<ApprovalFormType, string> = {
    [DATA_REGISTRATION]: `${label} 등록`,
    [DATA_MODIFICATION]: `${label} 수정`,
    [DATA_DELETION]: `${label} 삭제`,
  };

  // approval_form에 따라 적절한 status 설정
  const statusMap: Record<ApprovalFormType, ApprovalRequestType> = {
    [DATA_REGISTRATION]: CREATE_REQUESTED,
    [DATA_MODIFICATION]: UPDATE_REQUESTED,
    [DATA_DELETION]: DELETE_REQUESTED,
  };

  const approvalData: ApprovalRequestData<T> = {
    requestKind: approvalForm,
    title: titleMap[approvalForm],
    content: contentMap[approvalForm],
    createdAt: formatDateForStorage(new Date(), 'YYYYMMDDHHmmss') || '',
    approvalStatus: statusMap[approvalForm],
    targetType,
    targetId,
    isRetracted: 0,
    list: items,
  };

  try {
    await postApi(endpoint, approvalData, {
      errorMessage: TOAST_MESSAGES.APPROVAL_REQUEST_FAILED,
      successMessage,
    });
    console.log(`승인 요청이 전송되었습니다. (${titleMap[approvalForm]})`);
  } catch (error) {
    console.error('승인 요청 전송 오류:', error);
    // 승인 요청 실패는 CUD 작업 성공에 영향을 주지 않도록 에러를 던지지 않음
  }
};
