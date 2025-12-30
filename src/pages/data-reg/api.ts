import { getApi, postApi } from '@/utils/apiUtils';
import type { ApprovalRequestItem } from '@/types/types';
import {
  NO,
  APPROVAL_REQUEST_ID,
  TARGET_TYPE,
  TARGET_ID,
  ITSVC_NO,
  REQUEST_KIND,
  APPROVAL_STATUS,
  PAYLOAD_BEFORE,
  PAYLOAD_AFTER,
  REQUESTER_NAME,
  REQUESTER_DEPT_NAME,
  LAST_ACTOR_NAME,
  REQUESTED_AT,
  LAST_UPDATED_AT,
  IS_RETRACTED,
  IS_APPLIED,
  APPLIED_AT,
} from '@/constants/label';
import { TOAST_MESSAGES } from '@/constants/message';
import { APPROVAL_CONFIGS, ApprovalPageType } from './config';

export type { ApprovalPageType };

/**
 * Firebase 응답 데이터를 ApprovalRequestItem으로 변환하는 함수
 */
const transformApprovalRequests = (raw: unknown): ApprovalRequestItem[] => {
  if (!raw) return [];

  // 배열 형태 응답: [null, { ... }, { ... }]
  if (Array.isArray(raw)) {
    return raw
      .map((item, index): ApprovalRequestItem | null => {
        if (!item) return null;
        const v = item as Partial<ApprovalRequestItem> & Record<string, unknown>;
        return {
          [NO]: (v[NO] as number) ?? index + 1,
          [APPROVAL_REQUEST_ID]:
            (v[APPROVAL_REQUEST_ID] as string | number) ?? (v.id as string | number) ?? index + 1,
          [TARGET_TYPE]: (v[TARGET_TYPE] as string) ?? '',
          [TARGET_ID]: Number(v[TARGET_ID] ?? 0),
          [ITSVC_NO]: (v[ITSVC_NO] as string | null) ?? null,
          [REQUEST_KIND]: (v[REQUEST_KIND] as string) ?? (v.approval_form as string) ?? '',
          [APPROVAL_STATUS]: (v[APPROVAL_STATUS] as string) ?? (v.status as string) ?? 'request',
          [PAYLOAD_BEFORE]: (v[PAYLOAD_BEFORE] as string | null) ?? null,
          [PAYLOAD_AFTER]: (v[PAYLOAD_AFTER] as string | null) ?? null,
          [REQUESTER_NAME]: (v[REQUESTER_NAME] as string | null) ?? (v.createdBy as string) ?? null,
          [REQUESTER_DEPT_NAME]: (v[REQUESTER_DEPT_NAME] as string | null) ?? null,
          [LAST_ACTOR_NAME]:
            (v[LAST_ACTOR_NAME] as string | null) ?? (v.updatedBy as string) ?? null,
          [REQUESTED_AT]: (v[REQUESTED_AT] as string) ?? (v.createdAt as string) ?? '',
          [LAST_UPDATED_AT]: (v[LAST_UPDATED_AT] as string) ?? (v.updatedAt as string) ?? '',
          [IS_RETRACTED]: Boolean(v[IS_RETRACTED]),
          [IS_APPLIED]: Boolean(v[IS_APPLIED]),
          [APPLIED_AT]: (v[APPLIED_AT] as string | null) ?? null,
        };
      })
      .filter((item): item is ApprovalRequestItem => item !== null);
  }

  // 객체 형태 응답도 지원 (기존 방식)
  if (typeof raw === 'object' && raw !== null) {
    const entries = Object.entries(raw as Record<string, unknown>);

    return entries.map(([key, value], index): ApprovalRequestItem => {
      const v = value as Partial<ApprovalRequestItem> & Record<string, unknown>;
      return {
        [NO]: (v[NO] as number) ?? index + 1,
        [APPROVAL_REQUEST_ID]:
          (v[APPROVAL_REQUEST_ID] as string | number) ?? (v.id as string | number) ?? key,
        [TARGET_TYPE]: (v[TARGET_TYPE] as string) ?? '',
        [TARGET_ID]: Number(v[TARGET_ID] ?? 0),
        [ITSVC_NO]: (v[ITSVC_NO] as string | null) ?? null,
        [REQUEST_KIND]: (v[REQUEST_KIND] as string) ?? (v.approval_form as string) ?? '',
        [APPROVAL_STATUS]: (v[APPROVAL_STATUS] as string) ?? (v.status as string) ?? 'request',
        [PAYLOAD_BEFORE]: (v[PAYLOAD_BEFORE] as string | null) ?? null,
        [PAYLOAD_AFTER]: (v[PAYLOAD_AFTER] as string | null) ?? null,
        [REQUESTER_NAME]: (v[REQUESTER_NAME] as string | null) ?? (v.createdBy as string) ?? null,
        [REQUESTER_DEPT_NAME]: (v[REQUESTER_DEPT_NAME] as string | null) ?? null,
        [LAST_ACTOR_NAME]: (v[LAST_ACTOR_NAME] as string | null) ?? (v.updatedBy as string) ?? null,
        [REQUESTED_AT]: (v[REQUESTED_AT] as string) ?? (v.createdAt as string) ?? '',
        [LAST_UPDATED_AT]: (v[LAST_UPDATED_AT] as string) ?? (v.updatedAt as string) ?? '',
        [IS_RETRACTED]: Boolean(v[IS_RETRACTED]),
        [IS_APPLIED]: Boolean(v[IS_APPLIED]),
        [APPLIED_AT]: (v[APPLIED_AT] as string | null) ?? null,
      };
    });
  }

  return [];
};

/**
 * 승인 요청 목록 조회 API
 */
export const fetchApprovalRequests = async (
  pageType: ApprovalPageType,
  searchParams?: Record<string, string | number>,
): Promise<ApprovalRequestItem[]> => {
  const config = APPROVAL_CONFIGS[pageType];
  if (!config) {
    throw new Error(`Unknown approval page type: ${pageType}`);
  }

  const response = await getApi<ApprovalRequestItem[]>(config.listEndpoint, {
    transform: transformApprovalRequests,
    errorMessage: '승인 요청 목록을 불러오지 못했습니다.',
    params: searchParams,
  });

  return response.data;
};

/**
 * 승인 요청 결재 (일괄)
 */
export const approveRequests = async (
  pageType: ApprovalPageType,
  selectedIds: (string | number)[],
): Promise<void> => {
  const config = APPROVAL_CONFIGS[pageType];
  if (!config) {
    throw new Error(`Unknown approval page type: ${pageType}`);
  }

  await postApi(config.listEndpoint, selectedIds, {
    successMessage: TOAST_MESSAGES.FINAL_APPROVAL_REQUESTED,
    errorMessage: TOAST_MESSAGES.FINAL_APPROVAL_PROCESS_FAILED,
  });
};

/**
 * 승인 요청 회수 (일괄)
 */
export const retractRequests = async (
  pageType: ApprovalPageType,
  selectedIds: (string | number)[],
): Promise<void> => {
  const config = APPROVAL_CONFIGS[pageType];
  if (!config) {
    throw new Error(`Unknown approval page type: ${pageType}`);
  }

  await postApi(`${config.listEndpoint}/retract`, selectedIds, {
    successMessage: TOAST_MESSAGES.RETRACT_SUCCESS,
    errorMessage: TOAST_MESSAGES.RETRACT_FAILED,
  });
};
