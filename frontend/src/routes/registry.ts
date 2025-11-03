import type React from 'react';
import HomePage from '../pages';
import DashboardPage from '../pages/dashboard';
import ExamplePage from '../pages/example';
import ListPage from '../pages/data-reg/registration/recommended-questions/list/ListPage';

export type AppRoute = {
  path: string;
  Component: React.ComponentType;
  showInMenu?: boolean;
};

export const frontRoutes: AppRoute[] = [
  { path: '/', Component: HomePage },
  { path: '/dashboard', Component: DashboardPage },
  { path: '/example', Component: ExamplePage },
  {path: '/data-reg/registration/recommended-questions/list', Component: ListPage},
];

// Helper for validating DB-provided menu paths
export const registeredPathSet = new Set(frontRoutes.map((r) => r.path));
