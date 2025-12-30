// 추천질문 관련 API 함수
// 순수 함수로 비즈니스 로직만 담당 (React Query와 독립적)

import { getApi, postApi, ApiMeta } from '@/utils/apiUtils';
import { TOAST_MESSAGES } from '@/constants/message';
import { API_ENDPOINTS } from '@/constants/endpoints';
import type { RecommendedQuestionItem } from '@/pages/data-reg/recommended-questions/types';
import { toCompactFormat } from '@/utils/dateUtils';
import type { Dayjs } from 'dayjs';
import { OUT_OF_SERVICE } from '@/constants/options';
import type { FetchListParams } from '@/types/types';
import { TABLE_LABELS } from '@/constants/label';

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
