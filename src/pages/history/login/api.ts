import { getApi } from '@/utils/apiUtils';
import { API_ENDPOINTS } from '@/constants/endpoints';
import type { UserLoginItem } from './type';

const transformItem = (
  v: Partial<UserLoginItem> & Record<string, unknown>,
  options: { index: number; fallbackId?: string | number },
): UserLoginItem => {
  const { index, fallbackId } = options;

  return {
    no: v.no ?? index + 1,
    loginHistoryId:
      v.loginHistoryId ?? (v.login_history_id as string) ?? String(fallbackId ?? index + 1),
    kcUserId: v.kcUserId ?? (v.kc_user_id as string) ?? '',
    loginAt: v.loginAt ?? (v.login_at as string) ?? '',
    logoutAt: v.logoutAt ?? (v.logout_at as string) ?? null,
    loginIp: v.loginIp ?? (v.login_ip as string) ?? '',
    logoutIp: v.logoutIp ?? (v.logout_ip as string) ?? null,
    userAgent: v.userAgent ?? (v.user_agent as string) ?? null,
    result: v.result ?? '',
    failReason: v.failReason ?? (v.fail_reason as string) ?? null,
  };
};

const transformUserLogins = (raw: unknown): UserLoginItem[] => {
  if (!raw) return [];

  if (Array.isArray(raw)) {
    return raw
      .map((item, index) => {
        if (!item) return null;
        const v = item as Partial<UserLoginItem> & Record<string, unknown>;
        return transformItem(v, { index });
      })
      .filter((item): item is UserLoginItem => item !== null);
  }

  if (typeof raw === 'object' && raw !== null) {
    const entries = Object.entries(raw as Record<string, unknown>);
    return entries.map(([key, value], index) => {
      const v = value as Partial<UserLoginItem> & Record<string, unknown>;
      return transformItem(v, { index, fallbackId: key });
    });
  }

  return [];
};

export interface FetchUserLoginsParams {
  page?: number;
  pageSize?: number;
  searchParams?: Record<string, string | number>;
}

export const fetchUserLogins = async (params?: FetchUserLoginsParams): Promise<UserLoginItem[]> => {
  const { page = 0, pageSize = 20, searchParams = {} } = params || {};

  console.log('🔍 로그인 이력 조회 파라미터:', {
    page,
    pageSize,
    searchParams,
  });

  const response = await getApi(API_ENDPOINTS.USER_LOGIN.LIST);
  return transformUserLogins(response.data);
};
