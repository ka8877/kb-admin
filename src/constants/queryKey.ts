import { FetchListParams } from '@/types/types';

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
  list: (params?: FetchListParams) => [...recommendedQuestionsKeys.lists(), params] as const,
  details: () => [...recommendedQuestionsKeys.all, 'detail'] as const,
  detail: (id: string | number) => [...recommendedQuestionsKeys.details(), id] as const,
};

export const appSchemeKeys = {
  all: [APP_SCHEME] as const,
  lists: () => [...appSchemeKeys.all, 'list'] as const,
  list: (params?: FetchListParams) => [...appSchemeKeys.lists(), params] as const,
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

export const commonCodeKeys = {
  all: [COMMON_CODE] as const,
  // 코드그룹 (cm_code_group)
  codeGroups: () => [...commonCodeKeys.all, 'code-groups'] as const,
  codeGroupDetail: (groupCode: string) => [...commonCodeKeys.all, 'code-group', groupCode] as const,
  // 코드아이템 (cm_code_item)
  codeItemsLists: () => [...commonCodeKeys.all, 'code-items', 'list'] as const,
  codeItemsList: (params?: { groupCode?: string; includeInactive?: boolean }) =>
    [...commonCodeKeys.codeItemsLists(), params] as const,
  codeItemDetail: (codeItemId: number) => [...commonCodeKeys.all, 'code-item', codeItemId] as const,
  // 코드매핑 (cm_code_mapping)
  codeMappings: () => [...commonCodeKeys.all, 'code-mappings'] as const,
  serviceMappings: () => [...commonCodeKeys.codeMappings(), 'service'] as const,
  questionMappings: () => [...commonCodeKeys.codeMappings(), 'question'] as const,
  // 레거시 (하위 호환성)
  codeTypes: () => [CODE_TYPES] as const,
  lists: () => [...commonCodeKeys.all, 'list'] as const,
  list: (params?: { codeType?: string; useYn?: string }) =>
    [...commonCodeKeys.lists(), params] as const,
  details: () => [...commonCodeKeys.all, 'detail'] as const,
  detail: (serviceCode: string) => [...commonCodeKeys.details(), serviceCode] as const,
};

/**
 * 사용자 역할 변경 이력 관련 QueryKey
 */
export const USER_ROLE_CHANGE = 'user-role-change';

export const userRoleChangeKeys = {
  all: [USER_ROLE_CHANGE] as const,
  lists: () => [...userRoleChangeKeys.all, 'list'] as const,
  list: (params?: FetchListParams) => [...userRoleChangeKeys.lists(), params] as const,
};

/**
 * 로그인 이력 관련 QueryKey
 */
export const USER_LOGIN = 'user-login';

export const userLoginKeys = {
  all: [USER_LOGIN] as const,
  lists: () => [...userLoginKeys.all, 'list'] as const,
  list: (params?: FetchListParams) => [...userLoginKeys.lists(), params] as const,
};
