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
  options: { index: number; fallbackId?: string | number }
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
    return raw.map((v, i) =>
      transformItem(v as Partial<DataChangeItem> & Record<string, unknown>, { index: i })
    );
  }
  if (
    typeof raw === 'object' &&
    raw !== null &&
    'content' in raw &&
    Array.isArray((raw as { content: unknown[] }).content)
  ) {
    return (raw as { content: unknown[] }).content.map((v, i) =>
      transformItem(v as Partial<DataChangeItem> & Record<string, unknown>, { index: i })
    );
  }
  return [];
};

export const getDataChanges = async (
  params: FetchListParams
): Promise<{ items: DataChangeItem[]; meta: ApiMeta }> => {
  const { page = 0, size = 20, searchParams } = params;
  const queryParams = new URLSearchParams({
    page: page.toString(),
    size: size.toString(),
    ...searchParams,
  });

  type PageResponse = {
    content: DataChangeItem[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
  };

  const response = await getApi<PageResponse>(
    `${API_ENDPOINTS.AUDIT_LOG.LIST}?${queryParams.toString()}`
  );

  const pageData = response.data;
  const items = transformDataChanges(pageData);

  return {
    items,
    meta: {
      totalElements: pageData?.totalElements || 0,
      page: pageData?.number || 0,
      size: pageData?.size || 20,
      totalPages: pageData?.totalPages || 0,
    },
  };
};
