/**
 * React Query QueryKey 상수 정의
 * 애플리케이션 전역에서 사용되는 QueryKey 값들을 중앙에서 관리
 */

/**
 * 추천질문 관련 QueryKey
 */
export const RECOMMENDED_QUESTIONS = 'recommended-questions';
export const RECOMMENDED_QUESTION = 'recommended-question';

/**
 * 승인 요청 관련 QueryKey
 */
export const APPROVAL_REQUEST = 'approval-request';
export const APPROVAL_REQUESTS = 'approval-requests';
export const APPROVAL_DETAIL_QUESTIONS = 'approval-detail-questions';

/**
 * 공통코드 관련 QueryKey
 */
export const COMMON_CODE = 'common-code';
export const CODE_TYPES = 'code-types';

/**
 * QueryKey 헬퍼 함수들
 */
export const recommendedQuestionsKeys = {
  all: [RECOMMENDED_QUESTIONS] as const,
  lists: () => [...recommendedQuestionsKeys.all, 'list'] as const,
  list: (params?: {
    page?: number;
    pageSize?: number;
    searchParams?: Record<string, string | number>;
  }) => [...recommendedQuestionsKeys.lists(), params] as const,
  details: () => [...recommendedQuestionsKeys.all, 'detail'] as const,
  detail: (id: string | number) => [...recommendedQuestionsKeys.details(), id] as const,
};

export const approvalRequestKeys = {
  all: [APPROVAL_REQUESTS] as const,
  lists: () => [...approvalRequestKeys.all, 'list'] as const,
  list: (type?: string) => [...approvalRequestKeys.lists(), type] as const,
  details: () => [...approvalRequestKeys.all, 'detail'] as const,
  detail: (id: string | number) => [APPROVAL_REQUEST, id] as const,
  detailQuestions: (id: string | number) => [APPROVAL_DETAIL_QUESTIONS, id] as const,
};

export const commonCodeKeys = {
  all: [COMMON_CODE] as const,
  codeTypes: () => [CODE_TYPES] as const,
  lists: () => [...commonCodeKeys.all, 'list'] as const,
  list: (params?: { codeType?: string; useYn?: string }) =>
    [...commonCodeKeys.lists(), params] as const,
  details: () => [...commonCodeKeys.all, 'detail'] as const,
  detail: (serviceCode: string) => [...commonCodeKeys.details(), serviceCode] as const,
};
