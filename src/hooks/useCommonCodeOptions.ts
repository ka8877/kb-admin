import { useQuery } from '@tanstack/react-query';
import { getApi } from '@/utils/apiUtils';
import { API_ENDPOINTS } from '@/constants/endpoints';
import { CODE_GRUOP_ID_SERVICE_NM } from '@/constants/options';

/**
 * 공통 코드 아이템 목록 조회 API
 */
const fetchCommonCodeItems = async () => {
  const response = await getApi<any>(API_ENDPOINTS.COMMON_CODE.CODE_ITEMS, {
    errorMessage: '공통 코드 목록을 불러오지 못했습니다.',
  });

  if (Array.isArray(response.data)) {
    return response.data;
  } else if (typeof response.data === 'object' && response.data !== null) {
    return Object.values(response.data);
  }
  return [];
};

/**
 * 공통 코드 아이템 목록 조회 훅 (특정 그룹 ID 필터링)
 * @param codeGroupId - 조회할 코드 그룹 ID
 * @param useCodeAsValue - value에 code를 사용할지 여부 (기본값: true)
 * @returns useQuery 결과 (data: 필터링된 코드 아이템 옵션 목록 { label, value })
 */
export const useCommonCodeOptions = (
  codeGroupId: string | number,
  useCodeAsValue: boolean = false,
) => {
  return useQuery({
    queryKey: ['commonCodeItems', codeGroupId, useCodeAsValue],
    queryFn: fetchCommonCodeItems,
    select: (items: any[]) => {
      const targetGroupId = String(codeGroupId);

      return items
        .filter(
          (item: any) =>
            item && String(item.code_group_id) === targetGroupId && Number(item.is_active) === 1,
        )
        .map((item: any) => ({
          label: item.code_name || '',
          value: useCodeAsValue ? item.code || '' : item.code_name || '',
        }))
        .filter((item) => item.label && item.value)
        .sort((a, b) => a.label.localeCompare(b.label));
    },
    staleTime: 1000 * 60 * 5, // 5분간 캐시 유지
  });
};
