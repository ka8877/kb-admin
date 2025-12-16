import { getApi, postApi, putApi, deleteApi } from '@/utils/apiUtils';
import { API_ENDPOINTS } from '@/constants/endpoints';
import { env } from '@/config';
import type { AdminAuthItem, RowItem } from './types';

const baseURL = env.testURL;

type FirebaseAdminAuth = Omit<AdminAuthItem, 'id'> & {
  created_at?: string;
  updated_at?: string;
};

const normalize = (firebaseKey: string, data: FirebaseAdminAuth, idx: number): RowItem => ({
  id: firebaseKey,
  no: idx + 1,
  user_name: data.user_name,
  position: data.position,
  team_1st: data.team_1st,
  team_2nd: data.team_2nd,
  use_permission: data.use_permission,
  approval_permission: data.approval_permission,
  status: data.status,
});

export const fetchAdminAuthList = async (): Promise<RowItem[]> => {
  const res = await getApi<Record<string, FirebaseAdminAuth>>(API_ENDPOINTS.ADMIN_AUTH.LIST, {
    baseURL,
    errorMessage: '관리자 사용자 목록을 불러오지 못했습니다.',
  });

  if (!res.data || typeof res.data !== 'object') return [];
  return Object.entries(res.data).map(([key, value], idx) => normalize(key, value, idx));
};

export const createAdminAuth = async (
  payload: Omit<AdminAuthItem, 'id'>,
): Promise<AdminAuthItem> => {
  const now = new Date().toISOString();
  const body: FirebaseAdminAuth = { ...payload, created_at: now, updated_at: now };
  const res = await postApi<{ name: string }>(API_ENDPOINTS.ADMIN_AUTH.CREATE, body, {
    baseURL,
    errorMessage: '관리자 사용자 생성에 실패했습니다.',
  });

  return { ...payload, id: res.data?.name ?? payload.user_name } as AdminAuthItem;
};

export const updateAdminAuth = async (
  id: string | number,
  payload: Partial<AdminAuthItem>,
): Promise<void> => {
  const now = new Date().toISOString();
  const body: Partial<FirebaseAdminAuth> = { ...payload, updated_at: now };
  await putApi(API_ENDPOINTS.ADMIN_AUTH.UPDATE(id), body, {
    baseURL,
    errorMessage: '관리자 사용자 수정에 실패했습니다.',
  });
};

export const deleteAdminAuth = async (id: string | number): Promise<void> => {
  await deleteApi(API_ENDPOINTS.ADMIN_AUTH.DELETE(id), {
    baseURL,
    errorMessage: '관리자 사용자 삭제에 실패했습니다.',
  });
};
