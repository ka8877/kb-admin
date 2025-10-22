import React, { Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';

// Eagerly import all page entry files following Next.js-like folder structure: src/pages/**/index.tsx
// Example: src/pages/index.tsx -> '/'
//          src/pages/dashboard/index.tsx -> '/dashboard'

type PageModule = { default: React.ComponentType };
const pageModules = import.meta.glob('./pages/**/index.tsx', { eager: true }) as Record<
  string,
  PageModule
>;

type RouteDef = { path: string; Component: React.ComponentType };

const buildRoutes = (): RouteDef[] => {
  const routes: RouteDef[] = [];
  Object.entries(pageModules).forEach(([file, mod]) => {
    let path = file
      .replace('./pages', '')
      .replace(/\\/g, '/')
      .replace(/\/index\.tsx$/, '');
    if (path === '') path = '/';
    routes.push({ path, Component: mod.default });
  });
  // Optional: ensure root is defined first for readability (not required by router)
  routes.sort((a, b) => (a.path === '/' ? -1 : b.path === '/' ? 1 : a.path.localeCompare(b.path)));
  return routes;
};

const App: React.FC = () => {
  const routes = buildRoutes();

  return (
    <MainLayout>
      <Suspense fallback={<div>Loading...</div>}>
        <Routes>
          {routes.map(({ path, Component }) => (
            <Route key={path} path={path} element={<Component />} />
          ))}
          <Route path="/404" element={<div>Not Found</div>} />
          <Route path="*" element={<Navigate to="/404" replace />} />
        </Routes>
      </Suspense>
    </MainLayout>
  );
};

export default App;
