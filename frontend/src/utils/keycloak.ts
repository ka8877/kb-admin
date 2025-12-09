import { keycloak } from '@/config/env';
import { useAuthStore } from '@/store/auth';

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

      setUser({
        id: profile.id || '',
        name: profile.username || profile.firstName || 'User',
        email: profile.email || '',
        roles: keycloak.realmAccess?.roles || [],
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
