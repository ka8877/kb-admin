import type { PropsWithChildren } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/auth';

/**
 * RequireAuth guard
 * - accessToken 존재 여부로 간단히 인증 여부를 판단합니다.
 * - 미인증이면 로그인 페이지로 보냅니다.
 */
const RequireAuth = ({ children }: PropsWithChildren) => {
  const token = useAuthStore((s) => s.accessToken);
  const location = useLocation();
   if (!token) {
     return <Navigate to="/login" replace state={{ from: location }} />;
   }
  return <>{children}</>;
};

export default RequireAuth;
