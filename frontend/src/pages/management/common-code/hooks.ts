// 공통코드 관련 React Query 훅
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { commonCodeKeys } from '@/constants/queryKey';
import type { CodeGroup, CodeItem, CodeGroupDisplay, CodeItemDisplay } from './types';
import {
  fetchCodeGroups,
  fetchCodeGroup,
  createCodeGroup,
  updateCodeGroup,
  deleteCodeGroup,
  fetchCodeItems,
  fetchCodeItem,
  createCodeItem,
  updateCodeItem,
  deleteCodeItem,
  deleteCodeItems,
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
    queryFn: fetchCodeGroups,
  });
};

/**
 * 코드그룹 상세 조회 훅
 */
export const useCodeGroup = (codeGroupId: number | undefined) => {
  return useQuery({
    queryKey: commonCodeKeys.codeGroupDetail(codeGroupId!),
    queryFn: () => fetchCodeGroup(codeGroupId!),
    enabled: !!codeGroupId,
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
    mutationFn: ({ codeGroupId, data }: { codeGroupId: number; data: Partial<CodeGroup> }) =>
      updateCodeGroup(codeGroupId, data),
    onSuccess: (_, variables) => {
      // 목록 및 상세 쿼리 무효화
      queryClient.invalidateQueries({ queryKey: commonCodeKeys.codeGroups() });
      queryClient.invalidateQueries({
        queryKey: commonCodeKeys.codeGroupDetail(variables.codeGroupId),
      });
    },
  });
};

/**
 * 코드그룹 삭제 뮤테이션 훅
 */
export const useDeleteCodeGroup = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteCodeGroup,
    onSuccess: () => {
      // 목록 쿼리 무효화
      queryClient.invalidateQueries({ queryKey: commonCodeKeys.codeGroups() });
    },
  });
};

// ======================
// 코드아이템 (cm_code_item) Hooks
// ======================

/**
 * 코드아이템 목록 조회 훅
 */
export const useCodeItems = (params?: FetchCodeItemsParams) => {
  return useQuery({
    queryKey: commonCodeKeys.codeItemsList(params),
    queryFn: () => fetchCodeItems(params),
    enabled: params?.codeGroupId !== undefined, // codeGroupId가 있을 때만 활성화
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
    mutationFn: createCodeItem,
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
    mutationFn: ({ codeItemId, data }: { codeItemId: number; data: Partial<CodeItem> }) =>
      updateCodeItem(codeItemId, data),
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
 * 코드아이템 삭제 뮤테이션 훅
 */
export const useDeleteCodeItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ codeItemId, firebaseKey }: { codeItemId: number; firebaseKey?: string }) =>
      deleteCodeItem(codeItemId, firebaseKey),
    onSuccess: () => {
      // 목록 쿼리 무효화
      queryClient.invalidateQueries({ queryKey: commonCodeKeys.codeItemsLists() });
    },
  });
};

/**
 * 여러 코드아이템 삭제 뮤테이션 훅
 */
export const useDeleteCodeItems = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteCodeItems,
    onSuccess: () => {
      // 목록 쿼리 무효화
      queryClient.invalidateQueries({ queryKey: commonCodeKeys.codeItemsLists() });
    },
  });
};
