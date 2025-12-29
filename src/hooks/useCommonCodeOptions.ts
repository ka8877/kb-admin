import { useQuery } from '@tanstack/react-query';
import { getApi } from '@/utils/apiUtils';
import { API_ENDPOINTS } from '@/constants/endpoints';
import { CommonCodeItem } from '@/types/types';
import { convertCommonCodeToOptions } from '@/utils/dataUtils';

export type CommonCodeOption = {
  label: string;
  value: string;
};

/**
 * 공통 코드 옵션 목록 조회 API
 * @param groupCode - 조회할 그룹 코드 (예: "serviceNm")
 * @param useCodeNameAsValue - value에 codeName을 사용할지 여부 (기본값: false)
 * @returns 옵션 목록 { label, value }[]
 */
export const fetchCommonCodeItems = async (
  groupCode: string | number,
  useCodeNameAsValue: boolean = false
): Promise<CommonCodeOption[]> => {
  const response = await getApi<CommonCodeItem[]>(
    API_ENDPOINTS.COMMON_CODE.CODE_ITEMS(String(groupCode)),
    {
      params: { includeInactive: false },
      errorMessage: '공통 코드 목록을 불러오지 못했습니다.',
    }
  );

  if (Array.isArray(response.data)) {
    return convertCommonCodeToOptions(response.data, useCodeNameAsValue);
  }
  return [];
};

/**
 * 공통 코드 옵션 목록 조회 훅
 * @param groupCode - 조회할 그룹 코드 (예: "serviceNm")
 * @param useCodeNameAsValue - value에 codeName을 사용할지 여부 (기본값: false)
 * @returns useQuery 결과
 */
export const useCommonCodeOptions = (
  groupCode: string | number,
  useCodeNameAsValue: boolean = false
) => {
  return useQuery({
    queryKey: ['commonCodeItems', groupCode, useCodeNameAsValue],
    queryFn: () => fetchCommonCodeItems(groupCode, useCodeNameAsValue),
    staleTime: 1000 * 60 * 5, // 5분간 캐시 유지
  });
};
