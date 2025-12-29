import { getApi, postApi } from '@/utils/apiUtils';
import { API_ENDPOINTS } from '@/constants/endpoints';
import type { PermissionItem, RoleApiItem } from './types';

/**
 * API 응답을 화면 표시용 타입으로 변환
 */
const transformToPermissionItem = (apiItem: RoleApiItem): PermissionItem => {
  return {
    id: apiItem.roleId,
    permission_id: apiItem.roleCode,
    permission_name: apiItem.roleName,
    status: apiItem.isActive ? '활성' : '비활성',
  };
};

/**
 * 권한(Role) 목록 조회
 * API spec: GET /api/v1/roles
 */
export const fetchPermissions = async (params?: {
  includeInactive?: boolean;
}): Promise<PermissionItem[]> => {
  const { includeInactive = false } = params || {};

  const response = await getApi<RoleApiItem[]>(API_ENDPOINTS.PERMISSION.LIST, {
    params: {
      includeInactive,
    },
    errorMessage: '권한 목록을 불러오지 못했습니다.',
  });

  const items = Array.isArray(response.data) ? response.data : [];
  return items.map(transformToPermissionItem);
};

/**
 * 권한(Role) 생성
 * API spec: POST /api/v1/roles
 */
export const createPermission = async (
  payload: Omit<PermissionItem, 'id' | 'created_at' | 'updated_at'>
): Promise<PermissionItem> => {
  const body = {
    roleCode: payload.permission_id,
    roleName: payload.permission_name,
    isActive: payload.status === '활성',
  };

  const response = await postApi<RoleApiItem>(API_ENDPOINTS.PERMISSION.CREATE, body, {
    errorMessage: '권한 생성에 실패했습니다.',
  });

  return transformToPermissionItem(response.data);
};

/**
 * 권한(Role) 수정
 * API spec: POST /api/v1/roles/{roleId}
 */
export const updatePermission = async (
  id: string | number,
  payload: Partial<PermissionItem>
): Promise<PermissionItem> => {
  const body = {
    roleName: payload.permission_name!,
    isActive: payload.status === '활성',
  };

  const response = await postApi<RoleApiItem>(API_ENDPOINTS.PERMISSION.UPDATE(Number(id)), body, {
    errorMessage: '권한 수정에 실패했습니다.',
  });

  return transformToPermissionItem(response.data);
};

/**
 * 권한(Role) 비활성화
 * API spec: POST /api/v1/roles/{roleId}/deactivate
 */
export const deletePermission = async (id: string | number): Promise<void> => {
  await postApi(
    API_ENDPOINTS.PERMISSION.DEACTIVATE(Number(id)),
    {},
    {
      errorMessage: '권한 비활성화에 실패했습니다.',
    }
  );
};
