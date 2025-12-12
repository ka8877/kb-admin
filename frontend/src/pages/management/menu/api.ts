// 메뉴 관리 Firebase API
// common-code 패턴 참고

import { getApi, postApi, putApi, deleteApi } from '@/utils/apiUtils';
import { API_ENDPOINTS } from '@/constants/endpoints';
import { env } from '@/config';
import type { MenuItem, MenuItemDisplay, MenuItemFirebase } from './types';

// Firebase POST 응답 타입
interface FirebasePostResponse {
  name: string;
}

const menuBasePath = 'management/menu';

/**
 * MenuItem 변환 헬퍼 함수
 */
const transformMenuItem = (
  v: Partial<MenuItem> & Record<string, any>,
  options: { index: number; fallbackId?: string | number },
): MenuItem => {
  const { fallbackId } = options;

  return {
    menu_code: v.menu_code || '',
    menu_name: v.menu_name || '',
    menu_path: v.menu_path || null,
    parent_menu_code: v.parent_menu_code || null,
    sort_order: v.sort_order ?? 0,
    is_active: v.is_active ?? 1,
    created_by: v.created_by || 1,
    created_at: v.created_at || new Date().toISOString(),
    updated_by: v.updated_by || null,
    updated_at: v.updated_at || null,
    firebaseKey: v.firebaseKey || String(fallbackId || ''),
  };
};

/**
 * 전체 메뉴 목록 조회
 */
export const fetchMenus = async (): Promise<MenuItem[]> => {
  const response = await getApi<Record<string, MenuItem>>(`${menuBasePath}.json`, {
    baseURL: env.testURL,
    errorMessage: '메뉴 목록을 불러오지 못했습니다.',
  });

  if (!response.data || typeof response.data !== 'object') {
    return [];
  }

  const menuArray: MenuItem[] = Object.entries(response.data).map(([firebaseKey, data], index) =>
    transformMenuItem({ ...data, firebaseKey }, { index, fallbackId: firebaseKey }),
  );

  // sort_order로 정렬
  return menuArray.sort((a, b) => a.sort_order - b.sort_order);
};

/**
 * 메뉴 생성
 */
export const createMenu = async (menuData: Omit<MenuItem, 'firebaseKey'>): Promise<MenuItem> => {
  const response = await postApi<FirebasePostResponse>(
    `${menuBasePath}.json`,
    {
      menu_code: menuData.menu_code,
      menu_name: menuData.menu_name,
      menu_path: menuData.menu_path,
      parent_menu_code: menuData.parent_menu_code || null,
      sort_order: menuData.sort_order,
      is_active: menuData.is_active,
      created_by: menuData.created_by || 1,
      created_at: new Date().toISOString(),
      updated_by: null,
      updated_at: null,
    },
    {
      baseURL: env.testURL,
      errorMessage: '메뉴 생성에 실패했습니다.',
      successMessage: '메뉴가 생성되었습니다.',
    },
  );

  const firebaseKey = response.data.name;

  return {
    ...menuData,
    created_at: new Date().toISOString(),
    updated_by: null,
    updated_at: null,
    firebaseKey,
  };
};

/**
 * 메뉴 수정
 */
export const updateMenu = async (
  firebaseKey: string,
  updates: Partial<MenuItem>,
): Promise<MenuItem> => {
  const updateData = {
    ...updates,
    updated_at: new Date().toISOString(),
  };

  await putApi(`${menuBasePath}/${firebaseKey}.json`, updateData, {
    baseURL: env.testURL,
    errorMessage: '메뉴 수정에 실패했습니다.',
    successMessage: '메뉴가 수정되었습니다.',
  });

  return {
    ...(updates as MenuItem),
    firebaseKey,
    updated_at: updateData.updated_at,
  };
};

/**
 * 메뉴 삭제
 */
export const deleteMenu = async (firebaseKey: string): Promise<void> => {
  await deleteApi(`${menuBasePath}/${firebaseKey}.json`, {
    baseURL: env.testURL,
    errorMessage: '메뉴 삭제에 실패했습니다.',
    successMessage: '메뉴가 삭제되었습니다.',
  });
};

/**
 * 메뉴 코드 중복 확인
 */
export const checkMenuCodeExists = async (
  menuCode: string,
  excludeKey?: string,
): Promise<boolean> => {
  const menus = await fetchMenus();
  return menus.some((menu) => menu.menu_code === menuCode && menu.firebaseKey !== excludeKey);
};
