// 메뉴 관리 React Query 훅

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchMenus, createMenu, updateMenu, deleteMenu, checkMenuCodeExists } from './api';
import type { MenuItem } from './types';

const menuKeys = {
  all: ['menus'] as const,
  lists: () => [...menuKeys.all, 'list'] as const,
};

/**
 * 전체 메뉴 목록 조회 훅
 */
export const useMenus = () => {
  return useQuery({
    queryKey: menuKeys.lists(),
    queryFn: fetchMenus,
  });
};

/**
 * 메뉴 생성 뮤테이션 훅
 */
export const useCreateMenu = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Omit<MenuItem, 'firebaseKey'>) => createMenu(data),
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
    mutationFn: ({ firebaseKey, updates }: { firebaseKey: string; updates: Partial<MenuItem> }) =>
      updateMenu(firebaseKey, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: menuKeys.lists() });
    },
  });
};

/**
 * 메뉴 삭제 뮤테이션 훅
 */
export const useDeleteMenu = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (firebaseKey: string) => deleteMenu(firebaseKey),
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
    mutationFn: ({ menuCode, excludeKey }: { menuCode: string; excludeKey?: string }) =>
      checkMenuCodeExists(menuCode, excludeKey),
  });
};
