// frontend/src/pages/data-reg/recommended-questions/hooks.ts
// frontend/src/pages/data-reg/recommended-questions/hooks.ts
import { useEffect, useState, useMemo } from 'react';
import { loadQuestionCategoryGroupedOptions } from '@/pages/data-reg/recommended-questions/data';

type QuestionCategoryGroup = {
  groupLabel: string;
  groupValue: string;
  options: { label: string; value: string }[];
};
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { approvalRequestKeys, recommendedQuestionsKeys } from '@/constants/queryKey';
import {
  fetchRecommendedQuestions,
  fetchRecommendedQuestion,
  fetchApprovalDetailQuestions,
  createRecommendedQuestion,
  createRecommendedQuestionsBatch,
  updateRecommendedQuestion,
  deleteRecommendedQuestion,
  deleteRecommendedQuestions,
} from '@/pages/data-reg/recommended-questions/api';
import type { RecommendedQuestionItem } from '@/pages/data-reg/recommended-questions/types';
/**
 * 질문 카테고리 그룹 옵션을 로드하는 공통 훅
 * 내부적으로 사용되며, 다른 훅들이 이 데이터를 재사용할 수 있도록 함
 */
export const useQuestionCategoryGroups = () => {
  const [allCategories, setAllCategories] = useState<QuestionCategoryGroup[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        setIsLoading(true);
        const categories = await loadQuestionCategoryGroupedOptions();
        setAllCategories(categories);
      } finally {
        setIsLoading(false);
      }
    };
    loadCategories();
  }, []);

  return { allCategories, isLoading };
};

/**
 * 선택된 서비스에 따라 필터링된 질문 카테고리 옵션을 반환하는 커스텀 훅
 * (그룹화된 형태 - GroupedSelectInput용)
 *
 * @param serviceCode - 선택된 서비스 코드 (예: 'ai_search', 'ai_calc')
 * @returns 필터링된 질문 카테고리 그룹 옵션 배열
 *
 * @example
 * const filteredOptions = useFilteredQuestionCategories('ai_search');
 * // AI 검색 관련 카테고리만 반환
 */
export const useFilteredQuestionCategories = (serviceCode: string | undefined) => {
  const { allCategories } = useQuestionCategoryGroups();

  return useMemo(() => {
    if (!serviceCode) {
      return []; // 서비스 코드 미선택 시 빈 배열
    }
    // 선택된 서비스 코드와 groupValue가 일치하는 그룹만 필터링
    return allCategories.filter((group) => group.groupValue === serviceCode);
  }, [serviceCode, allCategories]);
};

/**
 * 선택된 서비스에 따라 필터링된 질문 카테고리 옵션을 반환하는 커스텀 훅
 * (평탄화된 형태 - 일반 SelectInput용)
 *
 * @param serviceCode - 선택된 서비스 코드 (예: 'ai_search', 'ai_calc')
 * @returns 필터링된 질문 카테고리 옵션 배열 (평탄화)
 *
 * @example
 * const options = useQuestionCategoryOptions('ai_search');
 * // AI 검색 관련 카테고리 옵션 배열 반환
 */
export const useQuestionCategoryOptions = (serviceCode: string | undefined) => {
  const { allCategories } = useQuestionCategoryGroups();

  return useMemo(() => {
    if (!serviceCode) {
      return []; // 서비스 코드 미선택 시 빈 배열
    }
    // 선택된 서비스 코드와 groupValue가 일치하는 그룹 찾기
    const matchedGroup = allCategories.find((group) => group.groupValue === serviceCode);
    return matchedGroup ? matchedGroup.options : [];
  }, [serviceCode, allCategories]);
};

/**
 * 서비스 코드별 질문 카테고리 옵션 맵을 반환하는 커스텀 훅
 * (ExcelUpload 등에서 동적 옵션 제공용)
 *
 * @returns 서비스 코드를 키로 하는 질문 카테고리 옵션 맵
 *
 * @example
 * const optionsMap = useQuestionCategoryOptionsMap();
 * const options = optionsMap['ai_search']; // AI 검색 관련 옵션 배열
 */
export const useQuestionCategoryOptionsMap = () => {
  const { allCategories } = useQuestionCategoryGroups();

  return useMemo(() => {
    return allCategories.reduce<Record<string, { label: string; value: string }[]>>(
      (acc, group) => {
        acc[group.groupValue] = group.options;
        return acc;
      },
      {},
    );
  }, [allCategories]);
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
    queryKey: recommendedQuestionsKeys.list(params),
    queryFn: () => fetchRecommendedQuestions(params),
  });
};

/**
 * 추천질문 상세 조회 훅
 */
export const useRecommendedQuestion = (id: string | number | undefined) => {
  return useQuery({
    queryKey: recommendedQuestionsKeys.detail(id!),
    queryFn: () => fetchRecommendedQuestion(id!),
    enabled: !!id,
  });
};

/**
 * 승인 요청 상세 조회 훅 (결재 요청에 포함된 추천질문 목록)
 */
export const useApprovalDetailQuestions = (approvalId: string | number | undefined) => {
  return useQuery({
    queryKey: approvalRequestKeys.detailQuestions(approvalId!),
    queryFn: () => fetchApprovalDetailQuestions(approvalId!),
    enabled: !!approvalId,
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
      queryClient.invalidateQueries({ queryKey: recommendedQuestionsKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: approvalRequestKeys.list('recommended-questions'),
      });
    },
  });
};

/**
 * 추천질문 일괄 생성 뮤테이션 훅
 */
export const useCreateRecommendedQuestionsBatch = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createRecommendedQuestionsBatch,
    onSuccess: () => {
      // 목록 쿼리 무효화하여 자동 리패칭
      queryClient.invalidateQueries({ queryKey: recommendedQuestionsKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: approvalRequestKeys.list('recommended-questions'),
      });
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
      queryClient.invalidateQueries({ queryKey: recommendedQuestionsKeys.lists() });
      queryClient.invalidateQueries({ queryKey: recommendedQuestionsKeys.detail(variables.id) });
      queryClient.invalidateQueries({
        queryKey: approvalRequestKeys.list('recommended-questions'),
      });
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
      queryClient.invalidateQueries({ queryKey: recommendedQuestionsKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: approvalRequestKeys.list('recommended-questions'),
      });
    },
  });
};

/**
 * 여러 추천질문 삭제 뮤테이션 훅
 */
export const useDeleteRecommendedQuestions = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteRecommendedQuestions,
    onSuccess: () => {
      // 목록 쿼리 무효화
      queryClient.invalidateQueries({ queryKey: recommendedQuestionsKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: approvalRequestKeys.list('recommended-questions'),
      });
    },
  });
};
