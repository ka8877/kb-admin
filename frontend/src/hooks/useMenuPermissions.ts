import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import type { MenuItem } from '@/routes/menu';
import {
  fetchMenuTree,
  fetchPermissions,
  fetchScreenPermissions,
} from '@/pages/management/screen-permission/api';

type MenuNode = MenuItem & { id?: string | number; children?: MenuNode[] };

/**
 * 메뉴 트리에서 모든 경로를 수집하는 헬퍼 함수
 */
const collectPaths = (list: MenuItem[]): string[] => {
  const pathSet = new Set<string>();
  const walk = (nodes: MenuItem[]) => {
    nodes.forEach((node) => {
      pathSet.add(node.path);
      if (node.children) walk(node.children);
    });
  };
  walk(list);
  return Array.from(pathSet);
};

/**
 * 허용된 메뉴 ID를 기준으로 메뉴 트리 필터링
 * 자식이 없고 허용되지 않은 노드는 제거
 */
const filterByAllowedIds = (list: MenuNode[], allowed: Set<string>): MenuNode[] => {
  return list
    .map((node) => {
      const children = node.children ? filterByAllowedIds(node.children, allowed) : [];
      const id = node.id !== undefined ? String(node.id) : undefined;
      const ok = id ? allowed.has(id) : false;
      if (!ok && children.length === 0) return null;
      return { ...node, children } as MenuNode;
    })
    .filter((n): n is MenuNode => n !== null);
};

/**
 * 메뉴 권한 및 경로 접근 제어 훅
 *
 * 사용자 역할에 따라 메뉴 트리를 필터링하고, 허용되지 않은 경로 접근 시 홈으로 리다이렉트합니다.
 *
 * @param userRole - 사용자 역할 코드 (예: 'ADMIN', 'CRUD', 'VIEWER')
 * @param pathname - 현재 라우터 경로
 * @param isLoginPage - 로그인 페이지 여부 (리다이렉트 방지)
 * @param refreshTrigger - 메뉴 강제 리로드 트리거
 * @returns {Object} menus - 필터링된 메뉴 트리, allowedPaths - 허용된 경로 목록, menusLoaded - 로딩 완료 여부
 *
 * @example
 * const { menus, allowedPaths, menusLoaded } = useMenuPermissions(user?.role, pathname, isLoginPage);
 */
export const useMenuPermissions = (
  userRole: string | undefined,
  pathname: string,
  isLoginPage: boolean,
  refreshTrigger?: number,
) => {
  const [menus, setMenus] = useState<MenuItem[]>([]);
  const [allowedPaths, setAllowedPaths] = useState<string[]>([]);
  const [menusLoaded, setMenusLoaded] = useState(false);
  const navigate = useNavigate();

  // 메뉴 권한 로드 및 필터링
  useEffect(() => {
    // 로그인 페이지에서는 메뉴를 로드하지 않음
    if (isLoginPage) {
      setMenusLoaded(true);
      return;
    }

    let mounted = true;

    const loadAndFilterMenus = async () => {
      try {
        setMenusLoaded(false);
        const roleCode = String(userRole || '').toUpperCase();

        // 메뉴 트리와 권한 목록 병렬 조회
        const [menuTree, permissions] = await Promise.all([fetchMenuTree(), fetchPermissions()]);

        // 디버그 로그
        console.log('[Menu Permission Debug]', {
          userRole,
          roleCode,
          availablePermissions: permissions.map((p) => ({
            permission_id: p.permission_id,
            permission_code: p.permission_code,
          })),
        });

        // 사용자 역할 코드에 해당하는 permission 찾기
        const matchedPermission = permissions.find(
          (p) => String(p.permission_code || '').toUpperCase() === roleCode,
        );

        console.log('[Menu Permission Match]', { matched: !!matchedPermission, matchedPermission });

        let filteredMenus: MenuNode[];
        if (!matchedPermission) {
          // 권한 정보 없으면 전체 메뉴 노출
          console.warn('[Menu Permission] No matched permission, showing all menus');
          filteredMenus = menuTree as MenuNode[];
        } else {
          // 화면 권한 데이터로 메뉴 필터링
          const screenPerms = await fetchScreenPermissions(matchedPermission.permission_id);
          console.log('[Menu Permission Screen Perms]', { screenPerms });
          // 화면 권한이 없으면 전체 메뉴 노출, 있으면 필터링
          if (screenPerms.length === 0) {
            console.warn('[Menu Permission] No screen permissions, showing all menus');
            filteredMenus = menuTree as MenuNode[];
          } else {
            const allowedIds = new Set<string>(screenPerms.map((p) => String(p.menu_id)));
            filteredMenus = filterByAllowedIds(menuTree as MenuNode[], allowedIds);
          }
        }

        if (!mounted) return;

        const paths = collectPaths(filteredMenus);
        setMenus(filteredMenus);
        setAllowedPaths(paths);
        setMenusLoaded(true);
      } catch (err) {
        // 실패 시 전체 메뉴 노출
        console.error('[Menu Permission Load Error]', err);
        try {
          const menuTree = await fetchMenuTree();
          if (mounted) {
            const paths = collectPaths(menuTree as MenuItem[]);
            setMenus(menuTree as MenuItem[]);
            setAllowedPaths(paths);
            setMenusLoaded(true);
          }
        } catch {
          // ignore
        }
      }
    };

    loadAndFilterMenus();
    return () => {
      mounted = false;
    };
  }, [userRole, refreshTrigger, isLoginPage]);

  // 권한 없는 경로 접근 시 리다이렉트
  useEffect(() => {
    if (!menusLoaded || isLoginPage || pathname === '/') return;

    const allowed = allowedPaths.some(
      (p) => pathname === p || (p !== '/' && pathname.startsWith(p + '/')),
    );

    if (!allowed) {
      console.warn('[Access Denied] Redirecting to home:', pathname);
      toast.warn('접근할 수 없는 페이지입니다.');
      navigate('/', { replace: true });
    }
  }, [pathname, allowedPaths, menusLoaded, isLoginPage, navigate]);

  return { menus, allowedPaths, menusLoaded };
};
