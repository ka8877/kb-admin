import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/store/auth';
import { getApi } from '@/utils/apiUtils';
import { API_ENDPOINTS } from '@/constants/endpoints';
import { ROLE_ADMIN, ROLE_CRUD, ROLE_VIEWER, ROLE_NONE } from '@/constants/options';

// 버튼 권한 매핑 테이블
/**
 * 버튼 액션 유형
 * c: 등록
 * d: 삭제
 * u: 수정
 * etc: 기타
 */
const BUTTON_PERMISSION_MAP: Record<string, Record<string, boolean>> = {
  [ROLE_ADMIN]: { c: true, d: true, u: true, etc: true },
  [ROLE_CRUD]: { c: true, d: true, u: true, etc: true },
  [ROLE_VIEWER]: { c: false, d: false, u: false, etc: true },
  [ROLE_NONE]: { c: false, d: false, u: false, etc: false },
};

// 상세 화면 권한 매핑 테이블

const DETAIL_PAGE_PERMISSION_MAP: Record<string, boolean> = {
  [ROLE_ADMIN]: true,
  [ROLE_CRUD]: true,
  [ROLE_VIEWER]: false,
  [ROLE_NONE]: false,
};

/**
 * 공통 권한 체크 로직
 * @param type - 체크할 권한 타입
 * @param permissionMap - 사용할 권한 매핑 테이블
 * @param scope - 쿼리 키 구분을 위한 스코프 ('button' | 'page')
 */
const usePermissionCheck = (
  type: string,
  permissionMap: Record<string, Record<string, boolean>>,
  scope: string,
) => {
  const user = useAuthStore((state) => state.user);
  const role = user?.role;

  // 디버깅용 로그
  // console.log('usePermissionCheck params:', { role, type, scope, enabled: !!role && !!type });

  const { data: isAllowed = false } = useQuery({
    queryKey: ['permission', scope, role, type],
    queryFn: async () => {
      if (!role) return false;

      try {
        // [현재 버전] 서버에서 역할 정보를 받아와 클라이언트 맵핑 테이블로 권한 확인
        // 엔드포인트: /role/{role} -> 응답: { role: "admin" }
        const response = await getApi<{ role: string }>(API_ENDPOINTS.AUTH.PERMISSION(role));
        const serverRole = response?.data?.role;

        console.log(
          `[Permission Check] role: ${role}, serverRole: ${serverRole}, type: ${type}, scope: ${scope}`,
        );

        const rolePermissions = permissionMap[serverRole] || permissionMap[ROLE_NONE];
        return rolePermissions[type] ?? false;
      } catch (error) {
        console.error('[Permission Check Error]', error);
        return false;
      }
    },
    // role과 type이 있을 때만 쿼리 실행
    enabled: !!role && !!type,
    // staleTime: 1000 * 60 * 5, // 5분 캐싱
    retry: false,
  });

  return { isAllowed };
};

/**
 * 버튼 권한 체크 훅
 * @param subType - 버튼 기능 타입 ('c', 'd', 'u', 'etc')
 */
export const useButtonPermission = (subType: string) => {
  return usePermissionCheck(subType, BUTTON_PERMISSION_MAP, 'button');
};
