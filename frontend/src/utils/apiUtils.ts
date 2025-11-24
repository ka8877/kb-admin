// 공통 API 유틸리티 함수
// 반환 타입, 엔드포인트 등을 props로 전달받아 유동적으로 사용 가능

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

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
}

export interface FetchApiResponse<T> {
  data: T;
  status: number;
  statusText: string;
}

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
    baseURL = '',
    body,
    headers = {},
    transform,
    errorMessage = '데이터를 불러오지 못했습니다.',
  } = options;

  const url = `${baseURL}${endpoint}`;
  const requestHeaders: HeadersInit = {
    'Content-Type': 'application/json',
    ...headers,
  };

  const fetchOptions: RequestInit = {
    method,
    headers: requestHeaders,
  };

  if (body && method !== 'GET') {
    fetchOptions.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(url, fetchOptions);

    if (!response.ok) {
      throw new Error(`${errorMessage} (${response.status})`);
    }

    const rawData = await response.json();
    const data = transform ? transform(rawData) : (rawData as T);

    return {
      data,
      status: response.status,
      statusText: response.statusText,
    };
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error(errorMessage);
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
export function parseSearchParams(
  searchFieldsState?: string,
): Record<string, string | number> {
  if (!searchFieldsState) return {};
  try {
    return JSON.parse(searchFieldsState) as Record<string, string | number>;
  } catch {
    return {};
  }
}

