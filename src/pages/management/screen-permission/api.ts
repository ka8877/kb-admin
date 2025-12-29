// 화면 권한 관리 API

import { getApi, postApi } from '@/utils/apiUtils';
import { API_ENDPOINTS } from '@/constants/endpoints';
import type { Permission, MenuTreeItem, MenuApiItem, RoleMenuAccessResponse } from './types';

/**
 * 권한(Role) 목록 조회
 * API spec: GET /api/v1/roles
 */
export const fetchPermissions = async (): Promise<Permission[]> => {
  const response = await getApi<
    Array<{
      roleId: number;
      roleCode: string;
      roleName: string;
      isActive: boolean;
    }>
  >(API_ENDPOINTS.PERMISSION.LIST, {
    params: {
      includeInactive: false,
    },
    errorMessage: '권한 목록을 불러오지 못했습니다.',
  });

  const items = Array.isArray(response.data) ? response.data : [];

  return items.map((item) => ({
    permission_id: item.roleId,
    permission_code: item.roleCode,
    permission_name: item.roleName,
    is_active: item.isActive ? 1 : 0,
  }));
};

/**
 * 메뉴 트리 조회
 * API spec: GET /api/v1/menus
 */
export const fetchMenuTree = async (): Promise<MenuTreeItem[]> => {
  const response = await getApi<MenuApiItem[]>(API_ENDPOINTS.MENU.LIST, {
    params: {
      includeInactive: false,
    },
    errorMessage: '메뉴 트리를 불러오지 못했습니다.',
  });

  const items = Array.isArray(response.data) ? response.data : [];

  // 메뉴 코드로 맵 생성
  const byCode = new Map<string, MenuTreeItem>();
  const childrenMap = new Map<string, MenuTreeItem[]>();

  // 1) 기본 맵 구성
  items.forEach((item) => {
    const menuItem: MenuTreeItem = {
      id: item.menuId,
      label: item.menuName,
      path: item.menuPath,
      code: item.menuCode,
      depth: item.depth,
      sort_order: item.sortOrder,
    };
    byCode.set(item.menuCode, menuItem);
    childrenMap.set(item.menuCode, []);
  });

  // 2) 트리 구성
  const roots: MenuTreeItem[] = [];

  items.forEach((item) => {
    const menuItem = byCode.get(item.menuCode)!;

    if (item.parentMenuCode && byCode.has(item.parentMenuCode)) {
      childrenMap.get(item.parentMenuCode)!.push(menuItem);
    } else {
      roots.push(menuItem);
    }
  });

  // 3) 자식 연결 및 정렬
  byCode.forEach((menuItem, code) => {
    const children = childrenMap.get(code);
    if (children && children.length > 0) {
      menuItem.children = children.sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
    }
  });

  return roots.sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
};

/**
 * 특정 권한의 메뉴 접근 정보 조회
 * API spec: GET /api/v1/roles/{roleCode}/menu-access
 */
export const fetchRoleMenuAccess = async (roleCode: string): Promise<RoleMenuAccessResponse> => {
  const response = await getApi<RoleMenuAccessResponse>(
    API_ENDPOINTS.SCREEN_PERMISSION.LIST(roleCode),
    {
      errorMessage: '메뉴 접근 정보를 불러오지 못했습니다.',
    }
  );

  return response.data;
};

/**
 * 권한별 메뉴 접근 권한 저장
 * API spec: POST /api/v1/roles/{roleCode}/menu-access
 */
export const saveRoleMenuAccess = async (
  roleCode: string,
  menuCodes: string[],
  accessMode: 'READ' | 'WRITE' = 'READ'
): Promise<void> => {
  await postApi(
    API_ENDPOINTS.SCREEN_PERMISSION.SAVE_BULK(roleCode),
    {
      menuCodes,
      accessMode,
    },
    {
      errorMessage: '메뉴 접근 권한 저장에 실패했습니다.',
      successMessage: '메뉴 접근 권한이 저장되었습니다.',
    }
  );
};
