import React from 'react';
import { Navigate } from 'react-router-dom';
import HomePage from '../pages';
import DashboardPage from '../pages/dashboard';
import ExamplePage from '../pages/example';

import RecommendedQuestionsPage from '../pages/data-reg/recommended-questions/RecommendedQuestionsPage';
import RecommendedQuestionDetailPage from '../pages/data-reg/recommended-questions/RecommendedQuestionsDetailPage';
import ServiceNamePage from '../pages/management/service-name/ServiceNamePage';
import ServiceNameEditPage from '../pages/management/service-name/ServiceNameEditPage';
import RecommendedQuestionsCreatePage from '../pages/data-reg/recommended-questions/RecommendedQuestionsCreatePage';
import RecommendedQuestionsApprovalPage from '../pages/data-reg/recommended-questions/RecommendedQuestionsApprovalPage';
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
  { path: `${ROUTES.RECOMMENDED_QUESTIONS}/create`, Component: RecommendedQuestionDetailPage }, // 등록

  // === 관리 ===
  {
    path: ROUTES.MANAGEMENT,
    Component: () => React.createElement(Navigate, { to: ROUTES.SERVICE_NAME, replace: true }),
  },

  // 카테고리 관리
  { path: ROUTES.SERVICE_NAME, Component: ServiceNamePage }, // 서비스명 직접 경로
  { path: ROUTES.MANAGEMENT_CATEGORY, Component: ServiceNamePage }, // 목록
  { path: ROUTES.SERVICE_NAME_EDIT, Component: ServiceNameEditPage }, // 편집 페이지
  { path: ROUTES.RECOMMENDED_QUESTIONS_CREATE, Component: RecommendedQuestionsCreatePage }, // 등록
  { path: ROUTES.RECOMMENDED_QUESTIONS_APPROVAL, Component: RecommendedQuestionsApprovalPage }, // 결재요청 대기함 (파일 생성 후 활성화)
  { path: `${ROUTES.RECOMMENDED_QUESTIONS}/:id`, Component: RecommendedQuestionDetailPage }, // 상세 (create보다 뒤에 위치)
];

// Helper for validating DB-provided menu paths
export const registeredPathSet = new Set(frontRoutes.map((r) => r.path));
