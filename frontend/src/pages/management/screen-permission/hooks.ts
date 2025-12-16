// 화면 권한 관리 React Query 훅

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchPermissions,
  fetchMenuTree,
  fetchScreenPermissions,
  saveScreenPermissions,
  deleteScreenPermission,
  updateMenuSortOrder,
} from './api';
import type { ScreenPermissionInput } from './types';

const screenPermissionKeys = {
  all: ['screenPermission'] as const,
  permissions: () => [...screenPermissionKeys.all, 'permissions'] as const,
  menuTree: () => [...screenPermissionKeys.all, 'menuTree'] as const,
  screenPermissions: (permissionId: number) =>
    [...screenPermissionKeys.all, 'screenPermissions', permissionId] as const,
  menuSort: () => [...screenPermissionKeys.all, 'menuSort'] as const,
};

/**
 * 권한 목록 조회 훅
 */
export const usePermissions = () => {
  return useQuery({
    queryKey: screenPermissionKeys.permissions(),
    queryFn: fetchPermissions,
  });
};

/**
 * 메뉴 트리 조회 훅
 */
export const useMenuTree = () => {
  return useQuery({
    queryKey: screenPermissionKeys.menuTree(),
    queryFn: fetchMenuTree,
  });
};

/**
 * 화면 권한 조회 훅
 */
export const useScreenPermissions = (permissionId: number | null) => {
  return useQuery({
    queryKey: screenPermissionKeys.screenPermissions(permissionId!),
    queryFn: () => fetchScreenPermissions(permissionId!),
    enabled: !!permissionId,
  });
};

/**
 * 화면 권한 저장 뮤테이션 훅
 */
export const useSaveScreenPermissions = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      permissionId,
      permissions,
    }: {
      permissionId: number;
      permissions: ScreenPermissionInput[];
    }) => saveScreenPermissions(permissionId, permissions),
    onSuccess: (_, variables) => {
      // 해당 권한의 화면 권한 목록 무효화
      queryClient.invalidateQueries({
        queryKey: screenPermissionKeys.screenPermissions(variables.permissionId),
      });
    },
  });
};

/**
 * 화면 권한 삭제 뮤테이션 훅
 */
export const useDeleteScreenPermission = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ permissionId, menuId }: { permissionId: number; menuId: number }) =>
      deleteScreenPermission(permissionId, menuId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: screenPermissionKeys.screenPermissions(variables.permissionId),
      });
    },
  });
};

/**
 * 메뉴 정렬 순서 업데이트 훅
 */
export const useUpdateMenuSortOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ menuId, sortOrder }: { menuId: string | number; sortOrder: number }) =>
      updateMenuSortOrder(menuId, sortOrder),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: screenPermissionKeys.menuTree() });
    },
  });
};
