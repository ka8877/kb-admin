// 메뉴 관리 React Query 훅

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchMenus, createMenu, updateMenu, deactivateMenu, checkMenuCodeExists } from './api';
import type { MenuItem } from './types';

const menuKeys = {
  all: ['menus'] as const,
  lists: () => [...menuKeys.all, 'list'] as const,
  detail: (menuId: number) => [...menuKeys.all, 'detail', menuId] as const,
};

/**
 * 전체 메뉴 목록 조회 훅
 */
export const useMenus = (params?: { includeInactive?: boolean }) => {
  return useQuery({
    queryKey: menuKeys.lists(),
    queryFn: () => fetchMenus(params),
  });
};

/**
 * 메뉴 생성 뮤테이션 훅
 */
export const useCreateMenu = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createMenu,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: menuKeys.lists() });
    },
  });
};

/**
 * 메뉴 수정 뮤테이션 훅
 */
export const useUpdateMenu = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      menuId,
      data,
    }: {
      menuId: number;
      data: {
        menuName: string;
        menuPath: string | null;
        parentMenuCode: string | null;
        sortOrder: number;
        isVisible: boolean;
      };
    }) => updateMenu(menuId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: menuKeys.lists() });
    },
  });
};

/**
 * 메뉴 비활성화 뮤테이션 훅
 */
export const useDeactivateMenu = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (menuId: number) => deactivateMenu(menuId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: menuKeys.lists() });
    },
  });
};

/**
 * 메뉴 코드 중복 확인 훅
 */
export const useCheckMenuCode = () => {
  return useMutation({
    mutationFn: ({ menuCode, excludeMenuId }: { menuCode: string; excludeMenuId?: number }) =>
      checkMenuCodeExists(menuCode, excludeMenuId),
  });
};

// 하위 호환성
export const useDeleteMenu = useDeactivateMenu;
