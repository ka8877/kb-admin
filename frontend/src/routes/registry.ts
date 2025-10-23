import type React from 'react';
import HomePage from '../pages';
import DashboardPage from '../pages/dashboard';

export type AppRoute = {
  path: string;
  Component: React.ComponentType;
  showInMenu?: boolean;
};

export const frontRoutes: AppRoute[] = [
  { path: '/', Component: HomePage },
  { path: '/dashboard', Component: DashboardPage },
];

// Helper for validating DB-provided menu paths
export const registeredPathSet = new Set(frontRoutes.map((r) => r.path));
