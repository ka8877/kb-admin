// 메뉴 관리 API
// API spec 3) 메뉴 섹션 기준으로 작성

import { getApi, postApi } from '@/utils/apiUtils';
import { API_ENDPOINTS } from '@/constants/endpoints';
import type { MenuItem, MenuItemDisplay } from './types';

/**
 * 메뉴 목록 조회
 * API spec: GET /api/v1/menus?includeInactive=false
 */
export const fetchMenus = async (params?: {
  includeInactive?: boolean;
}): Promise<MenuItemDisplay[]> => {
  const { includeInactive = false } = params || {};

  const response = await getApi<MenuItem[]>(API_ENDPOINTS.MENU.LIST, {
    params: { includeInactive },
    errorMessage: '메뉴 목록을 불러오지 못했습니다.',
  });

  const items = Array.isArray(response.data) ? response.data : [];

  // sortOrder로 정렬 후 화면 표시용 no 추가
  return items
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((item, index) => ({
      ...item,
      no: index + 1,
    }));
};

/**
 * 메뉴 상세 조회
 * API spec: GET /api/v1/menus/{menuId}
 */
export const fetchMenu = async (menuId: number): Promise<MenuItem> => {
  const response = await getApi<MenuItem>(API_ENDPOINTS.MENU.DETAIL(menuId), {
    errorMessage: '메뉴 상세 정보를 불러오지 못했습니다.',
  });

  return response.data;
};

/**
 * 메뉴 생성
 * API spec: POST /api/v1/menus
 */
export const createMenu = async (data: {
  menuCode: string;
  menuName: string;
  menuPath: string | null;
  parentMenuCode: string | null;
  sortOrder: number;
  isVisible: boolean;
}): Promise<MenuItem> => {
  const response = await postApi<MenuItem>(API_ENDPOINTS.MENU.CREATE, data, {
    errorMessage: '메뉴 생성에 실패했습니다.',
  });

  return response.data;
};

/**
 * 메뉴 수정
 * API spec: POST /api/v1/menus/{menuId}
 */
export const updateMenu = async (
  menuId: number,
  data: {
    menuName: string;
    menuPath: string | null;
    parentMenuCode: string | null;
    sortOrder: number;
    isVisible: boolean;
  }
): Promise<void> => {
  await postApi(API_ENDPOINTS.MENU.UPDATE(menuId), data, {
    errorMessage: '메뉴 수정에 실패했습니다.',
  });
};

/**
 * 메뉴 비활성화
 * API spec: POST /api/v1/menus/{menuId}/deactivate
 */
export const deactivateMenu = async (menuId: number): Promise<void> => {
  await postApi(
    API_ENDPOINTS.MENU.DEACTIVATE(menuId),
    {},
    {
      errorMessage: '메뉴 비활성화에 실패했습니다.',
    }
  );
};

/**
 * 메뉴 코드 중복 확인 (클라이언트측)
 */
export const checkMenuCodeExists = async (
  menuCode: string,
  excludeMenuId?: number
): Promise<boolean> => {
  const menus = await fetchMenus({ includeInactive: true });
  return menus.some((menu) => menu.menuCode === menuCode && menu.menuId !== excludeMenuId);
};

// 하위 호환성을 위한 함수
export const deleteMenu = async (menuId: number): Promise<void> => {
  await deactivateMenu(menuId);
};
