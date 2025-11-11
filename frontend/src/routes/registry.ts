import React from 'react';
import { Navigate } from 'react-router-dom';
import { ROUTES } from './menu';

const HomePage = React.lazy(() => import('@pages/index'));
const DashboardPage = React.lazy(() => import('@pages/dashboard'));
const ExamplePage = React.lazy(() => import('@pages/example'));

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
const RecommendedQuestionsApprovalPage = React.lazy(
  () => import('@pages/data-reg/recommended-questions/RecommendedQuestionsApprovalPage'),
);
const RecommendedQuestionsApprovalDetailPage = React.lazy(
  () => import('@pages/data-reg/recommended-questions/RecommendedQuestionsApprovalDetailPage'),
);

// === 관리 ===
const ServiceNamePage = React.lazy(() => import('@pages/management/service-name/ServiceNamePage'));
const ServiceNameEditPage = React.lazy(
  () => import('@pages/management/service-name/ServiceNameEditPage'),
);
const QuestionsCategoryPage = React.lazy(
  () => import('@pages/management/questions-category/QuestionsCategoryPage'),
);
const QuestionsCategoryEditPage = React.lazy(
  () => import('@pages/management/questions-category/QuestionsCategoryEditPage'),
);
const AgeGroupPage = React.lazy(() => import('@pages/management/age-group/AgeGroupPage'));
const AgeGroupEditPage = React.lazy(() => import('@pages/management/age-group/AgeGroupEditPage'));
const AdminAuthPage = React.lazy(() => import('@pages/management/admin-auth/AdminAuthPage'));
const AdminAuthEditPage = React.lazy(
  () => import('@pages/management/admin-auth/AdminAuthEditPage'),
);

export type AppRoute = {
  path: string;
  Component: React.ComponentType;
  showInMenu?: boolean;
};

export const frontRoutes: AppRoute[] = [
  // === 기본 페이지 ===
  { path: ROUTES.HOME, Component: HomePage },
  { path: ROUTES.DASHBOARD, Component: DashboardPage },
  { path: ROUTES.EXAMPLE, Component: ExamplePage },

  // === 데이터 등록/노출 ===
  {
    path: ROUTES.DATA_REG,
    Component: () =>
      React.createElement(Navigate, { to: ROUTES.RECOMMENDED_QUESTIONS, replace: true }),
  },

  // 추천 질문 관리
  { path: ROUTES.RECOMMENDED_QUESTIONS, Component: RecommendedQuestionsPage }, // 목록
  { path: `${ROUTES.RECOMMENDED_QUESTIONS}/:id`, Component: RecommendedQuestionDetailPage }, // 상세

  // === 관리 ===
  {
    path: ROUTES.MANAGEMENT,
    Component: () => React.createElement(Navigate, { to: ROUTES.SERVICE_NAME, replace: true }),
  },

  // 카테고리 관리
  { path: ROUTES.SERVICE_NAME, Component: ServiceNamePage }, // 서비스명 직접 경로
  { path: ROUTES.MANAGEMENT_CATEGORY, Component: ServiceNamePage }, // 목록
  { path: ROUTES.SERVICE_NAME_EDIT, Component: ServiceNameEditPage }, // 편집 페이지
  { path: ROUTES.QUESTIONS_CATEGORY, Component: QuestionsCategoryPage },
  { path: `${ROUTES.QUESTIONS_CATEGORY}/edit`, Component: QuestionsCategoryEditPage },
  { path: ROUTES.AGE_GROUP, Component: AgeGroupPage },
  { path: `${ROUTES.AGE_GROUP}/edit`, Component: AgeGroupEditPage },

  // 어드민 권한관리
  { path: ROUTES.ADMIN_AUTH, Component: AdminAuthPage },
  { path: `${ROUTES.ADMIN_AUTH}/edit`, Component: AdminAuthEditPage },
  { path: `${ROUTES.ADMIN_AUTH}/detail/:id`, Component: AdminAuthPage }, // 상세는 목록 페이지 재사용

  { path: ROUTES.RECOMMENDED_QUESTIONS_CREATE, Component: RecommendedQuestionsCreatePage }, // 등록
  { path: ROUTES.RECOMMENDED_QUESTIONS_APPROVAL, Component: RecommendedQuestionsApprovalPage }, // 결재요청 대기함
  {
    path: `${ROUTES.RECOMMENDED_QUESTIONS_APPROVAL}/:id`,
    Component: RecommendedQuestionsApprovalDetailPage,
  }, // 결재요청 상세
  { path: `${ROUTES.RECOMMENDED_QUESTIONS}/:id`, Component: RecommendedQuestionDetailPage }, // 상세 (create보다 뒤에 위치)
];

// Helper for validating DB-provided menu paths
export const registeredPathSet = new Set(frontRoutes.map((r) => r.path));
