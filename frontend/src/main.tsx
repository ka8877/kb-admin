import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import theme from './theme';
import { queryClient } from './lib/query/client';
import './styles/variables.css';
import './styles/globals.css';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { initKeycloak } from './utils/keycloak';
import { env } from './config/env';

const renderApp = () => {
  const rootEl = document.getElementById('root');
  if (!rootEl) return;

  createRoot(rootEl).render(
    <StrictMode>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <QueryClientProvider client={queryClient}>
          <BrowserRouter basename={import.meta.env.BASE_URL}>
            <App />
          </BrowserRouter>
          <ToastContainer
            position="top-right"
            autoClose={2500}
            hideProgressBar={false}
            newestOnTop
            closeOnClick
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="colored"
          />
        </QueryClientProvider>
      </ThemeProvider>
    </StrictMode>,
  );
};

// 인증 사용 여부에 따라 Keycloak 초기화 여부 결정
if (env.auth.enabled) {
  initKeycloak()
    .then(() => {
      renderApp();
    })
    .catch((error) => {
      console.error('Failed to initialize app:', error);
    });
} else {
  // 개발용: 인증 비활성화 상태에서는 바로 앱 렌더링
  renderApp();
}
