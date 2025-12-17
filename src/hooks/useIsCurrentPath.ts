import { useLocation, matchPath } from 'react-router-dom';

/**
 * 현재 URL이 주어진 경로와 일치하는지 확인하는 커스텀 훅
 *
 * @param targetPath - 비교할 대상 경로
 * @param exact - 정확히 일치해야 하는지 여부 (기본값: true). false인 경우 하위 경로도 포함하여 매칭
 * @returns 일치 여부 (boolean)
 */
export const useIsCurrentPath = (targetPath: string, exact: boolean = true): boolean => {
  const location = useLocation();

  if (!targetPath) return false;

  if (exact) {
    return location.pathname === targetPath;
  }

  // exact가 false일 경우, matchPath를 사용하여 하위 경로 포함 여부 확인
  // end: false 옵션은 해당 경로로 시작하는지 확인 (prefix 매칭)
  const match = matchPath({ path: targetPath, end: false }, location.pathname);
  return !!match;
};
