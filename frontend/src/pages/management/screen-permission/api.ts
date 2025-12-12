// 화면 권한 관리 API

import { getApi, postApi, putApi, deleteApi } from '@/utils/apiUtils';
import { API_ENDPOINTS } from '@/constants/endpoints';
import { env } from '@/config';
import { permissionMockDb } from '@/mocks/permissionDb';
import type { Permission, MenuTreeItem, ScreenPermission, ScreenPermissionInput } from './types';

// Firebase POST 응답 타입
interface FirebasePostResponse {
  name: string;
}

const screenPermissionBasePath = 'management/screen-permission';

/**
 * 권한 목록 조회
 */
export const fetchPermissions = async (): Promise<Permission[]> => {
  // Mock 데이터 사용 (권한은 별도 관리)
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
 * 메뉴 트리 조회 (Firebase에서 가져오기)
 */
export const fetchMenuTree = async (): Promise<MenuTreeItem[]> => {
  const response = await getApi<Record<string, any>>('management/menu.json', {
    baseURL: env.testURL,
    errorMessage: '메뉴 트리를 불러오지 못했습니다.',
  });

  if (!response.data || typeof response.data !== 'object') {
    return [];
  }

  // display_yn = 'Y'이고 홈이 아닌 항목만 필터링
  const visibleItems = Object.entries(response.data)
    .map(([firebaseKey, data]: [string, any]) => ({
      id: firebaseKey,
      menu_code: data.menu_code,
      menu_name: data.menu_name,
      menu_path: data.menu_path,
      parent_menu_code: data.parent_menu_code,
      sort_order: data.sort_order,
      is_active: data.is_active,
    }))
    .filter((item) => item.is_active === 1 && item.menu_path !== '/');

  // ID로 빠른 조회를 위한 맵
  const itemMap = new Map<string | number, MenuTreeItem>();
  const childrenMap = new Map<string | number, MenuTreeItem[]>();

  // 각 항목을 MenuTreeItem 형식으로 변환
  visibleItems.forEach((item) => {
    const menuItem: MenuTreeItem = {
      id: item.id,
      label: item.menu_name,
      path: item.menu_path,
    };
    itemMap.set(item.id, menuItem);
    childrenMap.set(item.id, []);
  });

  // 부모-자식 관계 구성
  const tree: MenuTreeItem[] = [];
  visibleItems.forEach((item) => {
    const menuItem = itemMap.get(item.id)!;

    if (!item.parent_menu_code) {
      // 최상위 메뉴
      tree.push(menuItem);
    } else {
      // 하위 메뉴 - parent_menu_code로 부모 찾기
      const parent = Array.from(itemMap.values()).find(
        (m) => visibleItems.find((i) => i.id === m.id)?.menu_code === item.parent_menu_code,
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
  const response = await getApi<Record<string, ScreenPermission>>(
    `${screenPermissionBasePath}.json`,
    {
      baseURL: env.testURL,
      errorMessage: '화면 권한 목록을 불러오지 못했습니다.',
    },
  );

  if (!response.data || typeof response.data !== 'object') {
    return [];
  }

  // 해당 권한의 화면 권한만 필터링
  return Object.entries(response.data)
    .filter(([_, data]) => data.permission_id === permissionId)
    .map(([firebaseKey, data]) => ({
      ...data,
      id: firebaseKey as any,
    }));
};

/**
 * 화면 권한 일괄 저장
 */
export const saveScreenPermissions = async (
  permissionId: number,
  permissions: ScreenPermissionInput[],
): Promise<void> => {
  // 기존 권한 삭제
  const existing = await fetchScreenPermissions(permissionId);

  const deletePromises = existing.map((item) =>
    deleteApi(`${screenPermissionBasePath}/${item.id}.json`, {
      baseURL: env.testURL,
      errorMessage: '',
    }),
  );

  await Promise.all(deletePromises);

  // 새 권한 추가
  const createPromises = permissions.map((p) =>
    postApi<FirebasePostResponse>(
      `${screenPermissionBasePath}.json`,
      {
        permission_id: permissionId,
        menu_id: p.menu_id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        baseURL: env.testURL,
        errorMessage: '',
      },
    ),
  );

  await Promise.all(createPromises);
};

/**
 * 화면 권한 삭제
 */
export const deleteScreenPermission = async (
  permissionId: number,
  menuId: number,
): Promise<void> => {
  const permissions = await fetchScreenPermissions(permissionId);
  const target = permissions.find((p) => p.menu_id === menuId);

  if (target) {
    await deleteApi(`${screenPermissionBasePath}/${target.id}.json`, {
      baseURL: env.testURL,
      errorMessage: '화면 권한 삭제에 실패했습니다.',
    });
  }
};
