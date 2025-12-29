import { getApi, type ApiMeta } from '@/utils/apiUtils';
import { API_ENDPOINTS } from '@/constants/endpoints';
import type { UserRoleChangeItem } from './type';
import { FetchListParams } from '@/types/types';
import {
  NO,
  HISTORY_ID,
  KC_USER_ID,
  USERNAME,
  EMP_NO,
  EMP_NAME,
  ROLE_ID,
  ROLE_CODE,
  ROLE_NAME,
  CHANGE_TYPE,
  ITSVC_NO,
  REASON,
  BEFORE_STATE,
  AFTER_STATE,
  CHANGED_BY,
  CHANGED_BY_USERNAME,
  CHANGED_AT,
} from './data';

const transformItem = (
  v: Partial<UserRoleChangeItem> & Record<string, unknown>,
  options: { index: number; fallbackId?: string | number },
): UserRoleChangeItem => {
  const { index, fallbackId } = options;

  return {
    [NO]: v[NO] ?? index + 1,
    [HISTORY_ID]: Number(v[HISTORY_ID] ?? fallbackId ?? index + 1),
    [KC_USER_ID]: Number(v[KC_USER_ID] ?? 0),
    [USERNAME]: (v[USERNAME] as string) ?? '',
    [EMP_NO]: (v[EMP_NO] as string) ?? '',
    [EMP_NAME]: (v[EMP_NAME] as string) ?? '',
    [ROLE_ID]: Number(v[ROLE_ID] ?? 0),
    [ROLE_CODE]: (v[ROLE_CODE] as string) ?? '',
    [ROLE_NAME]: (v[ROLE_NAME] as string) ?? '',
    [CHANGE_TYPE]: (v[CHANGE_TYPE] as string) ?? '',
    [ITSVC_NO]: (v[ITSVC_NO] as string) ?? '',
    [REASON]: (v[REASON] as string) ?? '',
    [BEFORE_STATE]: (v[BEFORE_STATE] as string) ?? '{}',
    [AFTER_STATE]: (v[AFTER_STATE] as string) ?? '{}',
    [CHANGED_BY]: Number(v[CHANGED_BY] ?? 0),
    [CHANGED_BY_USERNAME]: (v[CHANGED_BY_USERNAME] as string) ?? '',
    [CHANGED_AT]: (v[CHANGED_AT] as string) ?? '',
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
