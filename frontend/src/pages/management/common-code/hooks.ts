// frontend/src/pages/management/common-code/hooks.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { commonCodeKeys } from '@/constants/queryKey';
import type { CodeTypeOption } from '@/mocks/commonCodeDb';
import type { RowItem } from './types';
import {
  fetchCodeTypes,
  saveCodeTypes,
  fetchCommonCodes,
  fetchCommonCode,
  createCommonCode,
  updateCommonCode,
  deleteCommonCode,
  deleteCommonCodes,
  type FetchCommonCodesParams,
} from './api';

/**
 * 코드 타입 목록 조회 훅
 */
export const useCodeTypes = () => {
  return useQuery({
    queryKey: commonCodeKeys.codeTypes(),
    queryFn: fetchCodeTypes,
  });
};

/**
 * 코드 타입 저장 뮤테이션 훅 (일괄 저장)
 */
export const useSaveCodeTypes = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: saveCodeTypes,
    onSuccess: () => {
      // 코드 타입 목록 쿼리 무효화하여 자동 리패칭
      queryClient.invalidateQueries({ queryKey: commonCodeKeys.codeTypes() });
    },
  });
};

/**
 * 공통코드 목록 조회 훅
 */
export const useCommonCodes = (params?: FetchCommonCodesParams) => {
  return useQuery({
    queryKey: commonCodeKeys.list(params),
    queryFn: () => fetchCommonCodes(params),
  });
};

/**
 * 공통코드 상세 조회 훅
 */
export const useCommonCode = (serviceCode: string | undefined) => {
  return useQuery({
    queryKey: commonCodeKeys.detail(serviceCode!),
    queryFn: () => fetchCommonCode(serviceCode!),
    enabled: !!serviceCode,
  });
};

/**
 * 공통코드 생성 뮤테이션 훅
 */
export const useCreateCommonCode = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createCommonCode,
    onSuccess: () => {
      // 목록 쿼리 무효화하여 자동 리패칭
      queryClient.invalidateQueries({ queryKey: commonCodeKeys.lists() });
    },
  });
};

/**
 * 공통코드 수정 뮤테이션 훅
 */
export const useUpdateCommonCode = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ serviceCode, data }: { serviceCode: string; data: Partial<RowItem> }) =>
      updateCommonCode(serviceCode, data),
    onSuccess: (_, variables) => {
      // 목록 및 상세 쿼리 무효화
      queryClient.invalidateQueries({ queryKey: commonCodeKeys.lists() });
      queryClient.invalidateQueries({ queryKey: commonCodeKeys.detail(variables.serviceCode) });
    },
  });
};

/**
 * 공통코드 삭제 뮤테이션 훅
 */
export const useDeleteCommonCode = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteCommonCode,
    onSuccess: () => {
      // 목록 쿼리 무효화
      queryClient.invalidateQueries({ queryKey: commonCodeKeys.lists() });
    },
  });
};

/**
 * 여러 공통코드 삭제 뮤테이션 훅
 */
export const useDeleteCommonCodes = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteCommonCodes,
    onSuccess: () => {
      // 목록 쿼리 무효화
      queryClient.invalidateQueries({ queryKey: commonCodeKeys.lists() });
    },
  });
};
