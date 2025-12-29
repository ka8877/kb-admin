// 앱스킴 관련 API 함수
// 순수 함수로 비즈니스 로직만 담당 (React Query와 독립적)

import {
  getApi,
  postApi,
  putApi,
  patchApi,
  fetchApi,
  sendApprovalRequest as sendApprovalRequestCommon,
  type ApiMeta,
  type BatchResult,
} from '@/utils/apiUtils';
import { useLoadingStore } from '@/store/loading';
import { API_ENDPOINTS } from '@/constants/endpoints';
import { env } from '@/config/env';
import { TOAST_MESSAGES } from '@/constants/message';
import type { AppSchemeItem } from './types';
import { toCompactFormat } from '@/utils/dateUtils';
import type { Dayjs } from 'dayjs';
import { TARGET_TYPE_APP, OUT_OF_SERVICE } from '@/constants/options';
import type { ApprovalFormType, ApprovalRequestItem, FetchListParams } from '@/types/types';
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

const {
  NO,
  APPROVAL_REQUEST_ID,
  TARGET_TYPE,
  TARGET_ID,
  ITSVC_NO,
  REQUEST_KIND,
  APPROVAL_STATUS,
  PAYLOAD_BEFORE,
  PAYLOAD_AFTER,
  REQUESTER_NAME,
  REQUESTER_DEPT_NAME,
  LAST_ACTOR_NAME,
  REQUESTED_AT,
  LAST_UPDATED_AT,
  IS_RETRACTED,
  IS_APPLIED,
  APPLIED_AT,
} = TABLE_LABELS.APPROVAL_REQUEST;

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
 * Firebase 응답 데이터 변환 함수
 */
const transformAppSchemes = (raw: unknown): AppSchemeItem[] => {
  if (!raw) return [];

  // 배열 형태 응답: [null, { ... }, { ... }]
  if (Array.isArray(raw)) {
    return raw
      .map((item, index) => {
        if (!item) return null;
        const v = item as Partial<AppSchemeItem> & Record<string, unknown>;
        return transformItem(v, { index });
      })
      .filter((item): item is AppSchemeItem => item !== null);
  }

  // 객체 형태 응답도 지원 (기존 방식)
  if (typeof raw === 'object' && raw !== null) {
    const entries = Object.entries(raw as Record<string, unknown>);

    return entries.map(([key, value], index) => {
      const v = value as Partial<AppSchemeItem> & Record<string, unknown>;
      return transformItem(v, { index, fallbackId: key });
    });
  }

  return [];
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
 * 승인 요청 API 호출 (1:1 관계로 각 item마다 개별 결재 요청 생성)
 */
const sendApprovalRequest = async (
  approvalForm: ApprovalFormType,
  items: AppSchemeItem[],
): Promise<void> => {
  // 각 item마다 개별 결재 요청 생성 (1:1 관계)
  for (const item of items) {
    const targetId = item.appSchemeId;

    await sendApprovalRequestCommon(
      API_ENDPOINTS.APP_SCHEME.APPROVAL_LIST,
      approvalForm,
      [item], // 단건 배열로 전달
      item[DESCRIPTION] || '앱스킴',
      TARGET_TYPE_APP,
      targetId,
    );
  }
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
 * 승인 요청 정보 조회
 */
export const fetchApprovalRequest = async (
  approvalId: string | number,
): Promise<ApprovalRequestItem> => {
  const endpoint = API_ENDPOINTS.APP_SCHEME.APPROVAL_DETAIL(approvalId);
  const response = await getApi<Record<string, unknown>>(endpoint, {
    errorMessage: TOAST_MESSAGES.LOAD_APPROVAL_INFO_FAILED,
  });

  const v = response.data;
  return {
    [NO]: (v[NO] as number) ?? 0,
    [APPROVAL_REQUEST_ID]: Number(v[APPROVAL_REQUEST_ID] ?? v.id ?? approvalId),
    [TARGET_TYPE]: (v[TARGET_TYPE] as string) ?? '',
    [TARGET_ID]: Number(v[TARGET_ID] ?? 0),
    [ITSVC_NO]: (v[ITSVC_NO] as string) ?? null,
    [REQUEST_KIND]: (v[REQUEST_KIND] as string) ?? '',
    [APPROVAL_STATUS]: (v[APPROVAL_STATUS] as string) ?? '',
    [PAYLOAD_BEFORE]: (v[PAYLOAD_BEFORE] as string | null) ?? null,
    [PAYLOAD_AFTER]: (v[PAYLOAD_AFTER] as string | null) ?? null,
    [REQUESTER_NAME]: (v[REQUESTER_NAME] as string | null) ?? null,
    [REQUESTER_DEPT_NAME]: (v[REQUESTER_DEPT_NAME] as string | null) ?? null,
    [LAST_ACTOR_NAME]: (v[LAST_ACTOR_NAME] as string | null) ?? null,
    [REQUESTED_AT]: (v[REQUESTED_AT] as string) ?? '',
    [LAST_UPDATED_AT]: (v[LAST_UPDATED_AT] as string) ?? '',
    [IS_RETRACTED]: Boolean(v[IS_RETRACTED]),
    [IS_APPLIED]: Boolean(v[IS_APPLIED]),
    [APPLIED_AT]: (v[APPLIED_AT] as string | null) ?? null,
  };
};

/**
 * 승인 요청 상세 조회 (결재 요청에 포함된 앱스킴 목록)
 */
export const fetchApprovalDetailAppSchemes = async (
  approvalId: string | number,
): Promise<AppSchemeItem[]> => {
  const endpoint = API_ENDPOINTS.APP_SCHEME.APPROVAL_DETAIL_LIST(approvalId);

  const response = await getApi<AppSchemeItem[]>(endpoint, {
    transform: transformAppSchemes,
    errorMessage: TOAST_MESSAGES.LOAD_APPROVAL_DETAIL_FAILED,
  });

  console.log('🔍 fetchApprovalDetailAppSchemes API 완료, data:', response.data);
  return response.data;
};

/**
 * 승인 요청 상태 수정
 * @param approvalId - 승인 요청 ID
 * @param status - 변경할 상태 ('approved' | 'rejected' 등)
 * @param processDate - 처리 일자 (YYYYMMDDHHmmss 형식, 선택)
 */
export const updateApprovalRequestStatus = async (
  approvalId: string | number,
  status: string,
  processDate?: string,
): Promise<void> => {
  const endpoint = API_ENDPOINTS.APP_SCHEME.APPROVAL_DETAIL(approvalId);

  const updateData: { approvalStatus: string; updatedAt?: string } = { approvalStatus: status };
  if (processDate) {
    updateData.updatedAt = processDate;
  }

  await patchApi(endpoint, updateData, {
    errorMessage: TOAST_MESSAGES.APPROVAL_STATUS_UPDATE_FAILED,
  });

  console.log('🔍 updateApprovalRequestStatus API 완료');
};

/**
 * 결재 요청 삭제
 */
export const deleteApprovalRequest = async (approvalId: string | number): Promise<void> => {
  const endpoint = API_ENDPOINTS.APP_SCHEME.APPROVAL_DETAIL(approvalId);
  await fetchApi({
    method: 'DELETE',
    endpoint,
    errorMessage: '결재 요청 삭제에 실패했습니다.',
  });
};

/**
 * 앱스킴 잠금 해제 (locked: false)
 */
export const unlockAppScheme = async (id: string | number): Promise<void> => {
  const basePath = API_ENDPOINTS.APP_SCHEME.BASE;
  const endpoint = `${basePath}/${id}/locked.json`;
  await putApi(endpoint, false, {
    errorMessage: '데이터 잠금 해제에 실패했습니다.',
  });
};

/**
 * 앱스킴 잠금 (locked: true)
 */
export const lockAppScheme = async (id: string | number): Promise<void> => {
  const basePath = API_ENDPOINTS.APP_SCHEME.BASE;
  const endpoint = `${basePath}/${id}/locked.json`;
  await putApi(endpoint, true, {
    errorMessage: '데이터 잠금에 실패했습니다.',
  });
};

/**
 * 앱스킴 일괄 잠금 (locked: true)
 */
export const lockAppSchemes = async (ids: (string | number)[]): Promise<void> => {
  if (ids.length === 0) return;

  const updates: { [key: string]: boolean } = {};
  const basePath = API_ENDPOINTS.APP_SCHEME.BASE.replace(/^\//, '');

  ids.forEach((id) => {
    const path = `${basePath}/${id}/locked`;
    updates[path] = true;
  });

  const databaseUrl = env.testURL.replace(/\/$/, '');
  await patchApi('/.json', updates, {
    baseURL: databaseUrl,
    errorMessage: '데이터 일괄 잠금에 실패했습니다.',
  });
};

/**
 * 승인된 항목들을 실제 데이터로 삭제 (data_deletion인 경우)
 * @param items - 삭제할 앱스킴 아이템 배열 (id 포함)
 */
const _deleteApprovedAppSchemes = async (items: AppSchemeItem[]): Promise<void> => {
  if (items.length === 0) {
    console.log('🔍 deleteApprovedAppSchemes: items가 비어있음');
    return;
  }

  console.log('🔍 deleteApprovedAppSchemes 입력 items:', items);

  // 각 항목의 id 추출 (null, undefined, 빈 문자열 제외)
  const idsToDelete = items
    .map((item) => {
      const id = item.appSchemeId;
      console.log('🔍 deleteApprovedAppSchemes - item.id:', id, 'item:', item);
      return id;
    })
    .filter((id) => {
      const isValid = id !== undefined && id !== null && id !== '';
      console.log('🔍 deleteApprovedAppSchemes - id 필터링:', { id, isValid });
      return isValid;
    }) as (string | number)[];

  console.log('🔍 deleteApprovedAppSchemes - 추출된 idsToDelete:', idsToDelete);

  if (idsToDelete.length === 0) {
    console.warn('🔍 deleteApprovedAppSchemes: 유효한 id가 없음');
    console.warn('🔍 deleteApprovedAppSchemes: 입력 items:', items);
    return;
  }

  console.log('🔍 deleteApprovedAppSchemes API 호출:', {
    idsToDelete,
    itemsCount: items.length,
    deleteEndpoints: idsToDelete.map((id) => API_ENDPOINTS.APP_SCHEME.DELETE(id)),
  });

  // Firebase Multi-Path Update를 사용하여 일괄 삭제
  const updates: { [key: string]: null } = {};
  // DELETE 엔드포인트에서 경로 추출: '/data-reg/app-scheme/${id}.json' -> 'data-reg/app-scheme'

  idsToDelete.forEach((id) => {
    // Firebase 경로는 앞의 슬래시를 제거하고 .json도 제거해야 함
    // 예: data-reg/app-scheme/temp_1764052479281_1_l8gsmmdv1
    const path = `${basePath}/${id}`;
    updates[path] = null;
    console.log('🔍 삭제 경로 추가:', { id, path });
  });

  if (Object.keys(updates).length === 0) {
    console.warn('🔍 deleteApprovedAppSchemes: 삭제할 항목이 없음');
    return;
  }

  // Firebase REST API를 통해 Multi-Path Update 실행
  const databaseUrl = env.testURL.replace(/\/$/, ''); // 마지막 슬래시 제거

  console.log('🔍 deleteApprovedAppSchemes Firebase 업데이트:', {
    updates,
    updatesCount: Object.keys(updates).length,
  });

  try {
    await patchApi('/.json', updates, {
      baseURL: databaseUrl,
      errorMessage: '승인된 항목 삭제에 실패했습니다.',
    });

    console.log(`🔍 승인된 항목 ${idsToDelete.length}개가 삭제되었습니다.`);
  } catch (error) {
    console.error('🔍 deleteApprovedAppSchemes 오류:', error);
    throw error;
  }
};

/**
 * 승인된 항목들을 실제 데이터로 수정 (data_modification인 경우)
 * @param items - 수정할 앱스킴 아이템 배열 (id 포함)
 */
const _updateApprovedAppSchemes = async (items: AppSchemeItem[]): Promise<void> => {
  if (items.length === 0) {
    console.log('🔍 updateApprovedAppSchemes: items가 비어있음');
    return;
  }

  console.log('🔍 updateApprovedAppSchemes API 호출:', {
    itemsCount: items.length,
    items: items.map((item) => ({ appSchemeId: item.appSchemeId })),
  });

  // 로딩 시작
  useLoadingStore.getState().start();

  try {
    // 각 항목을 개별적으로 UPDATE 엔드포인트로 수정
    for (const item of items) {
      const id = item.appSchemeId;
      if (!id) {
        console.warn('🔍 id가 없는 항목 건너뜀:', item);
        continue;
      }

      const endpoint = API_ENDPOINTS.APP_SCHEME.UPDATE(id);
      console.log('🔍 개별 항목 수정:', { id, endpoint });

      await putApi<AppSchemeItem>(endpoint, item, {
        errorMessage: `앱스킴 수정에 실패했습니다. (id: ${id})`,
      });
    }

    console.log(`🔍 승인된 항목 ${items.length}개가 수정되었습니다.`);
  } finally {
    useLoadingStore.getState().stop();
  }
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
