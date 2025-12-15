import { useEffect, useRef, useCallback } from 'react';
import { useAuthStore } from '@/store/auth';
import { logoutKeycloak } from '@/utils/keycloak';

const INACTIVITY_LIMIT = 60 * 60 * 1000; // 60분 (밀리초 단위)

/**
 * 사용자 비활동 감지 및 자동 로그아웃 훅
 * 사용자가 60분 동안 활동(마우스 이동, 클릭, 키 입력 등)이 없으면 자동으로 로그아웃 처리
 */
export const useInactivityLogout = () => {
  const user = useAuthStore((state) => state.user);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const logout = useCallback(() => {
    if (user) {
      console.warn('User inactive for 60 minutes. Logging out...');
      logoutKeycloak();
    }
  }, [user]);

  const resetTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    if (user) {
      timerRef.current = setTimeout(logout, INACTIVITY_LIMIT);
    }
  }, [logout, user]);

  useEffect(() => {
    // 로그인하지 않은 경우 타이머 해제 및 리턴
    if (!user) {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      return;
    }

    // 초기 타이머 시작
    resetTimer();

    // 감지할 이벤트 목록
    const events = ['mousemove', 'mousedown', 'keypress', 'scroll', 'touchstart', 'click'];

    // 이벤트 핸들러 (스로틀링 적용: 1초에 한 번만 타이머 리셋)
    let throttleTimer: ReturnType<typeof setTimeout> | null = null;
    const handleActivity = () => {
      if (!throttleTimer) {
        throttleTimer = setTimeout(() => {
          resetTimer();
          throttleTimer = null;
        }, 1000);
      }
    };

    // 이벤트 리스너 등록
    events.forEach((event) => {
      window.addEventListener(event, handleActivity);
    });

    // 클린업
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      if (throttleTimer) {
        clearTimeout(throttleTimer);
      }
      events.forEach((event) => {
        window.removeEventListener(event, handleActivity);
      });
    };
  }, [user, resetTimer]);
};
