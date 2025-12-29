// frontend/src/pages/data-reg/recommended-questions/hooks.ts
// frontend/src/pages/data-reg/recommended-questions/hooks.ts
import { useEffect, useState, useMemo, useCallback } from 'react';
import {
  AGE_GRP,
  loadQuestionCategoryGroupedOptions,
  QST_CTGR,
  SERVICE_NM,
  SHOW_U17,
  STATUS,
  DISPLAY_CTNT,
  QST_STYLE,
} from '@/pages/data-reg/recommended-questions/data';

type QuestionCategoryGroup = {
  groupLabel: string;
  groupValue: string;
  options: { label: string; value: string }[];
};
import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import {
  approvalRequestKeys,
  RECOMMENDED_QUESTIONS,
  recommendedQuestionsKeys,
  commonCodeKeys,
} from '@/constants/queryKey';
import {
  fetchRecommendedQuestions,
  fetchRecommendedQuestion,
  fetchApprovalDetailQuestions,
  fetchCodeItems,
  fetchQuestionMappings,
  createRecommendedQuestion,
  createRecommendedQuestionsBatch,
  updateRecommendedQuestion,
  deleteRecommendedQuestion,
  deleteRecommendedQuestions,
} from '@/pages/data-reg/recommended-questions/api';
import type { RecommendedQuestionItem } from '@/pages/data-reg/recommended-questions/types';
import { useCommonCodeOptions } from '@/hooks';
import {
  CODE_GRUOP_ID_SERVICE_NM,
  CODE_GROUP_ID_AGE,
  yesNoOptions,
  booleanYesNoOptions,
  CODE_GROUP_ID_QST_CTGR,
  statusOptions,
} from '@/constants/options';
import { getApi } from '@/utils/apiUtils';
import { API_ENDPOINTS } from '@/constants/endpoints';
import { CommonCodeItem } from '@/types/types';
import { convertCommonCodeToOptions } from '@/utils/dataUtils';

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
      {}
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
  size?: number;
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
    placeholderData: keepPreviousData,
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
        queryKey: approvalRequestKeys.list(RECOMMENDED_QUESTIONS),
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
        queryKey: approvalRequestKeys.list(RECOMMENDED_QUESTIONS),
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
        queryKey: approvalRequestKeys.list(RECOMMENDED_QUESTIONS),
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
        queryKey: approvalRequestKeys.list(RECOMMENDED_QUESTIONS),
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
        queryKey: approvalRequestKeys.list(RECOMMENDED_QUESTIONS),
      });
    },
  });
};

/**
 * 서비스 옵션 목록 조회 훅
 * code_group_id: 1765259941522 인 공통 코드를 조회
 */
export const useServiceCodeOptions = () => {
  return useCommonCodeOptions(CODE_GRUOP_ID_SERVICE_NM);
};

/**
 * 질문 매핑 데이터를 로드하는 훅
 * (RecommendedQuestionDetailPage 등에서 동적 옵션 생성 시 사용)
 */
export const useQuestionMappingData = () => {
  // 1. 모든 코드 아이템 조회
  const { data: codeItems = [] } = useQuery({
    queryKey: commonCodeKeys.codeItemsLists(),
    queryFn: fetchCodeItems,
    staleTime: 1000 * 60 * 5,
  });

  // // 2. 서비스 매핑 조회 (service_nm ↔ service_cd)
  // const { data: serviceMappings = [] } = useQuery({
  //   queryKey: commonCodeKeys.serviceMappings(),
  //   queryFn: fetchServiceMappings,
  //   staleTime: 1000 * 60 * 5,
  // });

  // 3. 질문 매핑 조회 (service_cd ↔ qst_ctgr)
  const { data: questionMappings = [] } = useQuery({
    queryKey: commonCodeKeys.questionMappings(),
    queryFn: fetchQuestionMappings,
    staleTime: 1000 * 60 * 5,
  });

  return { codeItems, questionMappings };
};

/**
 * 서비스 코드별 질문 카테고리 조회 (공통 함수)
 * 훅과 validation 등에서 모두 사용 가능
 */
export const fetchQuestionCategoriesByService = async (
  serviceCode: string
): Promise<{ label: string; value: string }[]> => {
  try {
    if (!serviceCode) return [];

    const response = await getApi<CommonCodeItem[]>(API_ENDPOINTS.COMMON_CODE.QUESTION_CATEGORIES, {
      params: { serviceCd: serviceCode },
    });

    if (Array.isArray(response.data)) {
      return convertCommonCodeToOptions(response.data);
    }
    return [];
  } catch (error) {
    console.error('질문 카테고리 조회 실패:', error);
    return [];
  }
};

/**
 * 서비스명에 따라 동적으로 질문 카테고리 목록을 반환하는 훅
 * (API 호출 방식: service_nm -> service_cd -> qst_ctgr)
 */
export const useQuestionCategoriesByService = (serviceInput: string | undefined) => {
  console.log('🔍 serviceInput:', serviceInput);

  const { data: questionCategories = [] } = useQuery({
    queryKey: ['questionCategories', serviceInput],
    queryFn: () => fetchQuestionCategoriesByService(serviceInput || ''),
    enabled: !!serviceInput,
    staleTime: 1000 * 60 * 5, // 5분간 캐시
  });

  return questionCategories;
};

/**
 * 엑셀 참조 데이터를 반환하는 커스텀 훅
 * 서비스 코드와 연령대 옵션을 동적으로 로드하여 반환
 */
export const useExcelReferenceData = () => {
  const { data: serviceOptions = [] } = useCommonCodeOptions(CODE_GRUOP_ID_SERVICE_NM);
  const { data: ageGroupOptions = [] } = useCommonCodeOptions(CODE_GROUP_ID_AGE);
  const { data: questionCategoryOptions = [] } = useCommonCodeOptions(CODE_GROUP_ID_QST_CTGR);

  return {
    서비스코드: serviceOptions,
    연령대: ageGroupOptions,
    '17세미만노출여부': yesNoOptions,
    질문카테고리: questionCategoryOptions,
  };
};

export const useSelectFieldsData = () => {
  const { data: serviceOptions = [] } = useCommonCodeOptions(CODE_GRUOP_ID_SERVICE_NM);
  const { data: ageGroupOptions = [] } = useCommonCodeOptions(CODE_GROUP_ID_AGE);
  const { data: questionCategoryOptions = [] } = useCommonCodeOptions(CODE_GROUP_ID_QST_CTGR);

  return {
    [SERVICE_NM]: serviceOptions,
    [AGE_GRP]: ageGroupOptions,
    [SHOW_U17]: booleanYesNoOptions,
    [STATUS]: statusOptions,
    [QST_CTGR]: questionCategoryOptions,
  };
};

export const useExcelSelectFieldsData = () => {
  const { data: serviceOptions = [] } = useCommonCodeOptions(CODE_GRUOP_ID_SERVICE_NM);
  const { data: ageGroupOptions = [] } = useCommonCodeOptions(CODE_GROUP_ID_AGE);
  const { data: questionCategoryOptions = [] } = useCommonCodeOptions(CODE_GROUP_ID_QST_CTGR);

  return {
    [SERVICE_NM]: serviceOptions,
    [AGE_GRP]: ageGroupOptions,
    [SHOW_U17]: yesNoOptions,
    [STATUS]: statusOptions,
    [QST_CTGR]: questionCategoryOptions,
  };
};

/**
 * 서비스 코드/명 변환을 위한 커스텀 훅
 * 입력값(코드 또는 명)에 따라 매칭되는 서비스 코드와 서비스명을 반환
 */
export const useServiceDataConverter = () => {
  const { data: serviceOptions = [] } = useCommonCodeOptions(CODE_GRUOP_ID_SERVICE_NM);

  const getServiceData = useCallback(
    (input: string): { serviceCd: string; serviceNm: string } => {
      if (!input) return { serviceCd: '', serviceNm: '' };

      // 1. 코드로 찾기 (value가 input과 일치)
      const byCode = serviceOptions.find((opt) => opt.value === input);
      if (byCode) {
        return { serviceCd: byCode.value, serviceNm: byCode.label };
      }

      // 2. 이름으로 찾기 (label이 input과 일치)
      const byLabel = serviceOptions.find((opt) => opt.label === input);
      if (byLabel) {
        return { serviceCd: byLabel.value, serviceNm: byLabel.label };
      }

      // 3. 매칭되는 것이 없으면 입력값을 그대로 반환 (fallback)
      return { serviceCd: input, serviceNm: input };
    },
    [serviceOptions]
  );

  return { getServiceData };
};

import type { SearchField } from '@/types/types';

/**
 * 검색 필드 설정을 반환하는 커스텀 훅
 * 공통 코드를 사용하여 동적으로 옵션을 로드
 */
export const useSearchFields = (serviceNm?: string): SearchField[] => {
  const { data: serviceOptions = [] } = useCommonCodeOptions(CODE_GRUOP_ID_SERVICE_NM);
  const { data: ageGroupOptions = [] } = useCommonCodeOptions(CODE_GROUP_ID_AGE);

  // 서비스명에 따른 동적 질문 카테고리 옵션 로드
  const questionCategoryOptions = useQuestionCategoriesByService(serviceNm);

  return useMemo(
    () => [
      {
        type: 'textGroup',
        fields: [
          { field: DISPLAY_CTNT, label: '질문 내용' },
          { field: QST_STYLE, label: '질문 태그' },
        ],
      },
      { field: SERVICE_NM, label: '서비스명', type: 'select', options: serviceOptions },
      {
        field: QST_CTGR,
        label: '질문 카테고리',
        type: 'select',
        options: questionCategoryOptions,
        helperText:
          questionCategoryOptions.length === 0 ? '서비스명을 먼저 선택해주세요.' : undefined,
      },
      { field: STATUS, label: '데이터 등록 반영 상태', type: 'select', options: statusOptions },
      { field: AGE_GRP, label: '연령대', type: 'select', options: ageGroupOptions },
      { field: SHOW_U17, label: '17세 미만 여부', type: 'radio', options: yesNoOptions },
      /*
      {
        field: 'imp_start',
        dataField: IMP_START_DATE,
        label: '노출 시작일시',
        type: 'dateRange',
        position: 'start',
      },
      {
        field: 'imp_end',
        dataField: IMP_END_DATE,
        label: '노출 종료일시',
        type: 'dateRange',
        position: 'end',
      }, */
    ],
    [serviceOptions, ageGroupOptions, questionCategoryOptions]
  );
};
