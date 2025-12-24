import { keycloak } from '@/config/env';
import { useAuthStore } from '@/store/auth';
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

      // 1. Keycloak 토큰 설정
      setToken(keycloak.token);

      // 2. 백엔드 /login API 호출하여 사용자 프로필 조회
      // TODO: API 연동 후 아래 주석 해제하고 하드코딩 제거
      // const response = await fetchApi<AuthUser>({
      //   method: 'POST',
      //   endpoint: API_ENDPOINTS.AUTH.LOGIN,
      // });
      //
      // if (response.success && response.data) {
      //   const userData = response.data;
      //   setUser(userData);
      //
      //   // 3. IP 체크 (세션당 1회)
      //   await handleLoginIpCheck(userData);
      // } else {
      //   console.error('Login API failed:', response.message);
      //   setUser(null);
      // }

      // 임시 하드코딩 데이터
      const userData = {
        id: 'test-user-001',
        name: '홍길동',
        email: 'hong@example.com',
        roles: ['ADMIN', 'USER'],
        role: 'admin' as const,
        lastLoginIp: '192.168.0.1',
        lastLoginTime: '2023-12-15 10:00:00',
        currentLoginIp: '192.168.0.2',
      };
      setUser(userData);

      // 3. IP 체크 (세션당 1회)
      await handleLoginIpCheck(userData);
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
  // 1. Zustand 스토어 초기화 (localStorage의 access_token도 함께 제거됨)
  const { clear } = useAuthStore.getState();
  clear();

  // 2. sessionStorage 전체 초기화
  sessionStorage.clear();

  // 3. Keycloak 로그아웃
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
 * @param userData 사용자 정보 (IP 정보 포함)
 */
export const handleLoginIpCheck = async (userData: {
  id: string;
  lastLoginIp?: string;
  lastLoginTime?: string;
  currentLoginIp?: string;
}) => {
  const storageKey = `hasCheckedIp_${userData.id}`;

  // 이미 체크했다면 스킵
  if (sessionStorage.getItem(storageKey)) {
    console.log('Login IP check skipped (already checked for this session)');
    return;
  }

  try {
    const { lastLoginIp, lastLoginTime, currentLoginIp } = userData;

    // IP가 다를 경우 알림
    if (lastLoginIp && currentLoginIp && currentLoginIp !== lastLoginIp) {
      const message = `최종 접속 정보와 상이합니다.\n\n최종 접속 IP: ${lastLoginIp}\n최종 접속 시간: ${lastLoginTime || '알 수 없음'}\n현재 접속 IP: ${currentLoginIp}`;

      toast.error(message, {
        toastId: 'login-ip-alert', // 중복 표시 방지
        style: { whiteSpace: 'pre-line' },
      });
    }

    // 체크 완료 표시
    sessionStorage.setItem(storageKey, 'true');
  } catch (error) {
    console.error('Login IP check failed:', error);
  }
};
