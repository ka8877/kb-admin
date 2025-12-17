import { getApi, postApi, putApi, deleteApi } from '@/utils/apiUtils';
import { API_ENDPOINTS } from '@/constants/endpoints';
import { env } from '@/config';
import type { PermissionItem } from './types';

const baseURL = env.testURL;

type FirebasePermission = {
  permission_id: string;
  permission_name: string;
  status?: '활성' | '비활성';
  is_active?: number;
  created_at?: string;
  updated_at?: string;
};

const normalize = (id: string, data: FirebasePermission): PermissionItem => {
  const status = data.status ?? (data.is_active === 0 ? '비활성' : '활성');
  return {
    id,
    permission_id: data.permission_id,
    permission_name: data.permission_name,
    status,
    created_at: data.created_at,
    updated_at: data.updated_at,
  };
};

export const fetchPermissions = async (): Promise<PermissionItem[]> => {
  const res = await getApi<Record<string, FirebasePermission>>(API_ENDPOINTS.PERMISSION.LIST, {
    baseURL,
    errorMessage: '권한 목록을 불러오지 못했습니다.',
  });

  if (!res.data || typeof res.data !== 'object') return [];
  return Object.entries(res.data).map(([key, value]) => normalize(key, value));
};

export const createPermission = async (
  payload: Omit<PermissionItem, 'id' | 'created_at' | 'updated_at'>,
): Promise<PermissionItem> => {
  const now = new Date().toISOString();
  const body: FirebasePermission = {
    permission_id: payload.permission_id,
    permission_name: payload.permission_name,
    status: payload.status,
    is_active: payload.status === '활성' ? 1 : 0,
    created_at: now,
    updated_at: now,
  };

  const res = await postApi<{ name: string }>(API_ENDPOINTS.PERMISSION.CREATE, body, {
    baseURL,
    errorMessage: '권한 생성에 실패했습니다.',
  });

  const id = res.data?.name ?? payload.permission_id;
  return normalize(id, body);
};

export const updatePermission = async (
  id: string | number,
  payload: Partial<PermissionItem>,
): Promise<PermissionItem> => {
  const now = new Date().toISOString();
  const body: Partial<FirebasePermission> = {
    permission_name: payload.permission_name,
    status: payload.status,
    is_active: payload.status === '활성' ? 1 : payload.status === '비활성' ? 0 : undefined,
    updated_at: now,
  };

  await putApi(API_ENDPOINTS.PERMISSION.UPDATE(id as number), body, {
    baseURL,
    errorMessage: '권한 수정에 실패했습니다.',
  });

  // 읽기 전용 필드는 호출자 상태 기반으로 반환
  return {
    id,
    permission_id: payload.permission_id || '',
    permission_name: payload.permission_name || '',
    status: payload.status ?? '활성',
    created_at: payload.created_at,
    updated_at: now,
  };
};

export const deletePermission = async (id: string | number): Promise<void> => {
  await deleteApi(API_ENDPOINTS.PERMISSION.DELETE(id as number), {
    baseURL,
    errorMessage: '권한 삭제에 실패했습니다.',
  });
};
