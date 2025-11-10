import React from 'react';
import { Navigate } from 'react-router-dom';
import HomePage from '../pages';
import DashboardPage from '../pages/dashboard';
import ExamplePage from '../pages/example';

import RecommendedQuestionsPage from '../pages/data-reg/recommended-questions/RecommendedQuestionsPage';
import RecommendedQuestionDetailPage from '../pages/data-reg/recommended-questions/RecommendedQuestionsDetailPage';
import ServiceNamePage from '../pages/management/service-name/ServiceNamePage';
import ServiceNameEditPage from '../pages/management/service-name/ServiceNameEditPage';
import QuestionsCategoryPage from '../pages/management/questions-category/QuestionsCategoryPage';
import QuestionsCategoryEditPage from '../pages/management/questions-category/QuestionsCategoryEditPage';
import AgeGroupPage from '../pages/management/age-group/AgeGroupPage';
import AgeGroupEditPage from '../pages/management/age-group/AgeGroupEditPage';
import AdminAuthPage from '../pages/management/admin-auth/AdminAuthPage';
import AdminAuthEditPage from '../pages/management/admin-auth/AdminAuthEditPage';
import RecommendedQuestionsCreatePage from '../pages/data-reg/recommended-questions/RecommendedQuestionsCreatePage';
import RecommendedQuestionsApprovalPage from '../pages/data-reg/recommended-questions/RecommendedQuestionsApprovalPage';
import RecommendedQuestionsApprovalDetailPage from '../pages/data-reg/recommended-questions/RecommendedQuestionsApprovalDetailPage';
import { ROUTES } from './menu';

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
