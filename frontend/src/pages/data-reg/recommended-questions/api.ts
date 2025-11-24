// 추천질문 관련 API 함수
// 순수 함수로 비즈니스 로직만 담당 (React Query와 독립적)

import { getApi, postApi, putApi, deleteApi } from '@/utils/apiUtils';
import { API_ENDPOINTS } from '@/constants/endpoints';
import { env } from '@/config';
import type { RecommendedQuestionItem } from './types';

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
  //
  // const endpoint = `${API_ENDPOINTS.RECOMMENDED_QUESTIONS.LIST}?${queryParams.toString()}`;

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
  const response = await getApi<RecommendedQuestionItem>(
    API_ENDPOINTS.RECOMMENDED_QUESTIONS.DETAIL(id),
    {
      baseURL: env.testURL,
      errorMessage: '추천질문 상세 데이터를 불러오지 못했습니다.',
    },
  );

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
      baseURL: env.testURL,
      errorMessage: '추천질문 생성에 실패했습니다.',
    },
  );

  return response.data;
};

/**
 * 추천질문 수정
 */
export const updateRecommendedQuestion = async (
  id: string | number,
  data: Partial<RecommendedQuestionItem>,
): Promise<RecommendedQuestionItem> => {
  const response = await putApi<RecommendedQuestionItem>(
    API_ENDPOINTS.RECOMMENDED_QUESTIONS.UPDATE(id),
    data,
    {
      baseURL: env.testURL,
      errorMessage: '추천질문 수정에 실패했습니다.',
    },
  );

  return response.data;
};

/**
 * 추천질문 삭제
 */
export const deleteRecommendedQuestion = async (
  id: string | number,
): Promise<void> => {
  await deleteApi(
    API_ENDPOINTS.RECOMMENDED_QUESTIONS.DELETE(id),
    {
      baseURL: env.testURL,
      errorMessage: '추천질문 삭제에 실패했습니다.',
    },
  );
};

