import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { approvalRequestKeys } from '@/constants/queryKey';
import { fetchApprovalRequests, approveRequests, retractRequests } from './api';
import { ApprovalPageType } from './config';

/**
 * 승인 요청 목록 조회 훅
 */
export const useApprovalRequests = (
  pageType: ApprovalPageType,
  searchParams?: Record<string, string | number>,
) => {
  return useQuery({
    queryKey: [...approvalRequestKeys.list(pageType), searchParams],
    queryFn: () => fetchApprovalRequests(pageType, searchParams),
  });
};

/**
 * 승인 요청 결재 뮤테이션 훅
 */
export const useApproveRequests = (pageType: ApprovalPageType) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (selectedIds: (string | number)[]) => approveRequests(pageType, selectedIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: approvalRequestKeys.list(pageType) });
    },
  });
};

/**
 * 승인 요청 회수 뮤테이션 훅
 */
export const useRetractRequests = (pageType: ApprovalPageType) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (selectedIds: (string | number)[]) => retractRequests(pageType, selectedIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: approvalRequestKeys.list(pageType) });
    },
  });
};
