import { getApi } from '@/utils/apiUtils';
import { API_ENDPOINTS } from '@/constants/endpoints';
import type { UserLoginItem } from './type';

const transformItem = (
  v: Partial<UserLoginItem> & Record<string, any>,
  options: { index: number; fallbackId?: string | number },
): UserLoginItem => {
  const { index, fallbackId } = options;

  return {
    no: v.no ?? index + 1,
    loginHistoryId: v.loginHistoryId ?? v.login_history_id ?? String(fallbackId ?? index + 1),
    kcUserId: v.kcUserId ?? v.kc_user_id ?? '',
    loginAt: v.loginAt ?? v.login_at ?? '',
    logoutAt: v.logoutAt ?? v.logout_at ?? null,
    loginIp: v.loginIp ?? v.login_ip ?? '',
    logoutIp: v.logoutIp ?? v.logout_ip ?? null,
    userAgent: v.userAgent ?? v.user_agent ?? null,
    result: v.result ?? '',
    failReason: v.failReason ?? v.fail_reason ?? null,
  };
};

const transformUserLogins = (raw: unknown): UserLoginItem[] => {
  if (!raw) return [];

  if (Array.isArray(raw)) {
    return raw
      .map((item, index) => {
        if (!item) return null;
        const v = item as Partial<UserLoginItem> & Record<string, any>;
        return transformItem(v, { index });
      })
      .filter((item): item is UserLoginItem => item !== null);
  }

  if (typeof raw === 'object' && raw !== null) {
    const entries = Object.entries(raw as Record<string, unknown>) as [string, any][];
    return entries.map(([key, value], index) => {
      const v = value as Partial<UserLoginItem> & Record<string, any>;
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
