import React from 'react';
import { Navigate } from 'react-router-dom';
import { ROUTES } from './menu';

const HomePage = React.lazy(() => import('@pages/index'));

// === 데이터 등록/노출 - 추천 질문 ===
const RecommendedQuestionsPage = React.lazy(
  () => import('@pages/data-reg/recommended-questions/RecommendedQuestionsPage'),
);
const RecommendedQuestionDetailPage = React.lazy(
  () => import('@pages/data-reg/recommended-questions/RecommendedQuestionsDetailPage'),
);
const RecommendedQuestionsCreatePage = React.lazy(
  () => import('@pages/data-reg/recommended-questions/RecommendedQuestionsCreatePage'),
);
const RecommendedQuestionsApprovalDetailPage = React.lazy(
  () => import('@pages/data-reg/recommended-questions/RecommendedQuestionsApprovalDetailPage'),
);

// === 데이터 등록/노출 - 공통 결재 페이지 ===
const DataRegApprovalPage = React.lazy(() => import('@pages/data-reg/DataRegApprovalPage'));

// === 데이터 등록/노출 - 앱스킴 ===
const AppSchemePage = React.lazy(() => import('@pages/data-reg/app-scheme/AppSchemePage'));
const AppSchemeCreatePage = React.lazy(
  () => import('@pages/data-reg/app-scheme/AppSchemeCreatePage'),
);
const AppSchemeDetailPage = React.lazy(
  () => import('@pages/data-reg/app-scheme/AppSchemeDetailPage'),
);
const AppSchemeApprovalDetailPage = React.lazy(
  () => import('@pages/data-reg/app-scheme/AppSchemeApprovalDetailPage'),
);

// === 관리 ===
const CommonCodePage = React.lazy(() => import('@pages/management/common-code/CommonCodePage'));
const CommonCodeEditPage = React.lazy(
  () => import('@pages/management/common-code/CommonCodeEditPage'),
);
const CommonCodeTempPage = React.lazy(
  () => import('@pages/management/common-code-temp/CommonCodePage'),
);
const CommonCodeTempEditPage = React.lazy(
  () => import('@pages/management/common-code-temp/CommonCodeEditPage'),
);
const AdminAuthPage = React.lazy(() => import('@pages/management/admin-auth/AdminAuthPage'));
const AdminAuthEditPage = React.lazy(
  () => import('@pages/management/admin-auth/AdminAuthEditPage'),
);

// === 이력 ===
const UserLoginPage = React.lazy(() => import('@pages/history/login/UserLoginPage'));
const TransactionPage = React.lazy(() => import('@pages/history/transaction/TransactionPage'));

export type AppRoute = {
  path: string;
  Component: React.ComponentType;
  showInMenu?: boolean;
};

export const frontRoutes: AppRoute[] = [
  // === 기본 페이지 ===
  { path: ROUTES.HOME, Component: HomePage },

  // === 데이터 등록/노출 ===
  {
    path: ROUTES.DATA_REG,
    Component: () =>
      React.createElement(Navigate, { to: ROUTES.RECOMMENDED_QUESTIONS, replace: true }),
  },

  // 추천 질문 관리
  { path: ROUTES.RECOMMENDED_QUESTIONS, Component: RecommendedQuestionsPage }, // 목록
  { path: `${ROUTES.RECOMMENDED_QUESTIONS}/:id`, Component: RecommendedQuestionDetailPage }, // 상세

  // 앱스킴 관리
  { path: ROUTES.APP_SCHEME, Component: AppSchemePage },
  { path: ROUTES.APP_SCHEME_CREATE, Component: AppSchemeCreatePage },
  { path: `${ROUTES.APP_SCHEME}/:id`, Component: AppSchemeDetailPage }, // 상세

  // === 관리 ===
  {
    path: ROUTES.MANAGEMENT,
    Component: () => React.createElement(Navigate, { to: ROUTES.COMMON_CODE, replace: true }),
  },

  // 공통 코드 관리
  { path: ROUTES.COMMON_CODE, Component: CommonCodePage },
  { path: ROUTES.COMMON_CODE_EDIT, Component: CommonCodeEditPage },

  // 공통 코드 관리 임시
  { path: ROUTES.COMMON_CODE_TEMP, Component: CommonCodeTempPage },
  { path: ROUTES.COMMON_CODE_TEMP_EDIT, Component: CommonCodeTempEditPage },

  // 어드민 권한관리
  { path: ROUTES.ADMIN_AUTH, Component: AdminAuthPage },
  { path: `${ROUTES.ADMIN_AUTH}/edit`, Component: AdminAuthEditPage },
  { path: `${ROUTES.ADMIN_AUTH}/detail/:id`, Component: AdminAuthPage }, // 상세는 목록 페이지 재사용

  { path: ROUTES.RECOMMENDED_QUESTIONS_CREATE, Component: RecommendedQuestionsCreatePage }, // 등록
  { path: ROUTES.RECOMMENDED_QUESTIONS_APPROVAL, Component: DataRegApprovalPage }, // 결재요청 대기함
  {
    path: `${ROUTES.RECOMMENDED_QUESTIONS_APPROVAL}/:id`,
    Component: RecommendedQuestionsApprovalDetailPage,
  }, // 결재요청 상세
  { path: `${ROUTES.RECOMMENDED_QUESTIONS}/:id`, Component: RecommendedQuestionDetailPage }, // 상세 (create보다 뒤에 위치)

  // 앱스킴 결재
  { path: ROUTES.APP_SCHEME_APPROVAL, Component: DataRegApprovalPage }, // 결재요청 대기함
  {
    path: `${ROUTES.APP_SCHEME_APPROVAL}/:id`,
    Component: AppSchemeApprovalDetailPage,
  }, // 결재요청 상세

  // === 이력 ===
  {
    path: ROUTES.HISTORY,
    Component: () => React.createElement(Navigate, { to: ROUTES.USER_LOGIN, replace: true }),
  },
  { path: ROUTES.USER_LOGIN, Component: UserLoginPage },
  { path: ROUTES.TRANSACTION, Component: TransactionPage },
];

// Helper for validating DB-provided menu paths
export const registeredPathSet = new Set(frontRoutes.map((r) => r.path));
