// 추천질문 관련 API 함수
// 순수 함수로 비즈니스 로직만 담당 (React Query와 독립적)

import {
  getApi,
  postApi,
  putApi,
  patchApi,
  sendApprovalRequest as sendApprovalRequestCommon,
} from '@/utils/apiUtils';
import { toast } from 'react-toastify';
import { TOAST_MESSAGES } from '@/constants/message';
import { API_ENDPOINTS } from '@/constants/endpoints';
import { env } from '@/config/env';
import type { RecommendedQuestionItem } from '@/pages/data-reg/recommended-questions/types';
import { toCompactFormat, formatDateForStorage } from '@/utils/dateUtils';
import type { Dayjs } from 'dayjs';
import { useLoadingStore } from '@/store/loading';
import {
  APPROVAL_STATUS_OPTIONS,
  CREATE_REQUESTED,
  UPDATE_REQUESTED,
  DELETE_REQUESTED,
  IN_REVIEW,
  DONE_REVIEW,
  DATA_REGISTRATION,
  DATA_MODIFICATION,
  DATA_DELETION,
  TARGET_TYPE_RECOMMEND,
} from '@/constants/options';
import type { ApprovalFormType, ApprovalRequestType, ApprovalRequestItem } from '@/types/types';

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
    qstId: String(v.qstId ?? v.qst_id ?? fallbackId ?? index + 1),
    serviceNm: v.serviceNm ?? v.service_nm ?? '',
    displayCtnt: v.displayCtnt ?? v.display_ctnt ?? '',
    promptCtnt: v.promptCtnt ?? v.prompt_ctnt ?? null,
    qstCtgr: v.qstCtgr ?? v.qst_ctgr ?? '',
    qstStyle: v.qstStyle ?? v.qst_style ?? null,
    parentId: v.parentId ?? v.parent_id ?? null,
    parentNm: v.parentNm ?? v.parent_nm ?? null,
    ageGrp: v.ageGrp ?? v.age_grp ?? null,
    showU17: v.showU17 ?? v.under_17_yn ?? 'N',
    impStartDate: v.impStartDate ?? (v.imp_start_date ? String(v.imp_start_date) : ''),
    impEndDate: v.impEndDate ?? (v.imp_end_date ? String(v.imp_end_date) : ''),
    updatedAt: v.updatedAt ? String(v.updatedAt) : '',
    createdAt: v.createdAt ?? (v.createdAt ? String(v.createdAt) : ''),
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
 * 승인 요청 API 호출
 */
const sendApprovalRequest = async (
  approvalForm: ApprovalFormType,
  items: RecommendedQuestionItem[],
): Promise<void> => {
  // targetId는 단건일 경우 qstId, 다건일 경우 콤마로 구분
  const targetId = items.map((item) => item.qstId).join(',');

  await sendApprovalRequestCommon(
    API_ENDPOINTS.RECOMMENDED_QUESTIONS.APPROVAL,
    approvalForm,
    items,
    '추천질문',
    TARGET_TYPE_RECOMMEND,
    targetId,
  );
};

/**
 * 입력 데이터를 API 전송 형식으로 변환하는 공통 함수
 * 폼 데이터와 엑셀 데이터 모두를 변환할 수 있도록 지원
 *
 * @param inputData - 폼 또는 엑셀에서 입력된 데이터
 * @returns API 전송 형식의 데이터
 */
export const transformToApiFormat = (inputData: {
  // 엑셀에서 올 수 있는 필드 (serviceCd, parent_id, parent_nm)
  serviceCd?: string | null;
  service_cd?: string | null; // Legacy support
  serviceNm?: string | null;
  service_nm?: string | null; // Legacy support
  // 폼에서 올 수 있는 필드 (parentId, parentIdName)
  parentId?: string | null;
  parentIdName?: string | null;
  // 공통 필드
  displayCtnt?: string | null;
  display_ctnt?: string | null; // Legacy support
  promptCtnt?: string | null;
  prompt_ctnt?: string | null; // Legacy support
  qstCtgr?: string | null;
  qst_ctgr?: string | null; // Legacy support
  qstStyle?: string | null;
  qst_style?: string | null; // Legacy support
  parent_id?: string | null;
  parent_nm?: string | null;
  ageGrp?: string | number | null;
  age_grp?: string | number | null; // Legacy support
  showU17?: string | null;
  under17Yn?: string | null; // Legacy support
  under_17_yn?: string | null; // Legacy support
  impStartDate?: string | Date | Dayjs | null;
  imp_start_date?: string | Date | Dayjs | null; // Legacy support
  impEndDate?: string | Date | Dayjs | null;
  imp_end_date?: string | Date | Dayjs | null; // Legacy support
  status?: string | null;
}): Partial<RecommendedQuestionItem> => {
  // serviceNm 결정: serviceNm이 있으면 사용, 없으면 service_nm, 없으면 serviceCd, 없으면 service_cd 사용
  const serviceNm =
    inputData.serviceNm ||
    inputData.service_nm ||
    inputData.serviceCd ||
    inputData.service_cd ||
    '';

  // parentId 결정: parentId가 있으면 사용, 없으면 parent_id 사용
  const parentId = inputData.parentId || inputData.parent_id || null;

  // parentNm 결정: parentIdName이 있으면 사용, 없으면 parent_nm 사용
  const parentNm = inputData.parentIdName || inputData.parent_nm || null;

  // 날짜 변환
  let impStartDate = '';
  const inputImpStartDate = inputData.impStartDate || inputData.imp_start_date;
  if (inputImpStartDate) {
    if (typeof inputImpStartDate === 'object' && 'toDate' in inputImpStartDate) {
      // Dayjs 객체인 경우
      impStartDate = toCompactFormat((inputImpStartDate as Dayjs).toDate()) || '';
    } else {
      // 문자열 또는 Date 객체인 경우
      impStartDate = toCompactFormat(inputImpStartDate) || '';
    }
  }

  let impEndDate = '';
  const inputImpEndDate = inputData.impEndDate || inputData.imp_end_date;
  if (inputImpEndDate) {
    if (typeof inputImpEndDate === 'object' && 'toDate' in inputImpEndDate) {
      // Dayjs 객체인 경우
      impEndDate = toCompactFormat((inputImpEndDate as Dayjs).toDate()) || '';
    } else {
      // 문자열 또는 Date 객체인 경우
      impEndDate = toCompactFormat(inputImpEndDate) || '';
    }
  }

  // ageGrp를 문자열로 변환
  let ageGrp: string | null = null;
  const inputAgeGrp = inputData.ageGrp ?? inputData.age_grp;
  if (inputAgeGrp !== null && inputAgeGrp !== undefined && String(inputAgeGrp).trim() !== '') {
    ageGrp = String(Number(inputAgeGrp));
  }

  return {
    serviceNm: serviceNm,
    displayCtnt:
      inputData.displayCtnt || inputData.display_ctnt
        ? String(inputData.displayCtnt || inputData.display_ctnt)
        : '',
    promptCtnt:
      inputData.promptCtnt || inputData.prompt_ctnt
        ? String(inputData.promptCtnt || inputData.prompt_ctnt)
        : null,
    qstCtgr:
      inputData.qstCtgr || inputData.qst_ctgr
        ? String(inputData.qstCtgr || inputData.qst_ctgr)
        : '',
    qstStyle:
      inputData.qstStyle || inputData.qst_style
        ? String(inputData.qstStyle || inputData.qst_style)
        : null,
    parentId: parentId,
    parentNm: parentNm,
    ageGrp: ageGrp,
    showU17:
      inputData.showU17 || inputData.under17Yn || inputData.under_17_yn
        ? String(inputData.showU17 || inputData.under17Yn || inputData.under_17_yn).toUpperCase()
        : 'N',
    impStartDate: impStartDate,
    impEndDate: impEndDate,
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
      transform: transformRecommendedQuestions,
      errorMessage: TOAST_MESSAGES.LOAD_DATA_FAILED,
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
      errorMessage: TOAST_MESSAGES.LOAD_DETAIL_FAILED,
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
): Promise<ApprovalRequestItem> => {
  const endpoint = API_ENDPOINTS.RECOMMENDED_QUESTIONS.APPROVAL_DETAIL(approvalId);
  const response = await getApi<any>(endpoint, {
    errorMessage: TOAST_MESSAGES.LOAD_APPROVAL_INFO_FAILED,
  });

  const v = response.data;
  return {
    no: v.no ?? 0,
    approvalRequestId: String(v.approvalRequestId ?? v.id ?? approvalId),
    targetType: v.targetType ?? '',
    targetId: v.targetId ?? '',
    itsvcNo: v.itsvcNo ?? null,
    requestKind: v.requestKind ?? v.approval_form ?? '',
    approvalStatus: v.approvalStatus ?? v.status ?? 'request',
    title: v.title ?? null,
    content: v.content ?? null,
    createdBy: v.createdBy ?? v.requester ?? '',
    department: v.department ?? '',
    updatedBy: v.updatedBy ?? null,
    createdAt: v.createdAt ?? (v.request_date ? String(v.request_date) : ''),
    updatedAt: v.updatedAt ?? (v.process_date ? String(v.process_date) : ''),
    isRetracted: v.isRetracted ?? 0,
  };
};

/**
 * 승인 요청 상세 조회 (결재 요청에 포함된 추천질문 목록)
 */
export const fetchApprovalDetailQuestions = async (
  approvalId: string | number,
): Promise<RecommendedQuestionItem[]> => {
  const endpoint = API_ENDPOINTS.RECOMMENDED_QUESTIONS.APPROVAL_DETAIL_LIST(approvalId);

  const response = await getApi<RecommendedQuestionItem[]>(endpoint, {
    transform: transformRecommendedQuestions,
    errorMessage: TOAST_MESSAGES.LOAD_APPROVAL_DETAIL_FAILED,
  });

  console.log('🔍 fetchApprovalDetailQuestions API 완료, data:', response.data);
  return response.data;
};

/**
 * 추천질문 생성 (승인 요청 전송 후 실제 데이터 생성)
 */
export const createRecommendedQuestion = async (
  data: Partial<RecommendedQuestionItem>,
): Promise<RecommendedQuestionItem> => {
  // 임시 ID 생성 (승인 후 실제 생성될 때 사용될 ID)
  const tempId = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  // RecommendedQuestionItem 형식으로 변환
  const item = transformItem(
    { ...data, qstId: tempId } as Partial<RecommendedQuestionItem> & Record<string, any>,
    { index: 0, fallbackId: tempId },
  );

  // 승인 요청 전송
  await sendApprovalRequest(DATA_REGISTRATION, [item]);

  // 결재 요청 성공 후 실제 데이터 생성 (같은 qstId로)
  await createApprovedQuestions([item]);

  return item;
};

/**
 * 추천질문 일괄 생성 (승인 요청 전송 후 실제 데이터 생성)
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
      { ...item, qstId: tempId } as Partial<RecommendedQuestionItem> & Record<string, any>,
      { index, fallbackId: tempId },
    );
  });

  // 승인 요청 전송
  await sendApprovalRequest(DATA_REGISTRATION, createdItems);

  // 결재 요청 성공 후 실제 데이터 생성 (같은 qstId로)
  await createApprovedQuestions(createdItems);
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
  const endpoint = API_ENDPOINTS.RECOMMENDED_QUESTIONS.APPROVAL_DETAIL(approvalId);

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
 * 승인된 항목들을 실제 데이터로 등록 (data_registration인 경우)
 * @param items - 등록할 추천질문 아이템 배열 (qst_id 포함)
 */
const createApprovedQuestions = async (items: RecommendedQuestionItem[]): Promise<void> => {
  if (items.length === 0) {
    console.log('🔍 createApprovedQuestions: items가 비어있음');
    return;
  }

  // Firebase Multi-Path Update를 사용하여 각 항목을 지정된 qst_id로 등록
  const updates: { [key: string]: Partial<RecommendedQuestionItem> } = {};
  const createPath = API_ENDPOINTS.RECOMMENDED_QUESTIONS.CREATE.replace(/^\//, '').replace(
    '.json',
    '',
  );

  items.forEach((item) => {
    // list에 있는 qstId를 그대로 사용하여 등록
    const qstId = item.qstId;
    updates[`${createPath}/${qstId}`] = item;
  });

  // Firebase REST API를 통해 Multi-Path Update 실행
  const databaseUrl = env.testURL.replace(/\/$/, ''); // 마지막 슬래시 제거

  console.log('🔍 createApprovedQuestions API 호출:', {
    updates,
    itemsCount: items.length,
  });

  // 로딩 시작
  useLoadingStore.getState().start();

  try {
    await patchApi('/.json', updates, {
      baseURL: databaseUrl,
      errorMessage: '승인된 항목 등록에 실패했습니다.',
    });

    console.log(`🔍 승인된 항목 ${items.length}개가 등록되었습니다.`);
  } finally {
    useLoadingStore.getState().stop();
  }
};

/**
 * 승인된 항목들을 실제 데이터로 수정 (data_modification인 경우)
 * @param items - 수정할 추천질문 아이템 배열 (qst_id 포함)
 */
const updateApprovedQuestions = async (items: RecommendedQuestionItem[]): Promise<void> => {
  if (items.length === 0) {
    console.log('🔍 updateApprovedQuestions: items가 비어있음');
    return;
  }

  console.log('🔍 updateApprovedQuestions API 호출:', {
    itemsCount: items.length,
    items: items.map((item) => ({ qstId: item.qstId })),
  });

  // 로딩 시작 (putApi가 이미 로딩을 관리하지만, 여러 항목을 수정하는 경우를 위해)
  useLoadingStore.getState().start();

  try {
    // 각 항목을 개별적으로 UPDATE 엔드포인트로 수정
    for (const item of items) {
      const qstId = item.qstId;
      if (!qstId) {
        console.warn('🔍 qstId가 없는 항목 건너뜀:', item);
        continue;
      }

      const endpoint = API_ENDPOINTS.RECOMMENDED_QUESTIONS.UPDATE(qstId);
      console.log('🔍 개별 항목 수정:', { qst_id: qstId, endpoint });

      await putApi<RecommendedQuestionItem>(endpoint, item, {
        errorMessage: `${TOAST_MESSAGES.UPDATE_FAILED} (qstId: ${qstId})`,
      });
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
const deleteApprovedQuestions = async (items: RecommendedQuestionItem[]): Promise<void> => {
  if (items.length === 0) {
    console.log('🔍 deleteApprovedQuestions: items가 비어있음');
    return;
  }

  console.log('🔍 deleteApprovedQuestions 입력 items:', items);

  // 각 항목의 qstId 추출 (null, undefined, 빈 문자열 제외)
  const qstIdsToDelete = items
    .map((item) => {
      const qstId = item.qstId;
      console.log('🔍 deleteApprovedQuestions - item.qstId:', qstId, 'item:', item);
      return qstId;
    })
    .filter((qstId) => {
      const isValid = qstId !== undefined && qstId !== null && qstId !== '';
      console.log('🔍 deleteApprovedQuestions - qstId 필터링:', { qstId, isValid });
      return isValid;
    }) as (string | number)[];

  console.log('🔍 deleteApprovedQuestions - 추출된 qstIdsToDelete:', qstIdsToDelete);

  if (qstIdsToDelete.length === 0) {
    console.warn('🔍 deleteApprovedQuestions: 유효한 qstId가 없음');
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
  const basePath = API_ENDPOINTS.RECOMMENDED_QUESTIONS.BASE.replace(/^\//, '');

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

  console.log('🔍 deleteApprovedQuestions Firebase 업데이트:', {
    updates,
    updatesCount: Object.keys(updates).length,
  });

  // 로딩 시작
  useLoadingStore.getState().start();

  try {
    await patchApi('/.json', updates, {
      baseURL: databaseUrl,
      errorMessage: TOAST_MESSAGES.DELETE_FAILED,
    });

    console.log(`🔍 승인된 항목 ${qstIdsToDelete.length}개가 삭제되었습니다.`);
  } catch (error) {
    // toast.error(TOAST_MESSAGES.DELETE_FAILED); // patchApi에서 처리됨
    throw error;
  } finally {
    useLoadingStore.getState().stop();
  }

  console.log(`🔍 승인된 항목 ${qstIdsToDelete.length}개가 삭제되었습니다.`);
};

/**
 * 추천질문 수정 (승인 요청 전송 후 실제 데이터 수정)
 */
export const updateRecommendedQuestion = async (
  id: string | number,
  data: Partial<RecommendedQuestionItem>,
): Promise<RecommendedQuestionItem> => {
  const updatedItem = transformItem(
    { ...data, qstId: String(id) } as Partial<RecommendedQuestionItem> & Record<string, any>,
    { index: 0, fallbackId: id },
  );

  // 승인 요청 전송
  await sendApprovalRequest(DATA_MODIFICATION, [updatedItem]);

  // 결재 요청 성공 후 실제 데이터 수정
  await updateApprovedQuestions([updatedItem]);

  return updatedItem;
};

/**
 * 추천질문 삭제 (승인 요청 전송 후 실제 데이터 삭제)
 */
export const deleteRecommendedQuestion = async (id: string | number): Promise<void> => {
  useLoadingStore.getState().start();
  try {
    // 삭제 전에 데이터 조회 (승인 요청에 사용)
    let deletedItem: RecommendedQuestionItem | null = null;
    try {
      deletedItem = await fetchRecommendedQuestion(id);
    } catch (error) {
      console.warn('삭제 전 데이터 조회 실패:', error);
      throw new Error('삭제할 데이터를 조회하지 못했습니다.');
    }

    // 승인 요청 전송
    if (deletedItem) {
      await sendApprovalRequest(DATA_DELETION, [deletedItem]);

      // 결재 요청 성공 후 실제 데이터 삭제
      await deleteApprovedQuestions([deletedItem]);
    } else {
      throw new Error('삭제할 데이터를 찾을 수 없습니다.');
    }
  } finally {
    useLoadingStore.getState().stop();
  }
};

/**
 * 여러 추천질문을 한 번에 삭제 (승인 요청 전송 후 실제 데이터 삭제)
 * @param itemIdsToDelete - 삭제할 아이템 ID 배열
 */
export const deleteRecommendedQuestions = async (
  itemIdsToDelete: (string | number)[],
): Promise<void> => {
  if (itemIdsToDelete.length === 0) {
    return;
  }

  useLoadingStore.getState().start();
  try {
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

    // 승인 요청 전송
    if (deletedItems.length > 0) {
      await sendApprovalRequest(DATA_DELETION, deletedItems);

      // 결재 요청 성공 후 실제 데이터 삭제
      await deleteApprovedQuestions(deletedItems);
    } else {
      throw new Error('삭제할 데이터를 찾을 수 없습니다.');
    }
  } finally {
    useLoadingStore.getState().stop();
  }
};
