import { API_ENDPOINTS } from '@/constants/endpoints';
import { PAGE_TITLES } from '@/constants/pageTitle';
import { APPROVAL_SEARCH_FIELDS } from '@/constants/options';
import { ROUTES } from '@/routes/menu';
import { PAGE_TYPE } from '@/constants/options';
import type { SearchField } from '@/types/types';

export const { RECOMMENDED_QUESTIONS, APP_SCHEME } = PAGE_TYPE.DATA_REG;

// 확장 가능한 타입 정의
export type ApprovalPageType = string;

export interface ApprovalPageConfig {
  pageType: ApprovalPageType;
  title: string;
  searchFields: SearchField[];
  listEndpoint: string;
  defaultReturnRoute: string;
  approvalDetailRoute: (id: string | number) => string;
}

// 설정 레지스트리
export const APPROVAL_CONFIGS: Record<string, ApprovalPageConfig> = {
  [RECOMMENDED_QUESTIONS]: {
    pageType: RECOMMENDED_QUESTIONS,
    title: PAGE_TITLES.RECOMMENDED_QUESTIONS_APPROVAL,
    searchFields: APPROVAL_SEARCH_FIELDS,
    listEndpoint: API_ENDPOINTS.RECOMMENDED_QUESTIONS.APPROVAL_LIST,
    defaultReturnRoute: ROUTES.RECOMMENDED_QUESTIONS,
    approvalDetailRoute: (id) => ROUTES.RECOMMENDED_QUESTIONS_APPROVAL_DETAIL(id),
  },
  [APP_SCHEME]: {
    pageType: APP_SCHEME,
    title: PAGE_TITLES.APP_SCHEME_APPROVAL,
    searchFields: APPROVAL_SEARCH_FIELDS,
    listEndpoint: API_ENDPOINTS.APP_SCHEME.APPROVAL_LIST,
    defaultReturnRoute: ROUTES.APP_SCHEME,
    approvalDetailRoute: (id) => ROUTES.APP_SCHEME_APPROVAL_DETAIL(id),
  },
  // 추후 새로운 타입 추가 시 여기에 설정만 추가하면 됨
};

/**
 * 경로(pathname)를 기반으로 적절한 설정을 반환하는 함수
 */
export const getApprovalConfig = (pathname: string): ApprovalPageConfig => {
  // 1. 경로에 매칭되는 키 찾기
  // 예: /data-reg/app-scheme/approval -> app-scheme

  if (pathname.includes(ROUTES.APP_SCHEME_APPROVAL)) {
    return APPROVAL_CONFIGS[APP_SCHEME];
  }

  // 기본값 또는 추천질문
  return APPROVAL_CONFIGS[RECOMMENDED_QUESTIONS];
};
