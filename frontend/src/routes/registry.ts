import React from 'react';
import { Navigate } from 'react-router-dom';
import HomePage from '../pages';
import DashboardPage from '../pages/dashboard';
import ExamplePage from '../pages/example';
import RecommendedQuestionsPage from '../pages/data-reg/recommended-questions/RecommendedQuestionsPage';

export type AppRoute = {
  path: string;
  Component: React.ComponentType;
  showInMenu?: boolean;
};

export const frontRoutes: AppRoute[] = [
  { path: '/', Component: HomePage },
  { path: '/dashboard', Component: DashboardPage },
  {
    path: '/data-reg',
    Component: () =>
      React.createElement(Navigate, { to: '/data-reg/recommended-questions', replace: true }),
  },
  { path: '/example', Component: ExamplePage },
  { path: '/data-reg/recommended-questions', Component: RecommendedQuestionsPage },
];

// Helper for validating DB-provided menu paths
export const registeredPathSet = new Set(frontRoutes.map((r) => r.path));
