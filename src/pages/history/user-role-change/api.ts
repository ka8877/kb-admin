import { getApi } from '@/utils/apiUtils';
import { API_ENDPOINTS } from '@/constants/endpoints';
import type { UserRoleChangeItem } from './type';

const transformItem = (
  v: Partial<UserRoleChangeItem> & Record<string, unknown>,
  options: { index: number; fallbackId?: string | number },
): UserRoleChangeItem => {
  const { index, fallbackId } = options;

  let historyId: string | number = index + 1;
  if (v.historyId !== undefined && v.historyId !== null) {
    historyId = v.historyId;
  } else if (v.history_id !== undefined && v.history_id !== null) {
    historyId = v.history_id as string | number;
  } else if (fallbackId !== undefined && fallbackId !== null) {
    historyId = fallbackId;
  }

  return {
    no: v.no ?? index + 1,
    historyId,
    kcUserId: v.kcUserId ?? (v.kc_user_id as string) ?? '',
    roleId: v.roleId ?? (v.role_id as string) ?? '',
    changeType: v.changeType ?? (v.change_type as string) ?? '',
    itsvcNo: v.itsvcNo ?? (v.itsvc_no as string) ?? '',
    reason: v.reason ?? '',
    beforeState: v.beforeState ?? (v.before_state as string) ?? '{}',
    afterState: v.afterState ?? (v.after_state as string) ?? '{}',
    changedBy: v.changedBy ?? (v.changed_by as string) ?? '',
    changedAt: v.changedAt ?? (v.changed_at as string) ?? '',
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

export interface FetchUserRoleChangesParams {
  page?: number;
  pageSize?: number;
  searchParams?: Record<string, string | number>;
}

export const fetchUserRoleChanges = async (
  params?: FetchUserRoleChangesParams,
): Promise<UserRoleChangeItem[]> => {
  const { page = 0, pageSize = 20, searchParams = {} } = params || {};

  console.log('🔍 사용자 역할 변경 이력 조회 파라미터:', {
    page,
    pageSize,
    searchParams,
  });

  const response = await getApi(API_ENDPOINTS.USER_ROLE_CHANGE.LIST);
  return transformUserRoleChanges(response.data);
};
