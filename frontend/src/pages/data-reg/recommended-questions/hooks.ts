// frontend/src/pages/data-reg/recommended-questions/hooks.ts
import { useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { questionCategoryGroupedOptions } from './data';
import {
  fetchRecommendedQuestions,
  fetchRecommendedQuestion,
  createRecommendedQuestion,
  updateRecommendedQuestion,
  deleteRecommendedQuestion,
} from './api';
import type { RecommendedQuestionItem } from './types';

/**
 * 선택된 서비스에 따라 필터링된 질문 카테고리 옵션을 반환하는 커스텀 훅
 *
 * @param serviceCode - 선택된 서비스 코드 (예: 'ai_search', 'ai_calc')
 * @returns 필터링된 질문 카테고리 그룹 옵션 배열
 *
 * @example
 * const filteredOptions = useFilteredQuestionCategories('ai_search');
 * // AI 검색 관련 카테고리만 반환
 */
export const useFilteredQuestionCategories = (serviceCode: string | undefined) => {
  return useMemo(() => {
    if (!serviceCode) {
      return []; // 서비스 코드 미선택 시 빈 배열
    }
    // 선택된 서비스 코드와 groupValue가 일치하는 그룹만 필터링
    return questionCategoryGroupedOptions.filter((group) => group.groupValue === serviceCode);
  }, [serviceCode]);
};

/**
 * 추천질문 목록 조회 훅 파라미터 타입
 */
export interface UseRecommendedQuestionsParams {
  /** 페이지 번호 (0부터 시작) */
  page?: number;
  /** 페이지당 행 수 */
  pageSize?: number;
  /** 검색 조건 (필드명: 값 형태의 객체) */
  searchParams?: Record<string, string | number>;
}

/**
 * 추천질문 목록 조회 훅
 */
export const useRecommendedQuestions = (params?: UseRecommendedQuestionsParams) => {
  return useQuery({
    queryKey: ['recommended-questions', params?.page, params?.pageSize, params?.searchParams],
    queryFn: () => fetchRecommendedQuestions(params),
  });
};

/**
 * 추천질문 상세 조회 훅
 */
export const useRecommendedQuestion = (id: string | number | undefined) => {
  return useQuery({
    queryKey: ['recommended-questions', id],
    queryFn: () => fetchRecommendedQuestion(id!),
    enabled: !!id,
  });
};

/**
 * 추천질문 생성 뮤테이션 훅
 */
export const useCreateRecommendedQuestion = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createRecommendedQuestion,
    onSuccess: () => {
      // 목록 쿼리 무효화하여 자동 리패칭
      queryClient.invalidateQueries({ queryKey: ['recommended-questions'] });
    },
  });
};

/**
 * 추천질문 수정 뮤테이션 훅
 */
export const useUpdateRecommendedQuestion = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string | number; data: Partial<RecommendedQuestionItem> }) =>
      updateRecommendedQuestion(id, data),
    onSuccess: (_, variables) => {
      // 목록 및 상세 쿼리 무효화
      queryClient.invalidateQueries({ queryKey: ['recommended-questions'] });
      queryClient.invalidateQueries({ queryKey: ['recommended-questions', variables.id] });
    },
  });
};

/**
 * 추천질문 삭제 뮤테이션 훅
 */
export const useDeleteRecommendedQuestion = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteRecommendedQuestion,
    onSuccess: () => {
      // 목록 쿼리 무효화
      queryClient.invalidateQueries({ queryKey: ['recommended-questions'] });
    },
  });
};
