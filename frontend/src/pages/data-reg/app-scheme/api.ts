// 앱스킴 관련 API 함수
// 순수 함수로 비즈니스 로직만 담당 (React Query와 독립적)

import { getApi, postApi, putApi, patchApi, deleteItems } from '@/utils/apiUtils';
import { useLoadingStore } from '@/store/loading';
import { API_ENDPOINTS } from '@/constants/endpoints';
import { env } from '@/config';
import type { AppSchemeItem } from './types';
import { toCompactFormat, formatDateForStorage } from '@/utils/dateUtils';
import type { Dayjs } from 'dayjs';
import { APPROVAL_STATUS_OPTIONS } from '@/constants/options';

/**
 * Firebase 응답 데이터를 AppSchemeItem으로 변환하는 헬퍼 함수
 */
const transformItem = (
  v: Partial<AppSchemeItem> & Record<string, any>,
  options: { index: number; fallbackId?: string | number },
): AppSchemeItem => {
  const { index, fallbackId } = options;

  return {
    no: v.no ?? index + 1,
    id: String(v.id ?? fallbackId ?? index + 1),
    product_menu_name: v.product_menu_name ?? '',
    description: v.description ?? '',
    app_scheme_link: v.app_scheme_link ?? '',
    one_link: v.one_link ?? '',
    goods_name_list: v.goods_name_list ?? null,
    parent_id: v.parent_id ?? null,
    parent_title: v.parent_title ?? null,
    start_date: v.start_date ? String(v.start_date) : '',
    end_date: v.end_date ? String(v.end_date) : '',
    updatedAt: v.updatedAt ? String(v.updatedAt) : '',
    registeredAt: v.registeredAt ? String(v.registeredAt) : '',
    status: (v.status as AppSchemeItem['status']) ?? 'in_service',
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
        const v = item as Partial<AppSchemeItem> & Record<string, any>;
        return transformItem(v, { index });
      })
      .filter((item): item is AppSchemeItem => item !== null);
  }

  // 객체 형태 응답도 지원 (기존 방식)
  if (typeof raw === 'object' && raw !== null) {
    const entries = Object.entries(raw as Record<string, unknown>) as [string, any][];

    return entries.map(([key, value], index) => {
      const v = value as Partial<AppSchemeItem> & Record<string, any>;
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
export const fetchAppSchemes = async (
  params?: FetchAppSchemesParams,
): Promise<AppSchemeItem[]> => {
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

  const response = await getApi<AppSchemeItem[]>(
    API_ENDPOINTS.APP_SCHEME.LIST,
    {
      baseURL: env.testURL,
      transform: transformAppSchemes,
      errorMessage: '앱스킴 데이터를 불러오지 못했습니다.',
    },
  );

  return response.data;
};

/**
 * 앱스킴 상세 조회
 */
export const fetchAppScheme = async (id: string | number): Promise<AppSchemeItem> => {
  const response = await getApi<Partial<AppSchemeItem> & Record<string, any>>(
    API_ENDPOINTS.APP_SCHEME.DETAIL(id),
    {
      baseURL: env.testURL,
      errorMessage: '앱스킴 상세 데이터를 불러오지 못했습니다.',
    },
  );

  // Firebase 응답 데이터를 AppSchemeItem으로 변환
  return transformItem(response.data, { index: 0, fallbackId: id });
};

/**
 * 승인 요청 데이터 타입
 */
type ApprovalFormType = 'data_registration' | 'data_modification' | 'data_deletion';

interface ApprovalRequestData {
  approval_form: ApprovalFormType;
  title: string;
  content: string;
  request_date: string;
  status: 'create_requested' | 'update_requested' | 'delete_requested' | 'in_review' | 'done_review';
  list: AppSchemeItem[];
}

/**
 * 승인 요청 API 호출
 */
const sendApprovalRequest = async (
  approvalForm: ApprovalFormType,
  items: AppSchemeItem[],
): Promise<void> => {
  const titleMap: Record<ApprovalFormType, string> = {
    data_registration: '데이터 등록',
    data_modification: '데이터 수정',
    data_deletion: '데이터 삭제',
  };

  const contentMap: Record<ApprovalFormType, string> = {
    data_registration: '앱스킴 등록 요청드립니다',
    data_modification: '앱스킴 수정 요청드립니다',
    data_deletion: '앱스킴 삭제 요청드립니다',
  };

  // approval_form에 따라 적절한 status 설정 (상수에서 value 추출)
  const statusMap: Record<ApprovalFormType, 'create_requested' | 'update_requested' | 'delete_requested'> = {
    data_registration: APPROVAL_STATUS_OPTIONS.find((opt) => opt.value === 'create_requested')?.value as 'create_requested',
    data_modification: APPROVAL_STATUS_OPTIONS.find((opt) => opt.value === 'update_requested')?.value as 'update_requested',
    data_deletion: APPROVAL_STATUS_OPTIONS.find((opt) => opt.value === 'delete_requested')?.value as 'delete_requested',
  };

  const approvalData: ApprovalRequestData = {
    approval_form: approvalForm,
    title: titleMap[approvalForm],
    content: contentMap[approvalForm],
    request_date: formatDateForStorage(new Date(), 'YYYYMMDDHHmmss') || '',
    status: statusMap[approvalForm],
    list: items,
  };

  try {
    await postApi(
      API_ENDPOINTS.APP_SCHEME.APPROVAL_LIST,
      approvalData,
      {
        baseURL: env.testURL,
        errorMessage: '승인 요청 전송에 실패했습니다.',
      },
    );
    console.log(`승인 요청이 전송되었습니다. (${titleMap[approvalForm]})`);
  } catch (error) {
    console.error('승인 요청 전송 오류:', error);
    // 승인 요청 실패는 CUD 작업 성공에 영향을 주지 않도록 에러를 던지지 않음
  }
};

/**
 * 입력 데이터를 API 전송 형식으로 변환하는 공통 함수
 * 폼 데이터와 엑셀 데이터 모두를 변환할 수 있도록 지원
 * 
 * @param inputData - 폼 또는 엑셀에서 입력된 데이터
 * @returns API 전송 형식의 데이터
 */
export const transformToApiFormat = (
  inputData: {
    product_menu_name?: string | null;
    description?: string | null;
    app_scheme_link?: string | null;
    one_link?: string | null;
    goods_name_list?: string | null;
    parent_id?: string | null;
    parent_title?: string | null;
    start_date?: string | Date | Dayjs | null;
    end_date?: string | Date | Dayjs | null;
    status?: string | null;
  },
): Partial<AppSchemeItem> => {
  // 날짜 변환
  let start_date = '';
  if (inputData.start_date) {
    if (typeof inputData.start_date === 'object' && 'toDate' in inputData.start_date) {
      // Dayjs 객체인 경우
      start_date = toCompactFormat((inputData.start_date as Dayjs).toDate()) || '';
    } else {
      // 문자열 또는 Date 객체인 경우
      start_date = toCompactFormat(inputData.start_date) || '';
    }
  }

  let end_date = '';
  if (inputData.end_date) {
    if (typeof inputData.end_date === 'object' && 'toDate' in inputData.end_date) {
      // Dayjs 객체인 경우
      end_date = toCompactFormat((inputData.end_date as Dayjs).toDate()) || '';
    } else {
      // 문자열 또는 Date 객체인 경우
      end_date = toCompactFormat(inputData.end_date) || '';
    }
  }

  return {
    product_menu_name: inputData.product_menu_name ? String(inputData.product_menu_name) : '',
    description: inputData.description ? String(inputData.description) : '',
    app_scheme_link: inputData.app_scheme_link ? String(inputData.app_scheme_link) : '',
    one_link: inputData.one_link ? String(inputData.one_link) : '',
    goods_name_list: inputData.goods_name_list ? String(inputData.goods_name_list) : null,
    parent_id: inputData.parent_id ? String(inputData.parent_id) : null,
    parent_title: inputData.parent_title ? String(inputData.parent_title) : null,
    start_date,
    end_date,
    status: (inputData.status as AppSchemeItem['status']) || 'in_service',
  };
};

/**
 * 승인된 항목들을 실제 데이터로 등록 (data_registration인 경우)
 * @param items - 등록할 앱스킴 아이템 배열 (id 포함)
 */
const createApprovedAppSchemes = async (
  items: AppSchemeItem[],
): Promise<void> => {
  if (items.length === 0) {
    console.log('🔍 createApprovedAppSchemes: items가 비어있음');
    return;
  }

  // Firebase Multi-Path Update를 사용하여 각 항목을 지정된 id로 등록
  const updates: { [key: string]: Partial<AppSchemeItem> } = {};
  const basePath = 'data-reg/app-scheme';
  
  items.forEach((item) => {
    // list에 있는 id를 그대로 사용하여 등록
    const id = item.id;
    updates[`${basePath}/${id}`] = item;
  });

  // Firebase REST API를 통해 Multi-Path Update 실행
  const databaseUrl = env.testURL.replace(/\/$/, ''); // 마지막 슬래시 제거
  const updatesUrl = `${databaseUrl}/.json`;

  console.log('🔍 createApprovedAppSchemes API 호출:', {
    updatesUrl,
    updates,
    itemsCount: items.length,
  });

  try {
    const response = await fetch(updatesUrl, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('🔍 createApprovedAppSchemes API 실패:', {
        status: response.status,
        statusText: response.statusText,
        errorText,
      });
      throw new Error(`승인된 항목 등록에 실패했습니다. (${response.status})`);
    }

    console.log(`🔍 승인된 항목 ${items.length}개가 등록되었습니다.`);
  } catch (error) {
    console.error('🔍 createApprovedAppSchemes 오류:', error);
    throw error;
  }
};

/**
 * 앱스킴 생성 (승인 요청 전송 후 실제 데이터 생성)
 */
export const createAppScheme = async (
  data: Partial<AppSchemeItem>,
): Promise<AppSchemeItem> => {
  // 임시 ID 생성 (승인 후 실제 생성될 때 사용될 ID)
  const tempId = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  // AppSchemeItem 형식으로 변환
  const item = transformItem(
    { ...data, id: tempId } as Partial<AppSchemeItem> & Record<string, any>,
    { index: 0, fallbackId: tempId },
  );

  // 승인 요청 전송
  await sendApprovalRequest('data_registration', [item]);

  // 결재 요청 성공 후 실제 데이터 생성 (같은 id로)
  await createApprovedAppSchemes([item]);

  return item;
};

/**
 * 승인 요청 정보 조회
 */
export const fetchApprovalRequest = async (
  approvalId: string | number,
): Promise<Partial<ApprovalRequestData> & Record<string, any>> => {
  const endpoint = `/approval/app-scheme/${approvalId}.json`;
  const response = await getApi<Partial<ApprovalRequestData> & Record<string, any>>(
    endpoint,
    {
      baseURL: env.testURL,
      errorMessage: '승인 요청 정보를 불러오지 못했습니다.',
    },
  );

  return response.data;
};

/**
 * 승인 요청 상세 조회 (결재 요청에 포함된 앱스킴 목록)
 */
export const fetchApprovalDetailAppSchemes = async (
  approvalId: string | number,
): Promise<AppSchemeItem[]> => {
  const endpoint = API_ENDPOINTS.APP_SCHEME.APPROVAL_DETAIL_LIST(approvalId);
  console.log('🔍 fetchApprovalDetailAppSchemes API 호출:', {
    endpoint,
    baseURL: env.testURL,
    fullUrl: `${env.testURL}${endpoint}`,
  });
  
  const response = await getApi<AppSchemeItem[]>(
    endpoint,
    {
      baseURL: env.testURL,
      transform: transformAppSchemes,
      errorMessage: '승인 요청 상세 데이터를 불러오지 못했습니다.',
    },
  );

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
  const endpoint = `/approval/app-scheme/${approvalId}.json`;
  
  const updateData: { status: string; process_date?: string } = { status };
  if (processDate) {
    updateData.process_date = processDate;
  }
  
  console.log('🔍 updateApprovalRequestStatus API 호출:', {
    endpoint,
    updateData,
    baseURL: env.testURL,
    fullUrl: `${env.testURL}${endpoint}`,
  });
  
  await patchApi(
    endpoint,
    updateData,
    {
      baseURL: env.testURL,
      errorMessage: '승인 요청 상태 수정에 실패했습니다.',
    },
  );
  
  console.log('🔍 updateApprovalRequestStatus API 완료');
};

/**
 * 승인된 항목들을 실제 데이터로 삭제 (data_deletion인 경우)
 * @param items - 삭제할 앱스킴 아이템 배열 (id 포함)
 */
const deleteApprovedAppSchemes = async (
  items: AppSchemeItem[],
): Promise<void> => {
  if (items.length === 0) {
    console.log('🔍 deleteApprovedAppSchemes: items가 비어있음');
    return;
  }

  console.log('🔍 deleteApprovedAppSchemes 입력 items:', items);

  // 각 항목의 id 추출 (null, undefined, 빈 문자열 제외)
  const idsToDelete = items
    .map((item) => {
      const id = item.id;
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
  const basePath = 'data-reg/app-scheme';
  
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
  const updatesUrl = `${databaseUrl}/.json`;

  console.log('🔍 deleteApprovedAppSchemes Firebase 업데이트:', {
    updatesUrl,
    updates,
    updatesCount: Object.keys(updates).length,
  });

  try {
    const response = await fetch(updatesUrl, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('🔍 deleteApprovedAppSchemes API 실패:', {
        status: response.status,
        statusText: response.statusText,
        errorText,
      });
      throw new Error(`승인된 항목 삭제에 실패했습니다. (${response.status})`);
    }

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
const updateApprovedAppSchemes = async (
  items: AppSchemeItem[],
): Promise<void> => {
  if (items.length === 0) {
    console.log('🔍 updateApprovedAppSchemes: items가 비어있음');
    return;
  }

  console.log('🔍 updateApprovedAppSchemes API 호출:', {
    itemsCount: items.length,
    items: items.map((item) => ({ id: item.id })),
  });

  // 로딩 시작
  useLoadingStore.getState().start();

  try {
    // 각 항목을 개별적으로 UPDATE 엔드포인트로 수정
    for (const item of items) {
      const id = item.id;
      if (!id) {
        console.warn('🔍 id가 없는 항목 건너뜀:', item);
        continue;
      }

      const endpoint = API_ENDPOINTS.APP_SCHEME.UPDATE(id);
      console.log('🔍 개별 항목 수정:', { id, endpoint });

      await putApi<AppSchemeItem>(
        endpoint,
        item,
        {
          baseURL: env.testURL,
          errorMessage: `앱스킴 수정에 실패했습니다. (id: ${id})`,
        },
      );
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
    { ...data, id: String(id) } as Partial<AppSchemeItem> & Record<string, any>,
    { index: 0, fallbackId: id },
  );
  
  // 승인 요청 전송
  await sendApprovalRequest('data_modification', [updatedItem]);
  
  // 결재 요청 성공 후 실제 데이터 수정
  await updateApprovedAppSchemes([updatedItem]);

  return updatedItem;
};

/**
 * 앱스킴 삭제 (승인 요청 전송 후 실제 데이터 삭제)
 */
export const deleteAppScheme = async (
  id: string | number,
): Promise<void> => {
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
    await sendApprovalRequest('data_deletion', [deletedItem]);
    
    // 결재 요청 성공 후 실제 데이터 삭제
    await deleteApprovedAppSchemes([deletedItem]);
  } else {
    throw new Error('삭제할 데이터를 찾을 수 없습니다.');
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
    await sendApprovalRequest('data_deletion', deletedItems);
    
    // 결재 요청 성공 후 실제 데이터 삭제
    await deleteApprovedAppSchemes(deletedItems);
  } else {
    throw new Error('삭제할 데이터를 찾을 수 없습니다.');
  }
};



