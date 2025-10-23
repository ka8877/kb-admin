import type React from 'react'
import HomePage from '../pages'
import DashboardPage from '../pages/dashboard'

// Central routing registry
// - Front-managed routes are explicitly declared here.
// - Left/top navigation menus are fetched from DB (see store/menu) and should point to these paths.
// - Do NOT mix DB menu with routing registration — router is authoritative here.

export type AppRoute = {
  path: string
  Component: React.ComponentType
  // showInMenu is intentionally not used by router.
  // Menus are provided by backend; this flag can be used if we later add client-side menu fallbacks.
  showInMenu?: boolean
}

export const frontRoutes: AppRoute[] = [
  { path: '/', Component: HomePage },
  { path: '/dashboard', Component: DashboardPage },
]

// Helper for validating DB-provided menu paths
export const registeredPathSet = new Set(frontRoutes.map((r) => r.path))
