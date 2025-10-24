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
import { useAuthStore } from './store/auth';

// Temporary mock auth bootstrap: assume user is logged in
// This block sets a mock token and user for global availability via Zustand.
// Remove when real authentication is implemented.
(() => {
  const { accessToken, setToken, setUser, user } = useAuthStore.getState();
  if (!accessToken) {
    setToken('mock-dev-token');
  }
  if (!user) {
    setUser({ id: 'u-001', name: '개발자', email: 'dev@example.com', roles: ['ADMIN'] });
  }
})();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
        <ToastContainer position="top-right" autoClose={2500} hideProgressBar={false} newestOnTop closeOnClick pauseOnFocusLoss draggable pauseOnHover theme="colored" />
      </QueryClientProvider>
    </ThemeProvider>
  </StrictMode>,
);
