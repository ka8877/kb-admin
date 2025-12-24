import { getApi, type ApiMeta } from '@/utils/apiUtils';
import { API_ENDPOINTS } from '@/constants/endpoints';
import type { DataChangeItem } from './type';
import { FetchListParams } from '@/types/types';
import {
  NO,
  AUDIT_LOG_ID,
  ACTED_AT,
  TABLE_NAME,
  PK_VALUE,
  OPERATION,
  DB_USER,
  BEFORE_DATA,
  AFTER_DATA,
} from './data';

const transformItem = (
  v: Partial<DataChangeItem> & Record<string, unknown>,
  options: { index: number; fallbackId?: string | number },
): DataChangeItem => {
  const { index, fallbackId } = options;

  let auditLogId: string | number = index + 1;
  if (v[AUDIT_LOG_ID] !== undefined && v[AUDIT_LOG_ID] !== null) {
    auditLogId = v[AUDIT_LOG_ID] as string | number;
  } else if (fallbackId !== undefined && fallbackId !== null) {
    auditLogId = fallbackId;
  }

  return {
    [NO]: v[NO] ?? index + 1,
    [AUDIT_LOG_ID]: auditLogId,
    [ACTED_AT]: (v[ACTED_AT] as string) ?? '',
    [TABLE_NAME]: (v[TABLE_NAME] as string) ?? '',
    [PK_VALUE]: (v[PK_VALUE] as string) ?? '',
    [OPERATION]: (v[OPERATION] as string) ?? '',
    [DB_USER]: (v[DB_USER] as string) ?? '',
    [BEFORE_DATA]: (v[BEFORE_DATA] as string) ?? '{}',
    [AFTER_DATA]: (v[AFTER_DATA] as string) ?? '{}',
  };
};

const transformDataChanges = (raw: unknown): DataChangeItem[] => {
  if (!raw) return [];

  if (Array.isArray(raw)) {
    return raw
      .map((item, index) => {
        if (!item) return null;
        const v = item as Partial<DataChangeItem> & Record<string, unknown>;
        return transformItem(v, { index });
      })
      .filter((item): item is DataChangeItem => item !== null);
  }

  if (typeof raw === 'object' && raw !== null) {
    const entries = Object.entries(raw as Record<string, unknown>);
    return entries.map(([key, value], index) => {
      const v = value as Partial<DataChangeItem> & Record<string, unknown>;
      return transformItem(v, { index, fallbackId: key });
    });
  }

  return [];
};

export const getDataChanges = async (
  params?: FetchListParams,
): Promise<{ items: DataChangeItem[]; meta: ApiMeta | null }> => {
  const { page = 1, size = 20, searchParams = {} } = params || {};

  const apiParams = {
    page,
    size,
    ...searchParams,
  };

  const response = await getApi(API_ENDPOINTS.AUDIT_LOG.LIST, {
    params: apiParams,
  });

  const items = transformDataChanges(response.data);

  return {
    items,
    meta: response.meta || null,
  };
};
