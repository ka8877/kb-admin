import { getApi } from '@/utils/apiUtils';
import { API_ENDPOINTS } from '@/constants/endpoints';
import type { UserLoginItem } from './type';
import {
  NO,
  LOGIN_HISTORY_ID,
  KC_USER_ID,
  LOGIN_AT,
  LOGOUT_AT,
  LOGIN_IP,
  LOGOUT_IP,
  USER_AGENT,
  RESULT,
  FAIL_REASON,
} from './data';

const transformItem = (
  v: Partial<UserLoginItem> & Record<string, unknown>,
  options: { index: number; fallbackId?: string | number },
): UserLoginItem => {
  const { index, fallbackId } = options;

  return {
    [NO]: v[NO] ?? index + 1,
    [LOGIN_HISTORY_ID]:
      v[LOGIN_HISTORY_ID] ?? (v[LOGIN_HISTORY_ID] as string) ?? String(fallbackId ?? index + 1),
    [KC_USER_ID]: v[KC_USER_ID] ?? (v[KC_USER_ID] as string) ?? '',
    [LOGIN_AT]: v[LOGIN_AT] ?? (v[LOGIN_AT] as string) ?? '',
    [LOGOUT_AT]: v[LOGOUT_AT] ?? (v[LOGOUT_AT] as string) ?? null,
    [LOGIN_IP]: v[LOGIN_IP] ?? (v[LOGIN_IP] as string) ?? '',
    [LOGOUT_IP]: v[LOGOUT_IP] ?? (v[LOGOUT_IP] as string) ?? null,
    [USER_AGENT]: v[USER_AGENT] ?? (v[USER_AGENT] as string) ?? null,
    [RESULT]: v[RESULT] ?? '',
    [FAIL_REASON]: v[FAIL_REASON] ?? (v[FAIL_REASON] as string) ?? null,
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
  size?: number;
  searchParams?: Record<string, string | number>;
}

export const fetchUserLogins = async (params?: FetchUserLoginsParams): Promise<UserLoginItem[]> => {
  const { page = 0, size = 20, searchParams = {} } = params || {};

  console.log('🔍 로그인 이력 조회 파라미터:', {
    page,
    size,
    searchParams,
  });

  const response = await getApi(API_ENDPOINTS.USER_LOGIN.LIST);
  return transformUserLogins(response.data);
};
