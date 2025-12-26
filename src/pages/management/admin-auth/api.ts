import { getApi, postApi } from '@/utils/apiUtils';
import { API_ENDPOINTS } from '@/constants/endpoints';
import { addRowNumber } from '@/utils/dataUtils';
import type { UserAccountApiItem, RowItem } from './types';
import type { ApiMeta } from '@/utils/apiUtils';

/**
 * API 응답 데이터를 RowItem으로 변환
 */
const transformToRowItem = (
  apiItem: UserAccountApiItem,
  index: number,
  totalElements: number
): RowItem => {
  // 부서명 조합 (1차 / 2차)
  const deptName = [apiItem.deptName1, apiItem.deptName2].filter(Boolean).join(' / ');

  return {
    no: totalElements - index, // 역순 번호
    kcUserId: apiItem.kcUserId,
    username: apiItem.username,
    email: apiItem.email,
    empNo: apiItem.empNo || '',
    empName: apiItem.empName || '',
    deptName,
    roleCodes: apiItem.roleCodes || [],
    isActive: apiItem.isActive,
  };
};

/**
 * 사용자 목록 조회
 * API spec: GET /api/v1/users
 */
export const fetchAdminAuthList = async (params?: {
  page?: number;
  size?: number;
  keyword?: string;
  includeInactive?: boolean;
}): Promise<{ items: RowItem[]; meta: ApiMeta | null }> => {
  const { page = 1, size = 20, keyword, includeInactive = false } = params || {};

  const response = await getApi<UserAccountApiItem[]>(API_ENDPOINTS.ADMIN_AUTH.LIST, {
    params: {
      page,
      size,
      ...(keyword && { keyword }),
      includeInactive,
    },
    errorMessage: '관리자 사용자 목록을 불러오지 못했습니다.',
  });

  const items = Array.isArray(response.data) ? response.data : [];
  const totalElements = response.meta?.totalElements || items.length;

  const rowItems = items.map((item, index) => transformToRowItem(item, index, totalElements));

  return {
    items: rowItems,
    meta: response.meta || null,
  };
};

/**
 * 사용자 등록/수정 (그리드 저장)
 * API spec: POST /api/v1/users/bulk-save
 */
export const bulkSaveUsers = async (
  items: RowItem[]
): Promise<{
  createdCount: number;
  updatedCount: number;
  kcUserIds: number[];
}> => {
  const payload = {
    items: items.map((item) => ({
      kcUserId: item.kcUserId || null, // null이면 생성, 있으면 수정
      username: item.username,
      email: item.email,
      empNo: item.empNo,
      isActive: item.isActive,
      roleCodes: item.roleCodes,
      // oidcSub, hrEmployeeId 등은 백엔드에서 처리하거나 추가 필요시 받아야 함
    })),
  };

  const response = await postApi<{
    createdCount: number;
    updatedCount: number;
    kcUserIds: number[];
  }>(API_ENDPOINTS.ADMIN_AUTH.BULK_SAVE, payload, {
    errorMessage: '관리자 사용자 저장에 실패했습니다.',
  });

  return response.data;
};

/**
 * 사용자 선택 삭제 (비활성화)
 * API spec: POST /api/v1/users/bulk-remove
 */
export const bulkRemoveUsers = async (
  kcUserIds: number[]
): Promise<{ deactivatedCount: number }> => {
  const response = await postApi<{ deactivatedCount: number }>(
    API_ENDPOINTS.ADMIN_AUTH.BULK_REMOVE,
    { kcUserIds },
    {
      errorMessage: '관리자 사용자 삭제에 실패했습니다.',
    }
  );

  return response.data;
};
