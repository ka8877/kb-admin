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
 * 앱스킴 관련 QueryKey
 */
export const APP_SCHEME = 'app-scheme';
export const APP_SCHEME_APPROVAL_REQUEST = 'app-scheme-approval-request';
export const APP_SCHEME_APPROVAL_DETAIL_QUESTIONS = 'app-scheme-approval-detail-questions';

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

export const appSchemeKeys = {
  all: [APP_SCHEME] as const,
  lists: () => [...appSchemeKeys.all, 'list'] as const,
  list: (params?: {
    page?: number;
    pageSize?: number;
    searchParams?: Record<string, string | number>;
  }) => [...appSchemeKeys.lists(), params] as const,
  details: () => [...appSchemeKeys.all, 'detail'] as const,
  detail: (id: string | number) => [...appSchemeKeys.details(), id] as const,
  approvalRequest: (id: string | number) => [APP_SCHEME_APPROVAL_REQUEST, id] as const,
  approvalDetailQuestions: (id: string | number) =>
    [APP_SCHEME_APPROVAL_DETAIL_QUESTIONS, id] as const,
};

export const approvalRequestKeys = {
  all: [APPROVAL_REQUESTS] as const,
  lists: () => [...approvalRequestKeys.all, 'list'] as const,
  list: (type?: string) => [...approvalRequestKeys.lists(), type] as const,
  details: () => [...approvalRequestKeys.all, 'detail'] as const,
  detail: (id: string | number) => [APPROVAL_REQUEST, id] as const,
  detailQuestions: (id: string | number) => [APPROVAL_DETAIL_QUESTIONS, id] as const,
};
