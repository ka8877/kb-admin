// frontend/src/pages/data-reg/app-scheme/hooks.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchAppSchemes,
  fetchAppScheme,
  deleteAppScheme,
  deleteAppSchemes,
  updateAppScheme,
  createAppScheme,
  fetchApprovalDetailAppSchemes,
} from '@/pages/data-reg/app-scheme/api';
import type { AppSchemeItem } from '@/pages/data-reg/app-scheme/types';
import { appSchemeKeys } from '@/constants/queryKey';

/**
 * 앱스킴 목록 조회 훅 파라미터 타입
 */
export interface UseAppSchemesParams {
  /** 페이지 번호 (0부터 시작) */
  page?: number;
  /** 페이지당 행 수 */
  pageSize?: number;
  /** 검색 조건 (필드명: 값 형태의 객체) */
  searchParams?: Record<string, string | number>;
}

/**
 * 앱스킴 목록 조회 훅
 */
export const useAppSchemes = (params?: UseAppSchemesParams) => {
  return useQuery({
    queryKey: appSchemeKeys.list(params),
    queryFn: () => fetchAppSchemes(params),
  });
};

/**
 * 앱스킴 상세 조회 훅
 */
export const useAppScheme = (id: string | number | undefined) => {
  return useQuery({
    queryKey: appSchemeKeys.detail(id!),
    queryFn: () => fetchAppScheme(id!),
    enabled: !!id,
  });
};

/**
 * 앱스킴 생성 뮤테이션 훅
 */
export const useCreateAppScheme = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createAppScheme,
    onSuccess: () => {
      // 목록 쿼리 무효화하여 자동 리패칭
      queryClient.invalidateQueries({ queryKey: appSchemeKeys.lists() });
    },
  });
};

/**
 * 승인 요청 상세 조회 훅 (결재 요청에 포함된 앱스킴 목록)
 */
export const useApprovalDetailAppSchemes = (approvalId: string | number | undefined) => {
  return useQuery({
    queryKey: appSchemeKeys.approvalDetailQuestions(approvalId!),
    queryFn: () => fetchApprovalDetailAppSchemes(approvalId!),
    enabled: !!approvalId,
  });
};

/**
 * 앱스킴 수정 뮤테이션 훅
 */
export const useUpdateAppScheme = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string | number; data: Partial<AppSchemeItem> }) =>
      updateAppScheme(id, data),
    onSuccess: (_, variables) => {
      // 목록 및 상세 쿼리 무효화
      queryClient.invalidateQueries({ queryKey: appSchemeKeys.lists() });
      queryClient.invalidateQueries({ queryKey: appSchemeKeys.detail(variables.id) });
    },
  });
};

/**
 * 앱스킴 삭제 뮤테이션 훅 (단일)
 */
export const useDeleteAppScheme = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteAppScheme,
    onSuccess: () => {
      // 목록 쿼리 무효화
      queryClient.invalidateQueries({ queryKey: appSchemeKeys.lists() });
    },
  });
};

/**
 * 여러 앱스킴 삭제 뮤테이션 훅
 */
export const useDeleteAppSchemes = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteAppSchemes,
    onSuccess: () => {
      // 목록 쿼리 무효화
      queryClient.invalidateQueries({ queryKey: appSchemeKeys.lists() });
    },
  });
};
