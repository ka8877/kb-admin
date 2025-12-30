// 앱스킴 관련 API 함수
// 순수 함수로 비즈니스 로직만 담당 (React Query와 독립적)

import { getApi, postApi, type ApiMeta, type BatchResult } from '@/utils/apiUtils';
import { API_ENDPOINTS } from '@/constants/endpoints';
import { TOAST_MESSAGES } from '@/constants/message';
import type { AppSchemeItem } from './types';
import { toCompactFormat } from '@/utils/dateUtils';
import type { Dayjs } from 'dayjs';
import { OUT_OF_SERVICE } from '@/constants/options';
import type { FetchListParams } from '@/types/types';
import { TABLE_LABELS } from '@/constants/label';

const {
  LOCKED,
  STATUS,
  CREATED_AT,
  UPDATED_AT,
  END_DATE,
  START_DATE,
  PARENT_TITLE,
  PARENT_ID,
  APP_SCHEME_ID,
  PRODUCT_MENU_NAME,
  DESCRIPTION,
  APP_SCHEME_LINK,
  ONE_LINK,
  GOODS_NAME_LIST,
} = TABLE_LABELS.APP_SCHEME;

const basePath = API_ENDPOINTS.APP_SCHEME.BASE;
/**
 * Firebase 응답 데이터를 AppSchemeItem으로 변환하는 헬퍼 함수
 */
const transformItem = (
  v: Partial<AppSchemeItem> & Record<string, unknown>,
  options: { index: number; fallbackId?: string | number },
): AppSchemeItem => {
  const { index, fallbackId } = options;

  return {
    [TABLE_LABELS.APP_SCHEME.NO]: (v[TABLE_LABELS.APP_SCHEME.NO] as number) ?? index + 1,
    [APP_SCHEME_ID]: String(v[APP_SCHEME_ID] ?? fallbackId ?? index + 1),
    [PRODUCT_MENU_NAME]: (v[PRODUCT_MENU_NAME] as string) ?? '',
    [DESCRIPTION]: (v[DESCRIPTION] as string) ?? '',
    [APP_SCHEME_LINK]: (v[APP_SCHEME_LINK] as string) ?? '',
    [ONE_LINK]: (v[ONE_LINK] as string) ?? '',
    [GOODS_NAME_LIST]: (v[GOODS_NAME_LIST] as string) ?? null,
    [PARENT_ID]: (v[PARENT_ID] as string) ?? null,
    [PARENT_TITLE]: (v[PARENT_TITLE] as string) ?? null,
    [START_DATE]: v[START_DATE] ? String(v[START_DATE]) : '',
    [END_DATE]: v[END_DATE] ? String(v[END_DATE]) : '',
    [UPDATED_AT]: v[UPDATED_AT] ? String(v[UPDATED_AT]) : '',
    [CREATED_AT]: v[CREATED_AT] ? String(v[CREATED_AT]) : '',
    [STATUS]: (v[STATUS] as AppSchemeItem['status']) ?? OUT_OF_SERVICE,
    [LOCKED]: (v[LOCKED] as boolean) ?? false,
  };
};

/**
 * 앱스킴 목록 조회
 */
export const fetchAppSchemes = async (
  params?: FetchListParams,
): Promise<{ items: AppSchemeItem[]; meta: ApiMeta | null }> => {
  const { page = 0, size = 20, searchParams = {} } = params || {};

  const response = await getApi<Record<string, unknown>[]>(API_ENDPOINTS.APP_SCHEME.BASE, {
    params: {
      page: page + 1,
      size,
      ...searchParams,
    },
    errorMessage: TOAST_MESSAGES.LOAD_DATA_FAILED,
  });

  const items =
    response.data && Array.isArray(response.data)
      ? response.data.map((item, index) => transformItem(item, { index }))
      : [];

  return {
    items,
    meta: response.meta || null,
  };
};

/**
 * 앱스킴 상세 조회
 */
export const fetchAppScheme = async (id: string | number): Promise<AppSchemeItem> => {
  const response = await getApi<Partial<AppSchemeItem> & Record<string, unknown>>(
    API_ENDPOINTS.APP_SCHEME.DETAIL(id),
    {
      errorMessage: TOAST_MESSAGES.LOAD_DETAIL_FAILED,
    },
  );

  // Firebase 응답 데이터를 AppSchemeItem으로 변환
  return transformItem(response.data, { index: 0, fallbackId: id });
};

/**
 * 입력 데이터를 API 전송 형식으로 변환하는 공통 함수
 * 폼 데이터와 엑셀 데이터 모두를 변환할 수 있도록 지원
 *
 * @param inputData - 폼 또는 엑셀에서 입력된 데이터
 * @returns API 전송 형식의 데이터
 */
export const transformToApiFormat = (inputData: {
  [PRODUCT_MENU_NAME]?: string | null;
  [DESCRIPTION]?: string | null;
  [APP_SCHEME_LINK]?: string | null;
  [ONE_LINK]?: string | null;
  [GOODS_NAME_LIST]?: string | null;
  [PARENT_ID]?: string | null;
  [PARENT_TITLE]?: string | null;
  [START_DATE]?: string | Date | Dayjs | null;
  [END_DATE]?: string | Date | Dayjs | null;
  [STATUS]?: string | null;
}): Partial<AppSchemeItem> => {
  // 날짜 변환
  let startDate = '';
  if (inputData[START_DATE]) {
    const val = inputData[START_DATE];
    if (val && typeof val === 'object' && 'toDate' in val) {
      // Dayjs 객체인 경우
      startDate = toCompactFormat((val as Dayjs).toDate()) || '';
    } else {
      // 문자열 또는 Date 객체인 경우
      startDate = toCompactFormat(val as string | Date) || '';
    }
  }

  let endDate = '';
  if (inputData[END_DATE]) {
    const val = inputData[END_DATE];
    if (val && typeof val === 'object' && 'toDate' in val) {
      // Dayjs 객체인 경우
      endDate = toCompactFormat((val as Dayjs).toDate()) || '';
    } else {
      // 문자열 또는 Date 객체인 경우
      endDate = toCompactFormat(val as string | Date) || '';
    }
  }

  return {
    productMenuName: inputData[PRODUCT_MENU_NAME] ? String(inputData[PRODUCT_MENU_NAME]) : '',
    description: inputData[DESCRIPTION] ? String(inputData[DESCRIPTION]) : '',
    appSchemeLink: inputData[APP_SCHEME_LINK] ? String(inputData[APP_SCHEME_LINK]) : '',
    oneLink: inputData[ONE_LINK] ? String(inputData[ONE_LINK]) : '',
    goodsNameList: inputData[GOODS_NAME_LIST] ? String(inputData[GOODS_NAME_LIST]) : null,
    parentId: inputData[PARENT_ID] ? String(inputData[PARENT_ID]) : null,
    parentTitle: inputData[PARENT_TITLE] ? String(inputData[PARENT_TITLE]) : null,
    startDate,
    endDate,
    status: (inputData[STATUS] as AppSchemeItem[typeof STATUS]) || OUT_OF_SERVICE,
  };
};

/**
 * 앱스킴 생성
 */
export const createAppScheme = async (data: Partial<AppSchemeItem>): Promise<AppSchemeItem> => {
  const response = await postApi<AppSchemeItem>(API_ENDPOINTS.APP_SCHEME.CREATE, data, {
    errorMessage: TOAST_MESSAGES.SAVE_FAILED,
  });

  return response.data;
};

/**
 * 앱스킴 일괄 생성
 * @param items - 생성할 앱스킴 아이템 배열
 */
export const createAppSchemesBatch = async (
  items: Partial<AppSchemeItem>[],
): Promise<BatchResult | undefined> => {
  if (items.length === 0) {
    return;
  }

  const response = await postApi<BatchResult>(API_ENDPOINTS.APP_SCHEME.BULK_CREATE, items, {
    errorMessage: TOAST_MESSAGES.SAVE_FAILED,
  });

  return response.data;
};

/**
 * 앱스킴 수정
 */
export const updateAppScheme = async (
  id: string | number,
  data: Partial<AppSchemeItem>,
): Promise<void> => {
  await postApi(API_ENDPOINTS.APP_SCHEME.UPDATE(id), data, {
    errorMessage: TOAST_MESSAGES.UPDATE_FAILED,
    successMessage: TOAST_MESSAGES.SAVE_SUCCESS,
  });
};

/**
 * 앱스킴 삭제
 */
export const deleteAppScheme = async (id: string | number): Promise<void> => {
  await postApi(API_ENDPOINTS.APP_SCHEME.DELETE(id), null, {
    errorMessage: TOAST_MESSAGES.DELETE_FAILED,
    successMessage: TOAST_MESSAGES.DELETE_SUCCESS,
  });
};

/**
 * 여러 앱스킴을 한 번에 삭제
 * @param itemIdsToDelete - 삭제할 아이템 ID 배열
 */
export const deleteAppSchemes = async (itemIdsToDelete: (string | number)[]): Promise<void> => {
  if (itemIdsToDelete.length === 0) {
    return;
  }

  await postApi(API_ENDPOINTS.APP_SCHEME.DELETE_BATCH, itemIdsToDelete, {
    errorMessage: TOAST_MESSAGES.DELETE_FAILED,
    successMessage: '삭제 요청',
  });
};
