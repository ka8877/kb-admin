// 화면 권한 관리 API

import { getApi, postApi, deleteApi } from '@/utils/apiUtils';
import { API_ENDPOINTS } from '@/constants/endpoints';
import { env } from '@/config';
import { permissionMockDb } from '@/mocks/permissionDb';
import { menuMockDb } from '@/mocks/menuDb';
import { buildMenuTree } from '@/utils/menuUtils';
import type { Permission, MenuTreeItem, ScreenPermission, ScreenPermissionInput } from './types';

const screenPermissionBasePath = 'management/screen-permission';

// Mock 화면 권한 데이터
const mockScreenPermissions: ScreenPermission[] = [];

/**
 * 권한 목록 조회
 */
export const fetchPermissions = async (): Promise<Permission[]> => {
  // Mock 데이터 사용
  const permissions = await permissionMockDb.listAll();

  // PermissionItem을 Permission으로 변환
  return permissions.map((item) => ({
    permission_id: typeof item.id === 'number' ? item.id : parseInt(String(item.id)),
    permission_code: item.permission_id,
    permission_name: item.permission_name,
    description: undefined,
    is_active: item.status === '활성' ? 1 : 0,
    created_at: item.created_at || '',
    updated_at: item.updated_at || null,
  }));
};

/**
 * 메뉴 트리 조회
 */
export const fetchMenuTree = async (): Promise<MenuTreeItem[]> => {
  // Mock 데이터 사용
  const menus = await menuMockDb.listAll();

  // display_yn = 'Y'이고 홈이 아닌 항목만 필터링
  const visibleItems = menus.filter((item) => item.display_yn === 'Y' && item.path !== '/');

  // ID로 빠른 조회를 위한 맵
  const itemMap = new Map<string | number, MenuTreeItem>();
  const childrenMap = new Map<string | number, MenuTreeItem[]>();

  // 각 항목을 MenuTreeItem 형식으로 변환
  visibleItems.forEach((item) => {
    const menuItem: MenuTreeItem = {
      id: item.id,
      label: item.screen_name,
      path: item.path,
    };
    itemMap.set(item.id, menuItem);
    childrenMap.set(item.id, []);
  });

  // 부모-자식 관계 구성
  const tree: MenuTreeItem[] = [];
  visibleItems.forEach((item) => {
    const menuItem = itemMap.get(item.id)!;

    if (!item.parent_screen_id) {
      // 최상위 메뉴
      tree.push(menuItem);
    } else {
      // 하위 메뉴 - parent_screen_id로 부모 찾기
      const parent = Array.from(itemMap.values()).find(
        (m) => visibleItems.find((i) => i.id === m.id)?.screen_id === item.parent_screen_id,
      );
      if (parent && childrenMap.has(parent.id)) {
        childrenMap.get(parent.id)!.push(menuItem);
      }
    }
  });

  // 자식 항목을 부모에 연결
  itemMap.forEach((menuItem, id) => {
    const children = childrenMap.get(id);
    if (children && children.length > 0) {
      menuItem.children = children;
    }
  });

  return tree;
};

/**
 * 특정 권한의 화면 권한 목록 조회
 */
export const fetchScreenPermissions = async (permissionId: number): Promise<ScreenPermission[]> => {
  // Mock 데이터에서 해당 권한의 화면 권한 필터링
  return mockScreenPermissions.filter((sp) => sp.permission_id === permissionId);
};

/**
 * 화면 권한 일괄 저장
 */
export const saveScreenPermissions = async (
  permissionId: number,
  permissions: ScreenPermissionInput[],
): Promise<void> => {
  // Mock 데이터 업데이트: 기존 권한 삭제 후 새로 추가
  const filtered = mockScreenPermissions.filter((sp) => sp.permission_id !== permissionId);
  mockScreenPermissions.length = 0;
  mockScreenPermissions.push(...filtered);

  permissions.forEach((p, index) => {
    mockScreenPermissions.push({
      id: Date.now() + index,
      permission_id: permissionId,
      menu_id: p.menu_id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
  });

  // Mock 성공 응답
  await new Promise((resolve) => setTimeout(resolve, 300));
};

/**
 * 화면 권한 삭제
 */
export const deleteScreenPermission = async (
  permissionId: number,
  menuId: number,
): Promise<void> => {
  // Mock 데이터에서 삭제
  const index = mockScreenPermissions.findIndex(
    (sp) => sp.permission_id === permissionId && sp.menu_id === menuId,
  );
  if (index !== -1) {
    mockScreenPermissions.splice(index, 1);
  }

  // Mock 성공 응답
  await new Promise((resolve) => setTimeout(resolve, 100));
};
