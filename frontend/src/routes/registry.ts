import React from 'react';
import { Navigate } from 'react-router-dom';
import HomePage from '../pages';
import DashboardPage from '../pages/dashboard';
import ExamplePage from '../pages/example';
import RecommendedQuestionsPage from '../pages/data-reg/recommended-questions/RecommendedQuestionsPage';
import RecommendedQuestionDetailPage from '../pages/data-reg/recommended-questions/RecommendedQuestionsDetailPage';
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
];

// Helper for validating DB-provided menu paths
export const registeredPathSet = new Set(frontRoutes.map((r) => r.path));
