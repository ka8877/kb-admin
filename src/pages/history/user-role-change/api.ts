import { getApi, type ApiMeta } from '@/utils/apiUtils';
import { API_ENDPOINTS } from '@/constants/endpoints';
import type { UserRoleChangeItem } from './type';
import { FetchListParams } from '@/types/types';
import {
  NO,
  HISTORY_ID,
  KC_USER_ID,
  ROLE_ID,
  CHANGE_TYPE,
  ITSVC_NO,
  REASON,
  BEFORE_STATE,
  AFTER_STATE,
  CHANGED_BY,
  CHANGED_AT,
} from './data';

const transformItem = (
  v: Partial<UserRoleChangeItem> & Record<string, unknown>,
  options: { index: number; fallbackId?: string | number },
): UserRoleChangeItem => {
  const { index, fallbackId } = options;

  let historyId: string | number = index + 1;
  if (v[HISTORY_ID] !== undefined && v[HISTORY_ID] !== null) {
    historyId = v[HISTORY_ID] as string | number;
  } else if (fallbackId !== undefined && fallbackId !== null) {
    historyId = fallbackId;
  }

  return {
    [NO]: v[NO] ?? index + 1,
    [HISTORY_ID]: historyId,
    [KC_USER_ID]: v[KC_USER_ID] ?? '',
    [ROLE_ID]: v[ROLE_ID] ?? '',
    [CHANGE_TYPE]: v[CHANGE_TYPE] ?? '',
    [ITSVC_NO]: v[ITSVC_NO] ?? '',
    [REASON]: v[REASON] ?? '',
    [BEFORE_STATE]: v[BEFORE_STATE] ?? '{}',
    [AFTER_STATE]: v[AFTER_STATE] ?? '{}',
    [CHANGED_BY]: v[CHANGED_BY] ?? '',
    [CHANGED_AT]: v[CHANGED_AT] ?? '',
  };
};

const transformUserRoleChanges = (raw: unknown): UserRoleChangeItem[] => {
  if (!raw) return [];

  if (Array.isArray(raw)) {
    return raw
      .map((item, index) => {
        if (!item) return null;
        const v = item as Partial<UserRoleChangeItem> & Record<string, unknown>;
        return transformItem(v, { index });
      })
      .filter((item): item is UserRoleChangeItem => item !== null);
  }

  if (typeof raw === 'object' && raw !== null) {
    const entries = Object.entries(raw as Record<string, unknown>);
    return entries.map(([key, value], index) => {
      const v = value as Partial<UserRoleChangeItem> & Record<string, unknown>;
      return transformItem(v, { index, fallbackId: key });
    });
  }

  return [];
};

export const fetchUserRoleChanges = async (
  params?: FetchListParams,
): Promise<{ items: UserRoleChangeItem[]; meta: ApiMeta | null }> => {
  const { page = 1, size = 20, searchParams = {} } = params || {};

  const apiParams = {
    page,
    size,
    ...searchParams,
  };

  const response = await getApi(API_ENDPOINTS.USER_ROLE_CHANGE.LIST, {
    params: apiParams,
  });

  const items = transformUserRoleChanges(response.data);

  return {
    items,
    meta: response.meta || null,
  };
};
