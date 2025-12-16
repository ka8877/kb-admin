// 화면 권한 관리 API

import { getApi, postApi, putApi, deleteApi, patchApi } from '@/utils/apiUtils';
import { API_ENDPOINTS } from '@/constants/endpoints';
import { env } from '@/config';
import type { Permission, MenuTreeItem, ScreenPermission, ScreenPermissionInput } from './types';

// Firebase POST 응답 타입
interface FirebasePostResponse {
  name: string;
}

const screenPermissionBasePath = 'management/screen-permission';
const menuBasePath = 'management/menu';

/**
 * 권한 목록 조회
 */
export const fetchPermissions = async (): Promise<Permission[]> => {
  const res = await getApi<Record<string, any>>(API_ENDPOINTS.PERMISSION.LIST, {
    baseURL: env.testURL,
    errorMessage: '권한 목록을 불러오지 못했습니다.',
  });

  if (!res.data || typeof res.data !== 'object') return [];

  return Object.entries(res.data).map(([firebaseKey, item], idx) => ({
    permission_id: idx + 1,
    permission_code: item.permission_id ?? firebaseKey,
    permission_name: item.permission_name,
    description: item.description,
    is_active: item.status === '비활성' ? 0 : (item.is_active ?? 1),
    created_at: item.created_at || '',
    updated_at: item.updated_at || null,
    firebaseKey,
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

  // Firebase menu 데이터를 MenuTreeItem[] 형식으로 변환 (코드/부모코드/깊이 지원)
  type RawMenu = {
    menu_name: string;
    menu_path: string;
    menu_code?: string;
    parent_menu_code?: string;
    MENU_CODE?: string;
    PARENT_MENU_CODE?: string;
    parent_menu_id?: string;
    parent_screen_id?: string;
    MENU_DEPTH?: number | string;
    menu_depth?: number | string;
    sort_order?: number | string;
    is_active?: number;
  };

  const allEntries = Object.entries(response.data) as Array<[string, RawMenu]>;
  // 홈('/') 항목과 비활성화된 메뉴(is_active=0)는 화면 목록/권한 대상에서 제외
  const rawEntries = allEntries.filter(
    ([, d]) => d.menu_path !== '/' && (d.is_active === undefined || d.is_active === 1),
  );

  const getDepth = (d: RawMenu): number => {
    const v = (d.MENU_DEPTH ?? d.menu_depth) as any;
    if (typeof v === 'number') return v;
    if (typeof v === 'string' && v.trim() !== '' && !isNaN(Number(v))) return Number(v);
    // fallback: 부모코드/부모ID의 존재 여부로 추론
    return d.parent_menu_code || d.PARENT_MENU_CODE || d.parent_screen_id || d.parent_menu_id
      ? 1
      : 0;
  };

  const getCode = (d: RawMenu): string | undefined => d.menu_code || d.MENU_CODE;
  const getParentCode = (d: RawMenu): string | undefined =>
    d.parent_menu_code || d.PARENT_MENU_CODE;
  const getSortOrder = (d: RawMenu): number => {
    const v = d.sort_order;
    if (typeof v === 'number') return v;
    if (typeof v === 'string' && v.trim() !== '' && !isNaN(Number(v))) return Number(v);
    return 9999; // 기본 크게 설정해 뒤로 정렬
  };

  // 1) 기본 맵 구성
  const byId = new Map<string, MenuTreeItem>();
  const byCode = new Map<string, string>(); // code -> id(firebaseKey)

  rawEntries.forEach(([id, data]) => {
    const item: MenuTreeItem = {
      id,
      label: data.menu_name,
      path: data.menu_path,
      depth: getDepth(data),
      sort_order: getSortOrder(data),
    };
    byId.set(id, item);
    const code = getCode(data);
    if (code) byCode.set(code, id);
  });

  // 2) 트리 구성: parent_menu_code 우선, 없으면 parent_screen_id, 그다음 parent_menu_id, 마지막으로 depth 기반
  const childrenMap = new Map<string, MenuTreeItem[]>();
  rawEntries.forEach(([id]) => childrenMap.set(id, []));

  const roots: string[] = [];

  rawEntries.forEach(([id, data]) => {
    const parentCode = getParentCode(data);
    const parentIdByCode = parentCode ? byCode.get(parentCode) : undefined;
    const parentId =
      parentIdByCode ??
      (data.parent_screen_id ? String(data.parent_screen_id) : undefined) ??
      (data.parent_menu_id ? String(data.parent_menu_id) : undefined);

    if (parentId && byId.has(parentId)) {
      childrenMap.get(parentId)!.push(byId.get(id)!);
    } else if ((byId.get(id)?.depth ?? 0) === 0) {
      roots.push(id);
    } else {
      // depth>0인데 부모 못 찾으면 루트로 승격
      roots.push(id);
    }
  });

  // 3) 자식 연결 및 트리 반환
  byId.forEach((value, id) => {
    const kids = childrenMap.get(id);
    if (kids && kids.length)
      value.children = kids.sort((a, b) => (a.sort_order ?? 9999) - (b.sort_order ?? 9999));
  });

  const result = roots
    .map((rid) => byId.get(rid)!)
    .filter(Boolean)
    .sort((a, b) => (a.sort_order ?? 9999) - (b.sort_order ?? 9999)) as MenuTreeItem[];

  return result;
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
      id: firebaseKey as string,
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
      successMessage: '',
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
        successMessage: '',
      },
    ),
  );

  await Promise.all(createPromises);
};

/**
 * 메뉴 정렬 순서 업데이트 (부분 업데이트)
 */
export const updateMenuSortOrder = async (
  menuId: string | number,
  sortOrder: number,
): Promise<void> => {
  await patchApi(
    `${menuBasePath}/${menuId}.json`,
    {
      sort_order: sortOrder,
      updated_at: new Date().toISOString(),
    },
    {
      baseURL: env.testURL,
      errorMessage: '화면 순서 저장에 실패했습니다.',
      successMessage: '화면 순서가 저장되었습니다.',
    },
  );
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
