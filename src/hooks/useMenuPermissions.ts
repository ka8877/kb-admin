import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import type { MenuItem } from '@/routes/menu';
import type { MenuTreeItem } from '@/pages/management/screen-permission/types';
import { env } from '@/config/env';
import {
  fetchMenuTree,
  fetchPermissions,
  fetchRoleMenuAccess,
} from '@/pages/management/screen-permission/api';

type MenuNode = MenuItem & { id?: string | number; code?: string; children?: MenuNode[] };

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
  refreshTrigger?: number
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

        // 메뉴 트리 조회
        const menuTree = await fetchMenuTree();

        // AUTH_ENABLED가 true면 권한 체크 없이 전체 메뉴 노출
        if (env.auth.enabled) {
          if (!mounted) return;

          const paths = collectPaths(menuTree as MenuItem[]);
          setMenus(menuTree as MenuItem[]);
          setAllowedPaths(paths);
          setMenusLoaded(true);
          return;
        }

        // AUTH_ENABLED가 false일 때만 권한 기반 필터링
        const roleCode = String(userRole || '').toUpperCase();
        const permissions = await fetchPermissions();

        // 사용자 역할 코드에 해당하는 permission 찾기
        const matchedPermission = permissions.find(
          (p) => String(p.permission_code || '').toUpperCase() === roleCode
        );

        let filteredMenus: MenuNode[];
        if (!matchedPermission) {
          // 권한 정보 없으면 전체 메뉴 노출
          filteredMenus = menuTree as MenuNode[];
        } else {
          // 메뉴 접근 권한 데이터로 메뉴 필터링
          const roleMenuAccess = await fetchRoleMenuAccess(matchedPermission.permission_code);
          const grantedMenus = roleMenuAccess.menus.filter((m) => m.granted);

          // 권한이 없으면 전체 메뉴 노출, 있으면 필터링
          if (grantedMenus.length === 0) {
            filteredMenus = menuTree as MenuNode[];
          } else {
            // menuCode를 menuTree의 id와 매칭하기 위해 menuCode를 id로 변환
            const menuCodeToId = new Map<string, string | number>();
            const buildCodeMap = (nodes: MenuTreeItem[]) => {
              nodes.forEach((node) => {
                if (node.id !== undefined && node.code) {
                  menuCodeToId.set(node.code, node.id);
                }
                if (node.children) buildCodeMap(node.children);
              });
            };
            buildCodeMap(menuTree);

            const allowedIds = new Set<string>(
              grantedMenus.map((m) => String(menuCodeToId.get(m.menuCode) || m.menuCode))
            );
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
      (p) => pathname === p || (p !== '/' && pathname.startsWith(p + '/'))
    );

    if (!allowed) {
      console.warn('[Access Denied] Redirecting to home:', pathname);
      toast.warn('접근할 수 없는 페이지입니다.');
      navigate('/', { replace: true });
    }
  }, [pathname, allowedPaths, menusLoaded, isLoginPage, navigate]);

  return { menus, allowedPaths, menusLoaded };
};
