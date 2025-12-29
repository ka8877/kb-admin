// 화면 권한 관리 React Query 훅

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchPermissions, fetchMenuTree, fetchRoleMenuAccess, saveRoleMenuAccess } from './api';
import type { MenuTreeItem } from './types';

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
 * 권한별 메뉴 접근 정보 조회 훅
 */
export const useRoleMenuAccess = (roleCode: string | null) => {
  return useQuery({
    queryKey: [...screenPermissionKeys.all, 'roleMenuAccess', roleCode] as const,
    queryFn: () => fetchRoleMenuAccess(roleCode!),
    enabled: !!roleCode,
  });
};

/**
 * 권한별 메뉴 접근 권한 저장 훅
 */
export const useSaveRoleMenuAccess = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      roleCode,
      menuCodes,
      accessMode = 'READ',
    }: {
      roleCode: string;
      menuCodes: string[];
      accessMode?: 'READ' | 'WRITE';
    }) => saveRoleMenuAccess(roleCode, menuCodes, accessMode),
    onSuccess: (_, variables) => {
      // 해당 권한의 메뉴 접근 정보 무효화
      queryClient.invalidateQueries({
        queryKey: [...screenPermissionKeys.all, 'roleMenuAccess', variables.roleCode],
      });
    },
  });
};
