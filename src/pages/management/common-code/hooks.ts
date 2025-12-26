// 공통코드 관련 React Query 훅
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { commonCodeKeys } from '@/constants/queryKey';
import type { CodeGroupDisplay, CodeItemDisplay } from './types';
import {
  fetchCodeGroups,
  fetchCodeGroup,
  createCodeGroup,
  updateCodeGroup,
  deactivateCodeGroup,
  fetchCodeItems,
  fetchCodeItem,
  createCodeItem,
  updateCodeItem,
  deactivateCodeItem,
  bulkDeactivateCodeItems,
  reorderCodeItems,
  fetchServiceMappings,
  upsertServiceMapping,
  fetchQuestionMappings,
  upsertQuestionMapping,
  deleteMapping,
  type FetchCodeItemsParams,
} from './api';

// ======================
// 코드그룹 (cm_code_group) Hooks
// ======================

/**
 * 코드그룹 목록 조회 훅
 */
export const useCodeGroups = () => {
  return useQuery({
    queryKey: commonCodeKeys.codeGroups(),
    queryFn: () => fetchCodeGroups(),
  });
};

/**
 * 코드그룹 상세 조회 훅
 */
export const useCodeGroup = (groupCode: string | undefined) => {
  return useQuery({
    queryKey: commonCodeKeys.codeGroupDetail(groupCode!),
    queryFn: () => fetchCodeGroup(groupCode!),
    enabled: !!groupCode,
  });
};

/**
 * 코드그룹 생성 뮤테이션 훅
 */
export const useCreateCodeGroup = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createCodeGroup,
    onSuccess: () => {
      // 코드그룹 목록 쿼리 무효화하여 자동 리패칭
      queryClient.invalidateQueries({ queryKey: commonCodeKeys.codeGroups() });
    },
  });
};

/**
 * 코드그룹 수정 뮤테이션 훅
 */
export const useUpdateCodeGroup = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ groupCode, data }: { groupCode: string; data: { groupName: string } }) =>
      updateCodeGroup(groupCode, data),
    onSuccess: (_, variables) => {
      // 목록 및 상세 쿼리 무효화
      queryClient.invalidateQueries({ queryKey: commonCodeKeys.codeGroups() });
      queryClient.invalidateQueries({
        queryKey: commonCodeKeys.codeGroupDetail(variables.groupCode),
      });
    },
  });
};

/**
 * 코드그룹 비활성화 뮤테이션 훅
 */
export const useDeactivateCodeGroup = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (groupCode: string) => deactivateCodeGroup(groupCode),
    onSuccess: () => {
      // 목록 쿼리 무효화
      queryClient.invalidateQueries({ queryKey: commonCodeKeys.codeGroups() });
    },
  });
};

// 하위 호환성
export const useDeleteCodeGroup = useDeactivateCodeGroup;

// ======================
// 코드아이템 (cm_code_item) Hooks
// ======================

/**
 * 코드아이템 목록 조회 훅
 */
export const useCodeItems = (params?: FetchCodeItemsParams) => {
  return useQuery({
    queryKey: commonCodeKeys.codeItemsList(params),
    queryFn: () => params && fetchCodeItems(params),
    enabled: !!params?.groupCode, // groupCode가 있을 때만 활성화
  });
};

/**
 * 코드아이템 상세 조회 훅
 */
export const useCodeItem = (codeItemId: number | undefined) => {
  return useQuery({
    queryKey: commonCodeKeys.codeItemDetail(codeItemId!),
    queryFn: () => fetchCodeItem(codeItemId!),
    enabled: !!codeItemId,
  });
};

/**
 * 코드아이템 생성 뮤테이션 훅
 */
export const useCreateCodeItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      groupCode,
      data,
    }: {
      groupCode: string;
      data: { code: string; codeName: string; sortOrder: number };
    }) => createCodeItem(groupCode, data),
    onSuccess: () => {
      // 코드아이템 목록 쿼리 무효화하여 자동 리패칭
      queryClient.invalidateQueries({ queryKey: commonCodeKeys.codeItemsLists() });
    },
  });
};

/**
 * 코드아이템 수정 뮤테이션 훅
 */
export const useUpdateCodeItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      codeItemId,
      data,
    }: {
      codeItemId: number;
      data: { code: string; codeName: string; sortOrder: number };
    }) => updateCodeItem(codeItemId, data),
    onSuccess: (_, variables) => {
      // 목록 및 상세 쿼리 무효화
      queryClient.invalidateQueries({ queryKey: commonCodeKeys.codeItemsLists() });
      queryClient.invalidateQueries({
        queryKey: commonCodeKeys.codeItemDetail(variables.codeItemId),
      });
    },
  });
};

/**
 * 코드아이템 비활성화 뮤테이션 훅
 */
export const useDeactivateCodeItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (codeItemId: number) => deactivateCodeItem(codeItemId),
    onSuccess: () => {
      // 목록 쿼리 무효화
      queryClient.invalidateQueries({ queryKey: commonCodeKeys.codeItemsLists() });
    },
  });
};

/**
 * 여러 코드아이템 일괄 비활성화 뮤테이션 훅
 */
export const useBulkDeactivateCodeItems = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (codeItemIds: number[]) => bulkDeactivateCodeItems(codeItemIds),
    onSuccess: () => {
      // 목록 쿼리 무효화
      queryClient.invalidateQueries({ queryKey: commonCodeKeys.codeItemsLists() });
    },
  });
};

/**
 * 코드아이템 정렬순서 일괄 저장 뮤테이션 훅
 */
export const useReorderCodeItems = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      groupCode,
      items,
    }: {
      groupCode: string;
      items: Array<{ codeItemId: number; sortOrder: number }>;
    }) => reorderCodeItems(groupCode, items),
    onSuccess: () => {
      // 목록 쿼리 무효화
      queryClient.invalidateQueries({ queryKey: commonCodeKeys.codeItemsLists() });
    },
  });
};

// 하위 호환성
export const useDeleteCodeItem = useDeactivateCodeItem;
export const useDeleteCodeItems = useBulkDeactivateCodeItems;

// ======================
// ServiceMapping (서비스코드 ↔ 서비스명) Hooks
// ======================

/**
 * 서비스 매핑 목록 조회 훅
 */
export const useServiceMappings = () => {
  return useQuery({
    queryKey: ['serviceMappings'],
    queryFn: () => fetchServiceMappings(),
  });
};

/**
 * 서비스 매핑 생성/수정 뮤테이션 훅
 */
export const useUpsertServiceMapping = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: upsertServiceMapping,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['serviceMappings'] });
    },
  });
};

/**
 * 서비스 매핑 삭제 뮤테이션 훅
 */
export const useDeleteServiceMapping = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (firebaseKey: string) => deleteMapping(firebaseKey),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['serviceMappings'] });
    },
  });
};

// ======================
// QuestionMapping (서비스코드 ↔ 질문카테고리) Hooks
// ======================

/**
 * 질문 매핑 목록 조회 훅
 */
export const useQuestionMappings = () => {
  return useQuery({
    queryKey: ['questionMappings'],
    queryFn: () => fetchQuestionMappings(),
  });
};

/**
 * 질문 매핑 생성/수정 뮤테이션 훅
 */
export const useUpsertQuestionMapping = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: upsertQuestionMapping,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['questionMappings'] });
    },
  });
};

/**
 * 질문 매핑 삭제 뮤테이션 훅
 */
export const useDeleteQuestionMapping = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (firebaseKey: string) => deleteMapping(firebaseKey),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['questionMappings'] });
    },
  });
};
