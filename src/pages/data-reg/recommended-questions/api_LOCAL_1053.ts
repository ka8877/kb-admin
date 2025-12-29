// 추천질문 관련 API 함수
// 순수 함수로 비즈니스 로직만 담당 (React Query와 독립적)

import {
  getApi,
  postApi,
  putApi,
  patchApi,
  fetchApi,
  sendApprovalRequest as sendApprovalRequestCommon,
  ApiMeta,
} from '@/utils/apiUtils';
import { TOAST_MESSAGES } from '@/constants/message';
import { API_ENDPOINTS } from '@/constants/endpoints';
import { env } from '@/config/env';
import type { RecommendedQuestionItem } from '@/pages/data-reg/recommended-questions/types';
import { toCompactFormat } from '@/utils/dateUtils';
import type { Dayjs } from 'dayjs';
import { useLoadingStore } from '@/store/loading';
import { TARGET_TYPE_RECOMMEND, OUT_OF_SERVICE } from '@/constants/options';
import type { ApprovalFormType, ApprovalRequestItem, FetchListParams } from '@/types/types';
import { TABLE_LABELS } from '@/constants/label';

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

const {
  QST_ID,
  SERVICE_CD,
  SERVICE_NM,
  DISPLAY_CTNT,
  PROMPT_CTNT,
  QST_CTGR,
  QST_STYLE,
  PARENT_ID,
  PARENT_NM,
  AGE_GRP,
  SHOW_U17,
  IMP_START_DATE,
  IMP_END_DATE,
  STATUS,
  CREATED_AT,
  UPDATED_AT,
  LOCKED,
} = TABLE_LABELS.RECOMMENDED_QUESTION;

/**
 * 코드 아이템 타입 정의
 */
export interface CodeItem {
  firebaseKey: string;
  code_item_id: number;
  code_group_id: number;
  group_code?: string;
  code: string;
  code_name: string;
  sort_order: number;
  is_active: number;
  description: string | null;
}

/**
 * 코드 매핑 타입 정의
 */
export interface CodeMapping {
  firebaseKey: string;
  mapping_type: 'SERVICE' | 'QUESTION';
  parent_code_item_id: string;
  child_code_item_id: string;
  sort_order: number;
  is_active: number;
}

/**
 * Firebase 응답 데이터를 RecommendedQuestionItem으로 변환하는 헬퍼 함수
 */
const transformItem = (
  v: Partial<RecommendedQuestionItem> & Record<string, unknown>,
  options: { index: number; fallbackId?: string | number },
): RecommendedQuestionItem => {
  const { index, fallbackId } = options;

  return {
    no: (v.no as number) ?? index + 1,
    [QST_ID]: String(v[QST_ID] ?? fallbackId ?? index + 1),
    [SERVICE_CD]: (v[SERVICE_CD] as string) ?? '',
    [SERVICE_NM]: (v[SERVICE_NM] as string) ?? '',
    [DISPLAY_CTNT]: (v[DISPLAY_CTNT] as string) ?? '',
    [PROMPT_CTNT]: (v[PROMPT_CTNT] as string) ?? null,
    [QST_CTGR]: (v[QST_CTGR] as string) ?? '',
    [QST_STYLE]: (v[QST_STYLE] as string) ?? null,
    [PARENT_ID]: (v[PARENT_ID] as string) ?? null,
    [PARENT_NM]: (v[PARENT_NM] as string) ?? null,
    [AGE_GRP]: (v[AGE_GRP] as string) ?? null,
    [SHOW_U17]: v[SHOW_U17] === true,
    [IMP_START_DATE]: v[IMP_START_DATE] ? String(v[IMP_START_DATE]) : '',
    [IMP_END_DATE]: v[IMP_END_DATE] ? String(v[IMP_END_DATE]) : '',
    [UPDATED_AT]: v[UPDATED_AT] ? String(v[UPDATED_AT]) : '',
    [CREATED_AT]: v[CREATED_AT] ? String(v[CREATED_AT]) : '',
    [STATUS]: (v[STATUS] as RecommendedQuestionItem['status']) ?? OUT_OF_SERVICE,
    [LOCKED]: (v[LOCKED] as boolean) ?? false,
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
        const v = item as Partial<RecommendedQuestionItem> & Record<string, unknown>;
        return transformItem(v, { index });
      })
      .filter((item): item is RecommendedQuestionItem => item !== null);
  }

  // 객체 형태 응답도 지원 (기존 방식)
  if (typeof raw === 'object' && raw !== null) {
    const entries = Object.entries(raw as Record<string, unknown>);

    return entries.map(([key, value], index) => {
      const v = value as Partial<RecommendedQuestionItem> & Record<string, unknown>;
      return transformItem(v, { index, fallbackId: key });
    });
  }

  return [];
};

/**
 * 승인 요청 API 호출 (1:1 관계로 각 item마다 개별 결재 요청 생성)
 */
const _sendApprovalRequest = async (
  approvalForm: ApprovalFormType,
  items: RecommendedQuestionItem[],
): Promise<void> => {
  // 각 item마다 개별 결재 요청 생성 (1:1 관계)
  for (const item of items) {
    const targetId = item.qstId;

    await sendApprovalRequestCommon(
      API_ENDPOINTS.RECOMMENDED_QUESTIONS.APPROVAL,
      approvalForm,
      [item], // 단건 배열로 전달
      item[DISPLAY_CTNT] || '추천질문',
      TARGET_TYPE_RECOMMEND,
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
  [SERVICE_CD]?: string | null;
  [SERVICE_NM]?: string | null;
  [PARENT_ID]?: string | null;
  parentIdName?: string | null;
  [PARENT_NM]?: string | null;
  [DISPLAY_CTNT]?: string | null;
  [PROMPT_CTNT]?: string | null;
  [QST_CTGR]?: string | null;
  [QST_STYLE]?: string | null;
  [AGE_GRP]?: string | number | null;
  [SHOW_U17]?: boolean | string | null;
  [IMP_START_DATE]?: string | Date | Dayjs | null;
  [IMP_END_DATE]?: string | Date | Dayjs | null;
  [STATUS]?: string | null;
}): Partial<RecommendedQuestionItem> => {
  // serviceCd 결정
  const serviceCd = inputData[SERVICE_CD] || '';

  // serviceNm 결정: serviceNm이 있으면 사용, 없으면 serviceCd 사용
  const serviceNm = inputData[SERVICE_NM] || inputData[SERVICE_CD] || '';

  // parentId 결정
  const parentId = inputData[PARENT_ID] || null;

  // parentNm 결정
  const parentNm = inputData[PARENT_NM] || inputData.parentIdName || null;

  // 날짜 변환
  let impStartDate = '';
  const inputImpStartDate = inputData[IMP_START_DATE];
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
  const inputImpEndDate = inputData[IMP_END_DATE];
  if (inputImpEndDate) {
    if (typeof inputImpEndDate === 'object' && 'toDate' in inputImpEndDate) {
      // Dayjs 객체인 경우
      impEndDate = toCompactFormat((inputImpEndDate as Dayjs).toDate()) || '';
    } else {
      // 문자열 또는 Date 객체인 경우
      impEndDate = toCompactFormat(inputImpEndDate) || '';
    }
  }

  // ageGrp를 문자열로 변환 (포매팅 없이 그대로 저장)
  let ageGrp: string | null = null;
  const inputAgeGrp = inputData[AGE_GRP];
  if (inputAgeGrp !== null && inputAgeGrp !== undefined && String(inputAgeGrp).trim() !== '') {
    ageGrp = String(inputAgeGrp);
  }

  return {
    [SERVICE_CD]: serviceCd,
    [SERVICE_NM]: serviceNm,
    [DISPLAY_CTNT]: inputData[DISPLAY_CTNT] ? String(inputData[DISPLAY_CTNT]) : '',
    [PROMPT_CTNT]: inputData[PROMPT_CTNT] ? String(inputData[PROMPT_CTNT]) : '',
    [QST_CTGR]: inputData[QST_CTGR] ? String(inputData[QST_CTGR]) : '',
    [QST_STYLE]: inputData[QST_STYLE] ? String(inputData[QST_STYLE]) : '',
    [PARENT_ID]: parentId,
    [PARENT_NM]: parentNm,
    [AGE_GRP]: ageGrp || '',
    [SHOW_U17]: inputData[SHOW_U17] === true,
    [IMP_START_DATE]: impStartDate,
    [IMP_END_DATE]: impEndDate,
    [STATUS]: (inputData[STATUS] as RecommendedQuestionItem['status']) || OUT_OF_SERVICE,
  };
};

/**
 * 추천질문 목록 조회
 */
export const fetchRecommendedQuestions = async (
  params?: FetchListParams,
): Promise<{ items: RecommendedQuestionItem[]; meta: ApiMeta | null }> => {
  const { page = 0, size = 20, searchParams = {} } = params || {};

  const response = await getApi<Record<string, unknown>[]>(
    API_ENDPOINTS.RECOMMENDED_QUESTIONS.BASE,
    {
      params: {
        page: page + 1,
        size,
        ...searchParams,
      },
      errorMessage: TOAST_MESSAGES.LOAD_DATA_FAILED,
    },
  );

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
 * 추천질문 상세 조회
 */
export const fetchRecommendedQuestion = async (
  id: string | number,
): Promise<RecommendedQuestionItem> => {
  const response = await getApi<Partial<RecommendedQuestionItem> & Record<string, unknown>>(
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
  const response = await getApi<Record<string, unknown>>(endpoint, {
    errorMessage: TOAST_MESSAGES.LOAD_APPROVAL_INFO_FAILED,
  });

  const v = response.data;
  return {
    [NO]: (v.no as number) ?? 0,
    [APPROVAL_REQUEST_ID]: Number(v[APPROVAL_REQUEST_ID] ?? v.id ?? approvalId),
    [TARGET_TYPE]: (v[TARGET_TYPE] as string) ?? '',
    [TARGET_ID]: Number(v[TARGET_ID] ?? 0),
    [ITSVC_NO]: (v[ITSVC_NO] as string) ?? null,
    [REQUEST_KIND]: (v[REQUEST_KIND] as string) ?? (v.approval_form as string) ?? '',
    [APPROVAL_STATUS]:
      (v[APPROVAL_STATUS] as ApprovalRequestItem['approvalStatus']) ??
      (v.status as ApprovalRequestItem['approvalStatus']) ??
      'request',
    [PAYLOAD_BEFORE]: (v[PAYLOAD_BEFORE] as string | null) ?? null,
    [PAYLOAD_AFTER]: (v[PAYLOAD_AFTER] as string | null) ?? null,
    [REQUESTER_NAME]: (v[REQUESTER_NAME] as string | null) ?? (v.createdBy as string) ?? null,
    [REQUESTER_DEPT_NAME]: (v[REQUESTER_DEPT_NAME] as string | null) ?? null,
    [LAST_ACTOR_NAME]: (v[LAST_ACTOR_NAME] as string | null) ?? (v.updatedBy as string) ?? null,
    [REQUESTED_AT]: v[REQUESTED_AT]
      ? String(v[REQUESTED_AT])
      : v.createdAt
        ? String(v.createdAt)
        : v.request_date
          ? String(v.request_date)
          : '',
    [LAST_UPDATED_AT]: v[LAST_UPDATED_AT]
      ? String(v[LAST_UPDATED_AT])
      : v.updatedAt
        ? String(v.updatedAt)
        : v.process_date
          ? String(v.process_date)
          : '',
    [IS_RETRACTED]: Boolean(v[IS_RETRACTED]),
    [IS_APPLIED]: Boolean(v[IS_APPLIED]),
    [APPLIED_AT]: (v[APPLIED_AT] as string | null) ?? null,
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
 * 추천질문 생성
 */
export const createRecommendedQuestion = async (
  data: Partial<RecommendedQuestionItem>,
): Promise<RecommendedQuestionItem> => {
  const response = await postApi<RecommendedQuestionItem>(
    API_ENDPOINTS.RECOMMENDED_QUESTIONS.CREATE,
    data,
    {
      errorMessage: TOAST_MESSAGES.SAVE_FAILED,
    },
  );

  return response.data;
};

/**
 * 추천질문 일괄 생성
 * @param items - 생성할 추천질문 아이템 배열
 */
export const createRecommendedQuestionsBatch = async (
  items: Partial<RecommendedQuestionItem>[],
): Promise<void> => {
  if (items.length === 0) {
    return;
  }

  await postApi(API_ENDPOINTS.RECOMMENDED_QUESTIONS.BULK_CREATE, items, {
    errorMessage: TOAST_MESSAGES.SAVE_FAILED,
  });
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
 * 결재 요청 삭제
 */
export const deleteApprovalRequest = async (approvalId: string | number): Promise<void> => {
  const endpoint = API_ENDPOINTS.RECOMMENDED_QUESTIONS.APPROVAL_DETAIL(approvalId);
  await fetchApi({
    method: 'DELETE',
    endpoint,
    errorMessage: '결재 요청 삭제에 실패했습니다.',
  });
};

/**
 * 추천질문 잠금 해제 (locked: false)
 */
export const unlockRecommendedQuestion = async (id: string | number): Promise<void> => {
  const basePath = API_ENDPOINTS.RECOMMENDED_QUESTIONS.BASE;
  const endpoint = `${basePath}/${id}/locked.json`;
  await putApi(endpoint, false, {
    errorMessage: '데이터 잠금 해제에 실패했습니다.',
  });
};

/**
 * 추천질문 잠금 (locked: true)
 */
export const lockRecommendedQuestion = async (id: string | number): Promise<void> => {
  const basePath = API_ENDPOINTS.RECOMMENDED_QUESTIONS.BASE;
  const endpoint = `${basePath}/${id}/locked.json`;
  await putApi(endpoint, true, {
    errorMessage: '데이터 잠금에 실패했습니다.',
  });
};

/**
 * 추천질문 일괄 잠금 (locked: true)
 */
export const lockRecommendedQuestions = async (ids: (string | number)[]): Promise<void> => {
  if (ids.length === 0) return;

  const updates: { [key: string]: boolean } = {};
  const basePath = API_ENDPOINTS.RECOMMENDED_QUESTIONS.BASE.replace(/^\//, '');

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
 * 승인된 항목들을 실제 데이터로 등록 (data_registration인 경우)
 * @param items - 등록할 추천질문 아이템 배열 (qst_id 포함)
 */
const _createApprovedQuestions = async (items: RecommendedQuestionItem[]): Promise<void> => {
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
// const updateApprovedQuestions = async (items: RecommendedQuestionItem[]): Promise<void> => {
//   if (items.length === 0) {
//     console.log('🔍 updateApprovedQuestions: items가 비어있음');
//     return;
//   }

//   console.log('🔍 updateApprovedQuestions API 호출:', {
//     itemsCount: items.length,
//     items: items.map((item) => ({ qstId: item.qstId })),
//   });

//   // 로딩 시작 (putApi가 이미 로딩을 관리하지만, 여러 항목을 수정하는 경우를 위해)
//   useLoadingStore.getState().start();

//   try {
//     // 각 항목을 개별적으로 UPDATE 엔드포인트로 수정
//     for (const item of items) {
//       const qstId = item.qstId;
//       if (!qstId) {
//         console.warn('🔍 qstId가 없는 항목 건너뜀:', item);
//         continue;
//       }

//       const endpoint = API_ENDPOINTS.RECOMMENDED_QUESTIONS.UPDATE(qstId);
//       console.log('🔍 개별 항목 수정:', { qst_id: qstId, endpoint });

//       await putApi<RecommendedQuestionItem>(endpoint, item, {
//         errorMessage: `${TOAST_MESSAGES.UPDATE_FAILED} (qstId: ${qstId})`,
//       });
//     }

//     console.log(`🔍 승인된 항목 ${items.length}개가 수정되었습니다.`);
//   } finally {
//     useLoadingStore.getState().stop();
//   }
// };

/**
 * 승인된 항목들을 실제 데이터로 삭제 (data_deletion인 경우)
 * @param items - 삭제할 추천질문 아이템 배열 (qst_id 포함)
 */
// const deleteApprovedQuestions = async (items: RecommendedQuestionItem[]): Promise<void> => {
//   if (items.length === 0) {
//     console.log('🔍 deleteApprovedQuestions: items가 비어있음');
//     return;
//   }

//   console.log('🔍 deleteApprovedQuestions 입력 items:', items);

//   // 각 항목의 qstId 추출 (null, undefined, 빈 문자열 제외)
//   const qstIdsToDelete = items
//     .map((item) => {
//       const qstId = item.qstId;
//       console.log('🔍 deleteApprovedQuestions - item.qstId:', qstId, 'item:', item);
//       return qstId;
//     })
//     .filter((qstId) => {
//       const isValid = qstId !== undefined && qstId !== null && qstId !== '';
//       console.log('🔍 deleteApprovedQuestions - qstId 필터링:', { qstId, isValid });
//       return isValid;
//     }) as (string | number)[];

//   console.log('🔍 deleteApprovedQuestions - 추출된 qstIdsToDelete:', qstIdsToDelete);

//   if (qstIdsToDelete.length === 0) {
//     console.warn('🔍 deleteApprovedQuestions: 유효한 qstId가 없음');
//     console.warn('🔍 deleteApprovedQuestions: 입력 items:', items);
//     return;
//   }

//   console.log('🔍 deleteApprovedQuestions API 호출:', {
//     qstIdsToDelete,
//     itemsCount: items.length,
//     deleteEndpoints: qstIdsToDelete.map((id) => API_ENDPOINTS.RECOMMENDED_QUESTIONS.DELETE(id)),
//   });

//   // Firebase Multi-Path Update를 사용하여 일괄 삭제
//   const updates: { [key: string]: null } = {};
//   // DELETE 엔드포인트에서 경로 추출: '/data-reg/qst/${id}.json' -> 'data-reg/qst'
//   const basePath = API_ENDPOINTS.RECOMMENDED_QUESTIONS.BASE.replace(/^\//, '');

//   qstIdsToDelete.forEach((qstId) => {
//     // Firebase 경로는 앞의 슬래시를 제거하고 .json도 제거해야 함
//     // 예: data-reg/qst/temp_1764052479281_1_l8gsmmdv1
//     const path = `${basePath}/${qstId}`;
//     updates[path] = null;
//     console.log('🔍 삭제 경로 추가:', { qstId, path });
//   });

//   if (Object.keys(updates).length === 0) {
//     console.warn('🔍 deleteApprovedQuestions: 삭제할 항목이 없음');
//     return;
//   }

//   // Firebase REST API를 통해 Multi-Path Update 실행
//   const databaseUrl = env.testURL.replace(/\/$/, ''); // 마지막 슬래시 제거

//   console.log('🔍 deleteApprovedQuestions Firebase 업데이트:', {
//     updates,
//     updatesCount: Object.keys(updates).length,
//   });

//   // 로딩 시작
//   useLoadingStore.getState().start();

//   try {
//     await patchApi('/.json', updates, {
//       baseURL: databaseUrl,
//       errorMessage: TOAST_MESSAGES.DELETE_FAILED,
//       successMessage: TOAST_MESSAGES.DELETE_SUCCESS,
//     });

//     console.log(`🔍 승인된 항목 ${qstIdsToDelete.length}개가 삭제되었습니다.`);
//   } catch (error) {
//     // toast.error(TOAST_MESSAGES.DELETE_FAILED); // patchApi에서 처리됨
//     throw error;
//   } finally {
//     useLoadingStore.getState().stop();
//   }

//   console.log(`🔍 승인된 항목 ${qstIdsToDelete.length}개가 삭제되었습니다.`);
// };

/**
 * 추천질문 수정
 */
export const updateRecommendedQuestion = async (
  id: string | number,
  data: Partial<RecommendedQuestionItem>,
): Promise<void> => {
  await postApi(API_ENDPOINTS.RECOMMENDED_QUESTIONS.UPDATE(id), data, {
    errorMessage: TOAST_MESSAGES.UPDATE_FAILED,
    successMessage: TOAST_MESSAGES.SAVE_SUCCESS,
  });
};

/**
 * 추천질문 삭제
 */
export const deleteRecommendedQuestion = async (id: string | number): Promise<void> => {
  await postApi(API_ENDPOINTS.RECOMMENDED_QUESTIONS.DELETE(id), null, {
    errorMessage: TOAST_MESSAGES.DELETE_FAILED,
    successMessage: TOAST_MESSAGES.DELETE_SUCCESS,
  });
};

/**
 * 여러 추천질문을 한 번에 삭제
 * @param itemIdsToDelete - 삭제할 아이템 ID 배열
 */
export const deleteRecommendedQuestions = async (
  itemIdsToDelete: (string | number)[],
): Promise<void> => {
  if (itemIdsToDelete.length === 0) {
    return;
  }

  await postApi(API_ENDPOINTS.RECOMMENDED_QUESTIONS.DELETE_BATCH, itemIdsToDelete, {
    errorMessage: TOAST_MESSAGES.DELETE_FAILED,
    successMessage: '삭제 요청',
  });
};

/**
 * 모든 코드 아이템 조회
 * @deprecated 새로운 API는 groupCode를 필요로 합니다. 대신 fetchCommonCodeItems를 사용하세요.
 */
export const fetchCodeItems = async (): Promise<CodeItem[]> => {
  // 임시: 빈 문자열로 호출 (실제로는 이 함수를 사용하지 말아야 함)
  const response = await getApi<unknown>('/management/common-code/code-items.json', {
    errorMessage: '코드 아이템 목록을 불러오는데 실패했습니다.',
  });

  let items: CodeItem[] = [];
  if (Array.isArray(response.data)) {
    items = response.data as CodeItem[];
  } else if (typeof response.data === 'object' && response.data !== null) {
    // Firebase 객체 형태를 배열로 변환하면서 key를 firebaseKey로 주입
    items = Object.entries(response.data as Record<string, CodeItem>).map(([key, value]) => ({
      ...value,
      firebaseKey: key,
    }));
  }
  return items;
};

/**
 * 서비스 매핑 목록 조회
 */
export const fetchServiceMappings = async (): Promise<CodeMapping[]> => {
  const response = await getApi<unknown>(API_ENDPOINTS.COMMON_CODE.CODE_MAPPINGS, {
    errorMessage: '서비스 매핑 정보를 불러오는데 실패했습니다.',
  });

  let items: CodeMapping[] = [];
  if (Array.isArray(response.data)) {
    items = response.data as CodeMapping[];
  } else if (typeof response.data === 'object' && response.data !== null) {
    items = Object.entries(response.data as Record<string, CodeMapping>).map(([key, value]) => ({
      ...value,
      firebaseKey: key,
    }));
  }
  return items.filter((item) => item.mapping_type === 'SERVICE');
};

/**
 * 질문 매핑 목록 조회
 */
export const fetchQuestionMappings = async (): Promise<CodeMapping[]> => {
  const response = await getApi<unknown>(API_ENDPOINTS.COMMON_CODE.CODE_MAPPINGS, {
    errorMessage: '질문 매핑 정보를 불러오는데 실패했습니다.',
  });

  let items: CodeMapping[] = [];
  if (Array.isArray(response.data)) {
    items = response.data as CodeMapping[];
  } else if (typeof response.data === 'object' && response.data !== null) {
    items = Object.entries(response.data as Record<string, CodeMapping>).map(([key, value]) => ({
      ...value,
      firebaseKey: key,
    }));
  }
  return items.filter((item) => item.mapping_type === 'QUESTION');
};
