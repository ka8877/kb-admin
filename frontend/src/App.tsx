import React, { Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import { frontRoutes } from './routes/registry';
import GlobalConfirmDialog from './components/common/dialog/GlobalConfirmDialog';
import GlobalAlertDialog from './components/common/dialog/GlobalAlertDialog';
import GlobalLoadingSpinner from './components/common/spinner/GlobalLoadingSpinner';
import RequireAuth from './components/guards/RequireAuth';
import { ROUTES } from './routes/menu';

const App: React.FC = () => {
  return (
    <>
      <MainLayout>
        <Suspense fallback={<GlobalLoadingSpinner isLoading={true} />}>
          <Routes>
            {frontRoutes.map(({ path, Component }) => {
              // 로그인 페이지는 보호하지 않음
              if (path === ROUTES.LOGIN) {
                return <Route key={path} path={path} element={<Component />} />;
              }
              // 나머지 모든 페이지는 로그인 필요
              return (
                <Route
                  key={path}
                  path={path}
                  element={
                    // TODO 로그인 개발 후 주석 제거
                    // <RequireAuth>
                      <Component />
                    //</RequireAuth>
                  }
                />
              );
            })}
            <Route path="/404" element={<div>Not Found</div>} />
            <Route path="*" element={<Navigate to="/404" replace />} />
          </Routes>
        </Suspense>
      </MainLayout>
      <GlobalConfirmDialog />
      <GlobalAlertDialog />
      <GlobalLoadingSpinner />
    </>
  );
};

export default App;
