import type { PropsWithChildren } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/auth';
import { env } from '@/config/env';

/**
 * RequireAuth guard
 * - accessToken 존재 여부로 간단히 인증 여부를 판단합니다.
 * - 미인증이면 로그인 페이지로 보냅니다.
 */
const RequireAuth = ({ children }: PropsWithChildren) => {
  const token = useAuthStore((s) => s.accessToken);
  const location = useLocation();
  // 개발 편의를 위해, 인증 비활성화 설정 시에는 가드를 통과시킵니다.
  if (!env.auth.enabled) {
    return <>{children}</>;
  }

  // 인증이 활성화된 경우에만 토큰을 검사하여 미인증 사용자를 로그인 페이지로 보냅니다.
  if (!token) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  return <>{children}</>;
};

export default RequireAuth;
