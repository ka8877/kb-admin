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
// import { initKeycloak } from './utils/keycloak';

// TODO 로그인 구현 후 주석 처리 제거 Initialize Keycloak and render App (주석 처리됨)
// initKeycloak()
//   .then(() => {
//     createRoot(document.getElementById('root')!).render(
//       <StrictMode>
//         <ThemeProvider theme={theme}>
//           <CssBaseline />
//           <QueryClientProvider client={queryClient}>
//             <BrowserRouter basename={import.meta.env.BASE_URL}>
//               <App />
//             </BrowserRouter>
//             <ToastContainer
//               position="top-right"
//               autoClose={2500}
//               hideProgressBar={false}
//               newestOnTop
//               closeOnClick
//               pauseOnFocusLoss
//               draggable
//               pauseOnHover
//               theme="colored"
//             />
//           </QueryClientProvider>
//         </ThemeProvider>
//       </StrictMode>,
//     );
//   })
//   .catch((error) => {
//     console.error('Failed to initialize app:', error);
//   });

// Keycloak 초기화 없이 바로 렌더링
createRoot(document.getElementById('root')!).render(
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