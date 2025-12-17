import { keycloak } from '@/config/env';
import { useAuthStore } from '@/store/auth';
import { mapRolesToAppRole } from '@/utils/dataUtils';
import { checkUserLoginIp } from '@/utils/loginCheckUtils';
import { toast } from 'react-toastify';

/**
 * Keycloak 초기화 및 인증 상태 처리
 * @returns authenticated 여부 (boolean)
 */
export const initKeycloak = async (): Promise<boolean> => {
  try {
    const authenticated = await keycloak.init({
      onLoad: 'check-sso',
      checkLoginIframe: false,
    });

    if (authenticated && keycloak.token) {
      const { setToken, setUser } = useAuthStore.getState();
      setToken(keycloak.token);

      const profile = await keycloak.loadUserProfile();
      const roles = keycloak.resourceAccess?.myclient.roles || [];

      // 역할 매핑
      const role = mapRolesToAppRole(roles);

      setUser({
        id: profile.id || '',
        name: profile.username || profile.firstName || 'User',
        email: profile.email || '',
        roles: roles,
        role: role,
      });
    } else {
      // 인증되지 않은 경우 스토어 초기화 (기존 토큰 제거)
      const { setToken, setUser } = useAuthStore.getState();
      setToken(null);
      setUser(null);
    }
    return authenticated;
  } catch (error) {
    console.error('Keycloak init failed', error);
    throw error;
  }
};

/**
 * Keycloak 로그인 페이지로 리다이렉트
 */
export const loginKeycloak = () => {
  keycloak.login({
    redirectUri: window.location.origin,
  });
};

/**
 * Keycloak 로그아웃 처리
 */
export const logoutKeycloak = () => {
  // 로그아웃 시 IP 체크 플래그 초기화 (재로그인 시 다시 체크하기 위함)
  Object.keys(sessionStorage).forEach((key) => {
    if (key.startsWith('hasCheckedIp_')) {
      sessionStorage.removeItem(key);
    }
  });

  keycloak.logout({
    redirectUri: window.location.origin + '/login',
  });
};

/**
 * 토큰 갱신 (API 요청 전 호출 권장 - 방법 2)
 * @param minValidity - 토큰 만료까지 남은 최소 시간(초). 기본값 70초.
 *                      이 시간보다 적게 남았으면 갱신을 시도함.
 */
export const updateToken = async (minValidity = 70): Promise<string | undefined> => {
  try {
    const refreshed = await keycloak.updateToken(minValidity);
    if (refreshed) {
      // 토큰이 갱신되었다면 스토어 업데이트
      const { setToken } = useAuthStore.getState();
      setToken(keycloak.token || null);
    }
    return keycloak.token;
  } catch (error) {
    console.error('Failed to refresh token', error);
    // 갱신 실패 시 로그아웃 처리 (선택 사항)
    logoutKeycloak();
    throw error;
  }
};

/**
 * 로그인 시 IP 체크 및 알림 처리 (세션 당 1회)
 * @param userId 사용자 ID
 */
export const handleLoginIpCheck = async (userId: string) => {
  const storageKey = `hasCheckedIp_${userId}`;

  // 이미 체크했다면 스킵
  if (sessionStorage.getItem(storageKey)) {
    console.log('Login IP check skipped (already checked for this session)');
    return;
  }

  try {
    const ipCheckResult = await checkUserLoginIp(userId);
    if (ipCheckResult.shouldAlert && ipCheckResult.message) {
      // 중요 알림이므로 사용자가 확인하기 전까지 닫히지 않도록 설정
      toast.error(ipCheckResult.message, {
        toastId: 'login-ip-alert', // 중복 표시 방지
        autoClose: false,
        closeOnClick: false,
      });
    }
    // 체크 완료 표시
    sessionStorage.setItem(storageKey, 'true');
  } catch (error) {
    console.error('Login IP check failed:', error);
  }
};
