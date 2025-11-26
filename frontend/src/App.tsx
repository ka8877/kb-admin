import React, { Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import { frontRoutes } from './routes/registry';
import GlobalConfirmDialog from './components/common/dialog/GlobalConfirmDialog';
import GlobalAlertDialog from './components/common/dialog/GlobalAlertDialog';
import GlobalLoadingSpinner from './components/common/spinner/GlobalLoadingSpinner';

const App: React.FC = () => {
  return (
    <>
      <MainLayout>
        <Suspense fallback={<GlobalLoadingSpinner isLoading={true} />}>
          <Routes>
            {/**
             * 보호 라우트 적용 예시 (RequireAuth 사용):
             * <Route path="/dashboard" element={<RequireAuth><DashboardPage /></RequireAuth>} />
             * - 실제로 적용하려면 위 컴포넌트 임포트와 해당 라우트 컴포넌트를 추가.
             */}
            {frontRoutes.map(({ path, Component }) => (
              <Route key={path} path={path} element={<Component />} />
            ))}
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
