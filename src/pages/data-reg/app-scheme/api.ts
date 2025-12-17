// 앱스킴 관련 API 함수
// 순수 함수로 비즈니스 로직만 담당 (React Query와 독립적)

import {
  getApi,
  putApi,
  patchApi,
  fetchApi,
  sendApprovalRequest as sendApprovalRequestCommon,
} from '@/utils/apiUtils';
import { toast } from 'react-toastify';
import { useLoadingStore } from '@/store/loading';
import { API_ENDPOINTS } from '@/constants/endpoints';
import { env } from '@/config/env';
import { TOAST_MESSAGES } from '@/constants/message';
import type { AppSchemeItem } from './types';
import { toCompactFormat } from '@/utils/dateUtils';
import type { Dayjs } from 'dayjs';
import {
  DATA_REGISTRATION,
  DATA_MODIFICATION,
  DATA_DELETION,
  TARGET_TYPE_APP,
  OUT_OF_SERVICE,
} from '@/constants/options';
import type { ApprovalFormType, ApprovalRequestItem } from '@/types/types';

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
    no: (v.no as number) ?? index + 1,
    appSchemeId: String(v.id ?? fallbackId ?? index + 1),
    productMenuName: (v.product_menu_name as string) ?? (v.productMenuName as string) ?? '',
    description: (v.description as string) ?? '',
    appSchemeLink: (v.app_scheme_link as string) ?? (v.appSchemeLink as string) ?? '',
    oneLink: (v.one_link as string) ?? (v.oneLink as string) ?? '',
    goodsNameList: (v.goods_name_list as string) ?? (v.goodsNameList as string) ?? null,
    parentId: (v.parent_id as string) ?? (v.parentId as string) ?? null,
    parentTitle: (v.parent_title as string) ?? (v.parentTitle as string) ?? null,
    startDate: v.start_date ? String(v.start_date) : v.startDate ? String(v.startDate) : '',
    endDate: v.end_date ? String(v.end_date) : v.endDate ? String(v.endDate) : '',
    updatedAt: v.updatedAt ? String(v.updatedAt) : '',
    createdAt: v.createdAt ? String(v.createdAt) : '',
    status: (v.status as AppSchemeItem['status']) ?? OUT_OF_SERVICE,
    locked: (v.locked as boolean) ?? false,
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
 * 앱스킴 목록 조회 파라미터 타입
 */
export interface FetchAppSchemesParams {
  /** 페이지 번호 (0부터 시작) */
  page?: number;
  /** 페이지당 행 수 */
  pageSize?: number;
  /** 검색 조건 (필드명: 값 형태의 객체) */
  searchParams?: Record<string, string | number>;
}

/**
 * 앱스킴 목록 조회
 */
export const fetchAppSchemes = async (params?: FetchAppSchemesParams): Promise<AppSchemeItem[]> => {
  const { page = 0, pageSize = 20, searchParams = {} } = params || {};

  // 현재는 Firebase Realtime을 사용하므로 파라미터는 console.log로만 출력
  console.log('🔍 앱스킴 목록 조회 파라미터:', {
    page,
    pageSize,
    searchParams,
  });

  // TODO: 실제 REST API로 전환 시 아래 주석을 해제하고 사용
  // const queryParams = new URLSearchParams();
  // queryParams.append('page', String(page));
  // queryParams.append('pageSize', String(pageSize));
  //
  // // 검색 조건을 쿼리 파라미터로 추가
  // Object.entries(searchParams).forEach(([key, value]) => {
  //   if (value !== undefined && value !== null && value !== '') {
  //     queryParams.append(key, String(value));
  //   }
  // });

  // const endpoint = `${API_ENDPOINTS.APP_SCHEME.LIST}?${queryParams.toString()}`;

  const response = await getApi<AppSchemeItem[]>(API_ENDPOINTS.APP_SCHEME.LIST, {
    transform: transformAppSchemes,
    errorMessage: TOAST_MESSAGES.LOAD_DATA_FAILED,
  });

  return response.data;
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
      item.description || '앱스킴',
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
  productMenuName?: string | null;
  description?: string | null;
  appSchemeLink?: string | null;
  oneLink?: string | null;
  goodsNameList?: string | null;
  parentId?: string | null;
  parentTitle?: string | null;
  startDate?: string | Date | Dayjs | null;
  endDate?: string | Date | Dayjs | null;
  status?: string | null;
}): Partial<AppSchemeItem> => {
  // 날짜 변환
  let startDate = '';
  if (inputData.startDate) {
    if (typeof inputData.startDate === 'object' && 'toDate' in inputData.startDate) {
      // Dayjs 객체인 경우
      startDate = toCompactFormat((inputData.startDate as Dayjs).toDate()) || '';
    } else {
      // 문자열 또는 Date 객체인 경우
      startDate = toCompactFormat(inputData.startDate) || '';
    }
  }

  let endDate = '';
  if (inputData.endDate) {
    if (typeof inputData.endDate === 'object' && 'toDate' in inputData.endDate) {
      // Dayjs 객체인 경우
      endDate = toCompactFormat((inputData.endDate as Dayjs).toDate()) || '';
    } else {
      // 문자열 또는 Date 객체인 경우
      endDate = toCompactFormat(inputData.endDate) || '';
    }
  }

  return {
    productMenuName: inputData.productMenuName ? String(inputData.productMenuName) : '',
    description: inputData.description ? String(inputData.description) : '',
    appSchemeLink: inputData.appSchemeLink ? String(inputData.appSchemeLink) : '',
    oneLink: inputData.oneLink ? String(inputData.oneLink) : '',
    goodsNameList: inputData.goodsNameList ? String(inputData.goodsNameList) : null,
    parentId: inputData.parentId ? String(inputData.parentId) : null,
    parentTitle: inputData.parentTitle ? String(inputData.parentTitle) : null,
    startDate,
    endDate,
    status: (inputData.status as AppSchemeItem['status']) || OUT_OF_SERVICE,
  };
};

/**
 * 승인된 항목들을 실제 데이터로 등록 (data_registration인 경우)
 * @param items - 등록할 앱스킴 아이템 배열 (id 포함)
 */
const createApprovedAppSchemes = async (items: AppSchemeItem[]): Promise<void> => {
  if (items.length === 0) {
    console.log('🔍 createApprovedAppSchemes: items가 비어있음');
    return;
  }

  // Firebase Multi-Path Update를 사용하여 각 항목을 지정된 id로 등록
  const updates: { [key: string]: Partial<AppSchemeItem> } = {};

  items.forEach((item) => {
    // list에 있는 id를 그대로 사용하여 등록
    const id = item.appSchemeId;
    updates[`${basePath}/${id}`] = item;
  });

  // Firebase REST API를 통해 Multi-Path Update 실행
  const databaseUrl = env.testURL.replace(/\/$/, ''); // 마지막 슬래시 제거

  console.log('🔍 createApprovedAppSchemes API 호출:', {
    updates,
    itemsCount: items.length,
  });

  try {
    await patchApi('/.json', updates, {
      baseURL: databaseUrl,
      errorMessage: '승인된 항목 등록에 실패했습니다.',
    });

    console.log(`🔍 승인된 항목 ${items.length}개가 등록되었습니다.`);
  } catch (error) {
    console.error('🔍 createApprovedAppSchemes 오류:', error);
    throw error;
  }
};

/**
 * 앱스킴 생성 (승인 요청 전송 후 실제 데이터 생성)
 */
export const createAppScheme = async (data: Partial<AppSchemeItem>): Promise<AppSchemeItem> => {
  // 임시 ID 생성 (승인 후 실제 생성될 때 사용될 ID)
  const tempId = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  // AppSchemeItem 형식으로 변환
  const item = transformItem(
    { ...data, id: tempId } as Partial<AppSchemeItem> & Record<string, unknown>,
    { index: 0, fallbackId: tempId },
  );

  // 승인 요청 전송
  await sendApprovalRequest(DATA_REGISTRATION, [item]);

  // 결재 요청 성공 후 실제 데이터 생성 (같은 id로)
  await createApprovedAppSchemes([item]);

  return item;
};

/**
 * 앱스킴 일괄 생성 (승인 요청 전송 후 실제 데이터 생성)
 * @param items - 생성할 앱스킴 아이템 배열
 */
export const createAppSchemesBatch = async (items: Partial<AppSchemeItem>[]): Promise<void> => {
  // 각 아이템에 대해 임시 ID 생성 및 변환
  const transformedItems = items.map((data, index) => {
    const tempId = `temp_${Date.now()}_${index}_${Math.random().toString(36).substr(2, 9)}`;
    return transformItem(
      { ...data, id: tempId } as Partial<AppSchemeItem> & Record<string, unknown>,
      {
        index,
        fallbackId: tempId,
      },
    );
  });

  // 승인 요청 전송 (일괄)
  await sendApprovalRequest(DATA_REGISTRATION, transformedItems);

  // 결재 요청 성공 후 실제 데이터 생성 (같은 id로)
  await createApprovedAppSchemes(transformedItems);
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
    no: (v.no as number) ?? 0,
    approvalRequestId: String(v.approvalRequestId ?? v.id ?? approvalId),
    targetType: (v.targetType as string) ?? '',
    targetId: (v.targetId as string) ?? '',
    itsvcNo: (v.itsvcNo as string) ?? null,
    requestKind: (v.requestKind as string) ?? (v.approval_form as string) ?? '',
    approvalStatus: (v.approvalStatus as string) ?? (v.status as string) ?? 'request',
    title: (v.title as string) ?? null,
    content: (v.content as string) ?? null,
    createdBy: (v.createdBy as string) ?? (v.requester as string) ?? '',
    department: (v.department as string) ?? '',
    updatedBy: (v.updatedBy as string) ?? null,
    createdAt: (v.createdAt as string) ?? (v.request_date ? String(v.request_date) : ''),
    updatedAt: (v.updatedAt as string) ?? (v.process_date ? String(v.process_date) : ''),
    isRetracted: (v.isRetracted as number) ?? 0,
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
const deleteApprovedAppSchemes = async (items: AppSchemeItem[]): Promise<void> => {
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
const updateApprovedAppSchemes = async (items: AppSchemeItem[]): Promise<void> => {
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
 * 앱스킴 수정 (승인 요청 전송 후 실제 데이터 수정)
 */
export const updateAppScheme = async (
  id: string | number,
  data: Partial<AppSchemeItem>,
): Promise<AppSchemeItem> => {
  const updatedItem = transformItem(
    { ...data, id: String(id) } as Partial<AppSchemeItem> & Record<string, unknown>,
    { index: 0, fallbackId: id },
  );

  // 승인 요청 전송
  await sendApprovalRequest(DATA_MODIFICATION, [updatedItem]);
  toast.success(TOAST_MESSAGES.UPDATE_REQUESTED);

  // 데이터 잠금
  await lockAppScheme(id);

  // 결재 요청 성공 후 실제 데이터 수정
  // await updateApprovedAppSchemes([updatedItem]);

  return updatedItem;
};

/**
 * 앱스킴 삭제 (승인 요청 전송 후 실제 데이터 삭제)
 */
export const deleteAppScheme = async (id: string | number): Promise<void> => {
  useLoadingStore.getState().start();
  try {
    // 삭제 전에 데이터 조회 (승인 요청에 사용)
    let deletedItem: AppSchemeItem | null = null;
    try {
      deletedItem = await fetchAppScheme(id);
    } catch (error) {
      console.warn('삭제 전 데이터 조회 실패:', error);
      throw new Error('삭제할 데이터를 조회하지 못했습니다.');
    }

    // 승인 요청 전송
    if (deletedItem) {
      await sendApprovalRequest(DATA_DELETION, [deletedItem]);
      toast.success(TOAST_MESSAGES.DELETE_SUCCESS);

      // 데이터 잠금
      await lockAppScheme(id);

      // 결재 요청 성공 후 실제 데이터 삭제
      // await deleteApprovedAppSchemes([deletedItem]);
    } else {
      throw new Error('삭제할 데이터를 찾을 수 없습니다.');
    }
  } finally {
    useLoadingStore.getState().stop();
  }
};

/**
 * 여러 앱스킴을 한 번에 삭제 (승인 요청 전송 후 실제 데이터 삭제)
 * @param itemIdsToDelete - 삭제할 아이템 ID 배열
 */
export const deleteAppSchemes = async (itemIdsToDelete: (string | number)[]): Promise<void> => {
  if (itemIdsToDelete.length === 0) {
    return;
  }

  useLoadingStore.getState().start();
  try {
    // 삭제 전에 데이터 조회 (승인 요청에 사용)
    const deletedItems: AppSchemeItem[] = [];
    for (const id of itemIdsToDelete) {
      try {
        const item = await fetchAppScheme(id);
        deletedItems.push(item);
      } catch (error) {
        console.warn(`삭제 전 데이터 조회 실패 (id: ${id}):`, error);
      }
    }

    // 승인 요청 전송
    if (deletedItems.length > 0) {
      await sendApprovalRequest(DATA_DELETION, deletedItems);
      toast.success(TOAST_MESSAGES.DELETE_SUCCESS);

      // 데이터 일괄 잠금
      await lockAppSchemes(itemIdsToDelete);

      // 결재 요청 성공 후 실제 데이터 삭제
      // await deleteApprovedAppSchemes(deletedItems);
    } else {
      throw new Error('삭제할 데이터를 찾을 수 없습니다.');
    }
  } finally {
    useLoadingStore.getState().stop();
  }
};
