// 추천질문 관련 API 함수
// 순수 함수로 비즈니스 로직만 담당 (React Query와 독립적)

import { getApi, postApi, putApi, patchApi, deleteApi, deleteItems } from '@/utils/apiUtils';
import { API_ENDPOINTS } from '@/constants/endpoints';
import { env } from '@/config';
import type { RecommendedQuestionItem } from './types';
import { toCompactFormat, formatDateForStorage } from '@/utils/dateUtils';
import type { Dayjs } from 'dayjs';
import { useLoadingStore } from '@/store/loading';
import { APPROVAL_STATUS_OPTIONS } from '@/constants/options';

/**
 * Firebase 응답 데이터를 RecommendedQuestionItem으로 변환하는 헬퍼 함수
 */
const transformItem = (
  v: Partial<RecommendedQuestionItem> & Record<string, any>,
  options: { index: number; fallbackId?: string | number },
): RecommendedQuestionItem => {
  const { index, fallbackId } = options;

  return {
    no: v.no ?? index + 1,
    qst_id: String(v.qst_id ?? fallbackId ?? index + 1),
    service_nm: v.service_nm ?? '',
    display_ctnt: v.display_ctnt ?? '',
    prompt_ctnt: v.prompt_ctnt ?? null,
    qst_ctgr: v.qst_ctgr ?? '',
    qst_style: v.qst_style ?? null,
    parent_id: v.parent_id ?? null,
    parent_nm: v.parent_nm ?? null,
    age_grp: v.age_grp ?? null,
    under_17_yn: v.under_17_yn ?? 'N',
    imp_start_date: v.imp_start_date ? String(v.imp_start_date) : '',
    imp_end_date: v.imp_end_date ? String(v.imp_end_date) : '',
    updatedAt: v.updatedAt ? String(v.updatedAt) : '',
    registeredAt: v.registeredAt ? String(v.registeredAt) : '',
    status: (v.status as RecommendedQuestionItem['status']) ?? 'in_service',
  };
};

/**
 * Firebase 응답 데이터 변환 함수
 */
const transformRecommendedQuestions = (raw: unknown): RecommendedQuestionItem[] => {
  if (!raw) return [];

  // 배열 형태 응답: [null, { ... }, { ... }]
  if (Array.isArray(raw)) {
    return raw
      .map((item, index) => {
        if (!item) return null;
        const v = item as Partial<RecommendedQuestionItem> & Record<string, any>;
        return transformItem(v, { index });
      })
      .filter((item): item is RecommendedQuestionItem => item !== null);
  }

  // 객체 형태 응답도 지원 (기존 방식)
  if (typeof raw === 'object' && raw !== null) {
    const entries = Object.entries(raw as Record<string, unknown>) as [string, any][];

    return entries.map(([key, value], index) => {
      const v = value as Partial<RecommendedQuestionItem> & Record<string, any>;
      return transformItem(v, { index, fallbackId: key });
    });
  }

  return [];
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
  list: RecommendedQuestionItem[];
}

/**
 * 승인 요청 API 호출
 */
const sendApprovalRequest = async (
  approvalForm: ApprovalFormType,
  items: RecommendedQuestionItem[],
): Promise<void> => {
  const titleMap: Record<ApprovalFormType, string> = {
    data_registration: '데이터 등록',
    data_modification: '데이터 수정',
    data_deletion: '데이터 삭제',
  };

  const contentMap: Record<ApprovalFormType, string> = {
    data_registration: '추천질문 등록 요청드립니다',
    data_modification: '추천질문 수정 요청드립니다',
    data_deletion: '추천질문 삭제 요청드립니다',
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
      API_ENDPOINTS.RECOMMENDED_QUESTIONS.APPROVAL,
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
    // 엑셀에서 올 수 있는 필드 (service_cd, parent_id, parent_nm)
    service_cd?: string | null;
    service_nm?: string | null;
    // 폼에서 올 수 있는 필드 (parentId, parentIdName)
    parentId?: string | null;
    parentIdName?: string | null;
    // 공통 필드
    display_ctnt?: string | null;
    prompt_ctnt?: string | null;
    qst_ctgr?: string | null;
    qst_style?: string | null;
    parent_id?: string | null;
    parent_nm?: string | null;
    age_grp?: string | number | null;
    under_17_yn?: string | null;
    imp_start_date?: string | Date | Dayjs | null;
    imp_end_date?: string | Date | Dayjs | null;
    status?: string | null;
  },
): Partial<RecommendedQuestionItem> => {
  // service_nm 결정: service_nm이 있으면 사용, 없으면 service_cd 사용
  const service_nm = inputData.service_nm || inputData.service_cd || '';

  // parent_id 결정: parent_id가 있으면 사용, 없으면 parentId 사용
  const parent_id = inputData.parent_id || inputData.parentId || null;

  // parent_nm 결정: parent_nm이 있으면 사용, 없으면 parentIdName 사용
  const parent_nm = inputData.parent_nm || inputData.parentIdName || null;

  // 날짜 변환
  let imp_start_date = '';
  if (inputData.imp_start_date) {
    if (typeof inputData.imp_start_date === 'object' && 'toDate' in inputData.imp_start_date) {
      // Dayjs 객체인 경우
      imp_start_date = toCompactFormat((inputData.imp_start_date as Dayjs).toDate()) || '';
    } else {
      // 문자열 또는 Date 객체인 경우
      imp_start_date = toCompactFormat(inputData.imp_start_date) || '';
    }
  }

  let imp_end_date = '';
  if (inputData.imp_end_date) {
    if (typeof inputData.imp_end_date === 'object' && 'toDate' in inputData.imp_end_date) {
      // Dayjs 객체인 경우
      imp_end_date = toCompactFormat((inputData.imp_end_date as Dayjs).toDate()) || '';
    } else {
      // 문자열 또는 Date 객체인 경우
      imp_end_date = toCompactFormat(inputData.imp_end_date) || '';
    }
  }

  // age_grp를 문자열로 변환
  let age_grp: string | null = null;
  if (inputData.age_grp !== null && inputData.age_grp !== undefined && String(inputData.age_grp).trim() !== '') {
    age_grp = String(Number(inputData.age_grp));
  }

  return {
    service_nm,
    display_ctnt: inputData.display_ctnt ? String(inputData.display_ctnt) : '',
    prompt_ctnt: inputData.prompt_ctnt ? String(inputData.prompt_ctnt) : null,
    qst_ctgr: inputData.qst_ctgr ? String(inputData.qst_ctgr) : '',
    qst_style: inputData.qst_style ? String(inputData.qst_style) : null,
    parent_id,
    parent_nm,
    age_grp,
    under_17_yn: inputData.under_17_yn ? String(inputData.under_17_yn).toUpperCase() : 'N',
    imp_start_date,
    imp_end_date,
    status: (inputData.status as RecommendedQuestionItem['status']) || 'in_service',
  };
};

/**
 * 추천질문 목록 조회 파라미터 타입
 */
export interface FetchRecommendedQuestionsParams {
  /** 페이지 번호 (0부터 시작) */
  page?: number;
  /** 페이지당 행 수 */
  pageSize?: number;
  /** 검색 조건 (필드명: 값 형태의 객체) */
  searchParams?: Record<string, string | number>;
}

/**
 * 추천질문 목록 조회
 */
export const fetchRecommendedQuestions = async (
  params?: FetchRecommendedQuestionsParams,
): Promise<RecommendedQuestionItem[]> => {
  const { page = 0, pageSize = 20, searchParams = {} } = params || {};

  // 현재는 Firebase Realtime을 사용하므로 파라미터는 console.log로만 출력
  console.log('🔍 추천질문 목록 조회 파라미터:', {
    page,
    pageSize,
    searchParams,
  });

  // TODO: 실제 REST API로 전환 시 아래 주석을 해제하고 사용
   const queryParams = new URLSearchParams();
  // queryParams.append('page', String(page));
  // queryParams.append('pageSize', String(pageSize));
  //
  // // 검색 조건을 쿼리 파라미터로 추가
 //  Object.entries(searchParams).forEach(([key, value]) => {
  //   if (value !== undefined && value !== null && value !== '') {
  //     queryParams.append(key, String(value));
  //   }
  // });
  
  //const endpoint = `${API_ENDPOINTS.RECOMMENDED_QUESTIONS.LIST}?${queryParams.toString()}`;

  const response = await getApi<RecommendedQuestionItem[]>(
    API_ENDPOINTS.RECOMMENDED_QUESTIONS.LIST,
    {
      baseURL: env.testURL,
      transform: transformRecommendedQuestions,
      errorMessage: '추천질문 데이터를 불러오지 못했습니다.',
    },
  );

  return response.data;
};

/**
 * 추천질문 상세 조회
 */
export const fetchRecommendedQuestion = async (
  id: string | number,
): Promise<RecommendedQuestionItem> => {
  const response = await getApi<Partial<RecommendedQuestionItem> & Record<string, any>>(
    API_ENDPOINTS.RECOMMENDED_QUESTIONS.DETAIL(id),
    {
      baseURL: env.testURL,
      errorMessage: '추천질문 상세 데이터를 불러오지 못했습니다.',
    },
  );

  // Firebase 응답 데이터를 RecommendedQuestionItem으로 변환
  return transformItem(response.data, { index: 0, fallbackId: id });
};

/**
 * 승인 요청 정보 조회
 */
export const fetchApprovalRequest = async (
  approvalId: string | number,
): Promise<Partial<ApprovalRequestData> & Record<string, any>> => {
  const endpoint = `/approval/recommended-questions/${approvalId}.json`;
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
 * 승인 요청 상세 조회 (결재 요청에 포함된 추천질문 목록)
 */
export const fetchApprovalDetailQuestions = async (
  approvalId: string | number,
): Promise<RecommendedQuestionItem[]> => {
  const endpoint = API_ENDPOINTS.RECOMMENDED_QUESTIONS.APPROVAL_DETAIL_LIST(approvalId);
  console.log('🔍 fetchApprovalDetailQuestions API 호출:', {
    endpoint,
    baseURL: env.testURL,
    fullUrl: `${env.testURL}${endpoint}`,
  });
  
  const response = await getApi<RecommendedQuestionItem[]>(
    endpoint,
    {
      baseURL: env.testURL,
      transform: transformRecommendedQuestions,
      errorMessage: '승인 요청 상세 데이터를 불러오지 못했습니다.',
    },
  );

  console.log('🔍 fetchApprovalDetailQuestions API 완료, data:', response.data);
  return response.data;
};

/**
 * 추천질문 생성 (승인 요청만 전송)
 */
export const createRecommendedQuestion = async (
  data: Partial<RecommendedQuestionItem>,
): Promise<RecommendedQuestionItem> => {
  // 임시 ID 생성 (승인 후 실제 생성될 때 사용될 ID)
  const tempId = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  // RecommendedQuestionItem 형식으로 변환
  const item = transformItem(
    { ...data, qst_id: tempId } as Partial<RecommendedQuestionItem> & Record<string, any>,
    { index: 0, fallbackId: tempId },
  );

  // 승인 요청만 전송 (실제 데이터 생성은 승인 후 처리)
  await sendApprovalRequest('data_registration', [item]);

  return item;
};

/**
 * 추천질문 일괄 생성 (승인 요청만 전송)
 * @param items - 생성할 추천질문 아이템 배열
 */
export const createRecommendedQuestionsBatch = async (
  items: Partial<RecommendedQuestionItem>[],
): Promise<void> => {
  if (items.length === 0) {
    return;
  }

  // 임시 ID 생성 (승인 후 실제 생성될 때 사용될 ID)
  const baseTime = Date.now();
  
  // RecommendedQuestionItem 형식으로 변환
  const createdItems: RecommendedQuestionItem[] = items.map((item, index) => {
    const tempId = `temp_${baseTime}_${index}_${Math.random().toString(36).substr(2, 9)}`;
    return transformItem(
      { ...item, qst_id: tempId } as Partial<RecommendedQuestionItem> & Record<string, any>,
      { index, fallbackId: tempId },
    );
  });

  // 승인 요청만 전송 (실제 데이터 생성은 승인 후 처리)
  await sendApprovalRequest('data_registration', createdItems);
};

/**
 * 승인 요청 상세 목록 수정 (변경된 항목만 업데이트)
 * @param approvalId - 승인 요청 ID
 * @param changedItems - 변경된 추천질문 아이템 배열
 */
export const updateApprovalDetailList = async (
  approvalId: string | number,
  changedItems: RecommendedQuestionItem[],
): Promise<void> => {
  if (changedItems.length === 0) {
    return;
  }

  // 현재 승인 요청의 list 조회 (인덱스 찾기 위해)
  const currentList = await fetchApprovalDetailQuestions(approvalId);

  // Firebase Multi-Path Update를 위한 updates 객체 생성
  const updates: { [key: string]: RecommendedQuestionItem } = {};
  
  changedItems.forEach((changedItem) => {
    // 현재 list에서 해당 항목의 인덱스 찾기
    const index = currentList.findIndex((item) => item.qst_id === changedItem.qst_id);
    if (index !== -1) {
      // Firebase 경로: approval/recommended-questions/{id}/list/{index}
      const path = `approval/recommended-questions/${approvalId}/list/${index}`;
      updates[path] = changedItem;
    }
  });

  if (Object.keys(updates).length === 0) {
    return;
  }

  // Firebase REST API를 통해 Multi-Path Update 실행
  const databaseUrl = env.testURL.replace(/\/$/, ''); // 마지막 슬래시 제거
  const updatesUrl = `${databaseUrl}/.json`;

  // 로딩 시작
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
      throw new Error(`승인 요청 상세 목록 수정에 실패했습니다. (${response.status})`);
    }

    console.log(`승인 요청 상세 목록 ${changedItems.length}개 항목이 수정되었습니다.`);
  } finally {
    useLoadingStore.getState().stop();
  }
};

/**
 * 승인 요청 상세 목록에서 선택된 항목 삭제
 * @param approvalId - 승인 요청 ID
 * @param itemIdsToDelete - 삭제할 아이템 ID 배열 (qst_id)
 */
export const deleteApprovalDetailListItems = async (
  approvalId: string | number,
  itemIdsToDelete: (string | number)[],
): Promise<void> => {
  if (itemIdsToDelete.length === 0) {
    return;
  }

  // 현재 승인 요청의 list 조회 (인덱스 찾기 위해)
  const currentList = await fetchApprovalDetailQuestions(approvalId);

  // Firebase Multi-Path Update를 위한 updates 객체 생성 (null로 설정하여 삭제)
  const updates: { [key: string]: null } = {};
  
  itemIdsToDelete.forEach((itemId) => {
    // 현재 list에서 해당 항목의 인덱스 찾기
    const index = currentList.findIndex((item) => item.qst_id === String(itemId));
    if (index !== -1) {
      // Firebase 경로: approval/recommended-questions/{id}/list/{index}
      const path = `approval/recommended-questions/${approvalId}/list/${index}`;
      updates[path] = null; // null로 설정하여 삭제
    }
  });

  if (Object.keys(updates).length === 0) {
    return;
  }

  // Firebase REST API를 통해 Multi-Path Update 실행
  const databaseUrl = env.testURL.replace(/\/$/, ''); // 마지막 슬래시 제거
  const updatesUrl = `${databaseUrl}/.json`;

  // 로딩 시작
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
      throw new Error(`승인 요청 상세 목록 삭제에 실패했습니다. (${response.status})`);
    }

    console.log(`승인 요청 상세 목록 ${itemIdsToDelete.length}개 항목이 삭제되었습니다.`);
  } finally {
    useLoadingStore.getState().stop();
  }
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
  const endpoint = `/approval/recommended-questions/${approvalId}.json`;
  
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
 * 승인된 항목들을 실제 데이터로 등록 (data_registration인 경우)
 * @param items - 등록할 추천질문 아이템 배열 (qst_id 포함)
 */
export const createApprovedQuestions = async (
  items: RecommendedQuestionItem[],
): Promise<void> => {
  if (items.length === 0) {
    console.log('🔍 createApprovedQuestions: items가 비어있음');
    return;
  }

  // Firebase Multi-Path Update를 사용하여 각 항목을 지정된 qst_id로 등록
  const updates: { [key: string]: Partial<RecommendedQuestionItem> } = {};
  const createPath = API_ENDPOINTS.RECOMMENDED_QUESTIONS.CREATE.replace(/^\//, '').replace('.json', '');
  
  items.forEach((item) => {
    // list에 있는 qst_id를 그대로 사용하여 등록
    const qstId = item.qst_id;
    updates[`${createPath}/${qstId}`] = item;
  });

  // Firebase REST API를 통해 Multi-Path Update 실행
  const databaseUrl = env.testURL.replace(/\/$/, ''); // 마지막 슬래시 제거
  const updatesUrl = `${databaseUrl}/.json`;

  console.log('🔍 createApprovedQuestions API 호출:', {
    updatesUrl,
    updates,
    itemsCount: items.length,
  });

  // 로딩 시작
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
      const errorText = await response.text();
      console.error('🔍 createApprovedQuestions API 실패:', {
        status: response.status,
        statusText: response.statusText,
        errorText,
      });
      throw new Error(`승인된 항목 등록에 실패했습니다. (${response.status})`);
    }

    console.log(`🔍 승인된 항목 ${items.length}개가 등록되었습니다.`);
  } finally {
    useLoadingStore.getState().stop();
  }
};

/**
 * 승인된 항목들을 실제 데이터로 수정 (data_modification인 경우)
 * @param items - 수정할 추천질문 아이템 배열 (qst_id 포함)
 */
export const updateApprovedQuestions = async (
  items: RecommendedQuestionItem[],
): Promise<void> => {
  if (items.length === 0) {
    console.log('🔍 updateApprovedQuestions: items가 비어있음');
    return;
  }

  console.log('🔍 updateApprovedQuestions API 호출:', {
    itemsCount: items.length,
    items: items.map((item) => ({ qst_id: item.qst_id })),
  });

  // 로딩 시작 (putApi가 이미 로딩을 관리하지만, 여러 항목을 수정하는 경우를 위해)
  useLoadingStore.getState().start();

  try {
    // 각 항목을 개별적으로 UPDATE 엔드포인트로 수정
    for (const item of items) {
      const qstId = item.qst_id;
      if (!qstId) {
        console.warn('🔍 qst_id가 없는 항목 건너뜀:', item);
        continue;
      }

      const endpoint = API_ENDPOINTS.RECOMMENDED_QUESTIONS.UPDATE(qstId);
      console.log('🔍 개별 항목 수정:', { qst_id: qstId, endpoint });

      await putApi<RecommendedQuestionItem>(
        endpoint,
        item,
        {
          baseURL: env.testURL,
          errorMessage: `추천질문 수정에 실패했습니다. (qst_id: ${qstId})`,
        },
      );
    }

    console.log(`🔍 승인된 항목 ${items.length}개가 수정되었습니다.`);
  } finally {
    useLoadingStore.getState().stop();
  }
};

/**
 * 승인된 항목들을 실제 데이터로 삭제 (data_deletion인 경우)
 * @param items - 삭제할 추천질문 아이템 배열 (qst_id 포함)
 */
export const deleteApprovedQuestions = async (
  items: RecommendedQuestionItem[],
): Promise<void> => {
  if (items.length === 0) {
    console.log('🔍 deleteApprovedQuestions: items가 비어있음');
    return;
  }

  console.log('🔍 deleteApprovedQuestions 입력 items:', items);

  // 각 항목의 qst_id 추출 (null, undefined, 빈 문자열 제외)
  const qstIdsToDelete = items
    .map((item) => {
      const qstId = item.qst_id;
      console.log('🔍 deleteApprovedQuestions - item.qst_id:', qstId, 'item:', item);
      return qstId;
    })
    .filter((qstId) => {
      const isValid = qstId !== undefined && qstId !== null && qstId !== '';
      console.log('🔍 deleteApprovedQuestions - qstId 필터링:', { qstId, isValid });
      return isValid;
    }) as (string | number)[];

  console.log('🔍 deleteApprovedQuestions - 추출된 qstIdsToDelete:', qstIdsToDelete);

  if (qstIdsToDelete.length === 0) {
    console.warn('🔍 deleteApprovedQuestions: 유효한 qst_id가 없음');
    console.warn('🔍 deleteApprovedQuestions: 입력 items:', items);
    return;
  }

  console.log('🔍 deleteApprovedQuestions API 호출:', {
    qstIdsToDelete,
    itemsCount: items.length,
    deleteEndpoints: qstIdsToDelete.map((id) => API_ENDPOINTS.RECOMMENDED_QUESTIONS.DELETE(id)),
  });

  // Firebase Multi-Path Update를 사용하여 일괄 삭제
  const updates: { [key: string]: null } = {};
  // DELETE 엔드포인트에서 경로 추출: '/data-reg/qst/${id}.json' -> 'data-reg/qst'
  const basePath = 'data-reg/qst';
  
  qstIdsToDelete.forEach((qstId) => {
    // Firebase 경로는 앞의 슬래시를 제거하고 .json도 제거해야 함
    // 예: data-reg/qst/temp_1764052479281_1_l8gsmmdv1
    const path = `${basePath}/${qstId}`;
    updates[path] = null;
    console.log('🔍 삭제 경로 추가:', { qstId, path });
  });

  if (Object.keys(updates).length === 0) {
    console.warn('🔍 deleteApprovedQuestions: 삭제할 항목이 없음');
    return;
  }

  // Firebase REST API를 통해 Multi-Path Update 실행
  const databaseUrl = env.testURL.replace(/\/$/, ''); // 마지막 슬래시 제거
  const updatesUrl = `${databaseUrl}/.json`;

  console.log('🔍 deleteApprovedQuestions Firebase 업데이트:', {
    updatesUrl,
    updates,
    updatesCount: Object.keys(updates).length,
  });

  // 로딩 시작
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
      const errorText = await response.text();
      console.error('🔍 deleteApprovedQuestions API 실패:', {
        status: response.status,
        statusText: response.statusText,
        errorText,
      });
      throw new Error(`승인된 항목 삭제에 실패했습니다. (${response.status})`);
    }

    console.log(`🔍 승인된 항목 ${qstIdsToDelete.length}개가 삭제되었습니다.`);
  } finally {
    useLoadingStore.getState().stop();
  }

  console.log(`🔍 승인된 항목 ${qstIdsToDelete.length}개가 삭제되었습니다.`);
};

/**
 * 추천질문 수정
 */
export const updateRecommendedQuestion = async (
  id: string | number,
  data: Partial<RecommendedQuestionItem>,
): Promise<RecommendedQuestionItem> => {
  // 실제 데이터 수정 API 호출을 제거하고 승인 요청만 전송
  const updatedItem = transformItem(
    { ...data, qst_id: String(id) } as Partial<RecommendedQuestionItem> & Record<string, any>,
    { index: 0, fallbackId: id },
  );
  
  await sendApprovalRequest('data_modification', [updatedItem]);

  return updatedItem; // 승인 요청에 포함된 항목 반환
};

/**
 * 추천질문 삭제 (승인 요청만 전송)
 */
export const deleteRecommendedQuestion = async (
  id: string | number,
): Promise<void> => {
  // 삭제 전에 데이터 조회 (승인 요청에 사용)
  let deletedItem: RecommendedQuestionItem | null = null;
  try {
    deletedItem = await fetchRecommendedQuestion(id);
  } catch (error) {
    console.warn('삭제 전 데이터 조회 실패:', error);
    throw new Error('삭제할 데이터를 조회하지 못했습니다.');
  }

  // 실제 삭제 API 호출을 제거하고 승인 요청만 전송
  if (deletedItem) {
    await sendApprovalRequest('data_deletion', [deletedItem]);
  } else {
    throw new Error('삭제할 데이터를 찾을 수 없습니다.');
  }
};

/**
 * 여러 추천질문을 한 번에 삭제 (승인 요청만 전송)
 * @param itemIdsToDelete - 삭제할 아이템 ID 배열
 */
export const deleteRecommendedQuestions = async (
  itemIdsToDelete: (string | number)[],
): Promise<void> => {
  if (itemIdsToDelete.length === 0) {
    return;
  }

  // 삭제 전에 데이터 조회 (승인 요청에 사용)
  const deletedItems: RecommendedQuestionItem[] = [];
  for (const id of itemIdsToDelete) {
    try {
      const item = await fetchRecommendedQuestion(id);
      deletedItems.push(item);
    } catch (error) {
      console.warn(`삭제 전 데이터 조회 실패 (id: ${id}):`, error);
    }
  }

  // 실제 삭제 API 호출을 제거하고 승인 요청만 전송
  if (deletedItems.length > 0) {
    await sendApprovalRequest('data_deletion', deletedItems);
  } else {
    throw new Error('삭제할 데이터를 찾을 수 없습니다.');
  }
};

