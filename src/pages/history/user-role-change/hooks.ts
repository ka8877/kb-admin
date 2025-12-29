import { useQuery } from '@tanstack/react-query';
import { userRoleChangeKeys } from '@/constants/queryKey';
import { fetchUserRoleChanges } from './api';
import { FetchListParams } from '@/types/types';
import { useMemo } from 'react';
import { getApi } from '@/utils/apiUtils';
import { API_ENDPOINTS } from '@/constants/endpoints';
import type { SearchField } from '@/types/types';
import { KC_USER_ID, ITSVC_NO, CHANGE_TYPE, changeTypeOptions, ROLE_CODE } from './data';

export const useUserRoleChanges = (params?: FetchListParams) => {
  return useQuery({
    queryKey: userRoleChangeKeys.list(params),
    queryFn: () => fetchUserRoleChanges(params),
  });
};

/**
 * Role 타입 정의
 */
interface Role {
  roleId: number;
  roleCode: string;
  roleName: string;
  isActive: boolean;
}

/**
 * Roles API 호출 함수
 */
const fetchRoles = async (): Promise<{ label: string; value: string }[]> => {
  try {
    const response = await getApi<Role[]>(API_ENDPOINTS.ROLES.LIST, {
      params: { includeInactive: false },
    });

    if (Array.isArray(response.data)) {
      return response.data.map((role) => ({
        label: role.roleName,
        value: role.roleCode,
      }));
    }
    return [];
  } catch (error) {
    console.error('권한 목록 조회 실패:', error);
    return [];
  }
};

/**
 * 검색 필드 설정을 반환하는 커스텀 훅
 */
export const useSearchFields = (): SearchField[] => {
  const { data: roleOptions = [] } = useQuery({
    queryKey: ['roles'],
    queryFn: fetchRoles,
    staleTime: 1000 * 60 * 5,
  });

  return useMemo(
    () => [
      {
        type: 'textGroup',
        fields: [
          { field: 'username', label: '사용자명' },
          { field: 'empNo', label: '사번' },
          { field: ITSVC_NO, label: 'IT서비스 번호' },
        ],
      },
      {
        field: ROLE_CODE,
        label: '권한',
        type: 'select',
        options: roleOptions,
      },
      {
        field: CHANGE_TYPE,
        label: '변경 유형',
        type: 'select',
        options: changeTypeOptions,
      },
      {
        field: 'fromAt',
        dataField: 'fromAt',
        label: '조회 시작일시',
        type: 'dateRange',
        position: 'start',
      },
      {
        field: 'toAt',
        dataField: 'toAt',
        label: '조회 종료일시',
        type: 'dateRange',
        position: 'end',
      },
    ],
    [roleOptions],
  );
};
