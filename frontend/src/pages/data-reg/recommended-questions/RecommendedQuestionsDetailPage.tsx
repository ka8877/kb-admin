// frontend/src/pages/data-reg/recommended-questions/detail/RecommendedQuestionDetailPage.tsx
import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Box } from '@mui/material';
import type { RecommendedQuestionItem } from '@/pages/data-reg/recommended-questions/types';
import DataDetail from '@/components/common/detail/DataDetail';
import PageHeader from '@/components/common/PageHeader';
import { toast } from 'react-toastify';
import {
  selectFieldsConfig,
  dateFieldsConfig,
  readOnlyFieldsConfig,
  excludeFieldsFromChangeCheckConfig,
  baseRequiredFieldsConfig,
  CONDITIONAL_REQUIRED_FIELDS,
  conditionalRequiredFieldsForQuestionCategory,
  conditionalRequiredFieldsForService,
} from '@/pages/data-reg/recommended-questions/data';
import {
  useRecommendedQuestion,
  useUpdateRecommendedQuestion,
  useDeleteRecommendedQuestion,
  useQuestionCategoryOptionsMap,
} from '@/pages/data-reg/recommended-questions/hooks';
import { recommendedQuestionColumns } from '@/pages/data-reg/recommended-questions/components/columns/columns';
import { RecommendedQuestionValidator } from '@/pages/data-reg/recommended-questions/validation/recommendedQuestionValidation';
import { TOAST_MESSAGES } from '@/constants/message';
import { ROUTES } from '@/routes/menu';

const RecommendedQuestionDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const updateMutation = useUpdateRecommendedQuestion();
  const deleteMutation = useDeleteRecommendedQuestion();

  const { data, isLoading, refetch } = useRecommendedQuestion(id);

  const handleBack = React.useCallback(() => {
    navigate(ROUTES.RECOMMENDED_QUESTIONS);
  }, [navigate]);

  const handleDelete = React.useCallback(async () => {
    if (!id) return;

    try {
      await deleteMutation.mutateAsync(id);
      toast.success(TOAST_MESSAGES.DELETE_SUCCESS);
      navigate(-1);
    } catch (error) {
      toast.error(TOAST_MESSAGES.DELETE_FAILED);
    }
  }, [id, deleteMutation, navigate]);

  const handleSave = React.useCallback(
    async (updatedData: RecommendedQuestionItem) => {
      if (!id) return;

      try {
        await updateMutation.mutateAsync({ id, data: updatedData });
        // 저장 성공 후 refetch
        await refetch();
      } catch (error) {
        console.error('수정 요청 실패:', error);
        throw error;
      }
    },
    [id, updateMutation, refetch],
  );

  // 서비스 코드별 질문 카테고리 옵션 맵 로드
  const questionCategoryOptionsMap = useQuestionCategoryOptionsMap();

  // editedData의 serviceNm에 따라 동적으로 카테고리 옵션 반환
  const dynamicSelectFieldsConfig = React.useMemo(
    () => ({
      qstCtgr: (editedData?: RecommendedQuestionItem) => {
        if (!editedData?.serviceNm) {
          return [];
        }
        // 서비스 코드에 해당하는 질문 카테고리 옵션 반환
        return questionCategoryOptionsMap[editedData.serviceNm] || [];
      },
    }),
    [questionCategoryOptionsMap],
  );

  // 동적 셀렉트 필드의 의존성 설정: qstCtgr는 serviceNm에 의존
  const dynamicSelectFieldDependenciesConfig = React.useMemo(
    () => ({
      qstCtgr: ['serviceNm'], // qstCtgr 필드는 serviceNm 필드에 의존
    }),
    [],
  );

  // 필수 필드 목록 추출 (조건적 필수 포함)
  const getRequiredFields = React.useCallback(
    (currentData: RecommendedQuestionItem | undefined): string[] => {
      const requiredFields: string[] = [...baseRequiredFieldsConfig];

      if (currentData) {
        // 조건적 필수: qstCtgr가 'ai_search_mid' 또는 'ai_search_story'일 때 parentId, parentNm 필수
        const qstCtgr = currentData.qstCtgr;
        if (
          qstCtgr === CONDITIONAL_REQUIRED_FIELDS.QST_CTGR_AI_SEARCH_MID ||
          qstCtgr === CONDITIONAL_REQUIRED_FIELDS.QST_CTGR_AI_SEARCH_STORY
        ) {
          requiredFields.push(...conditionalRequiredFieldsForQuestionCategory);
        }

        // 조건적 필수: serviceNm이 'ai_calc'일 때 ageGrp 필수
        const serviceNm = currentData.serviceNm;
        if (serviceNm === CONDITIONAL_REQUIRED_FIELDS.SERVICE_AI_CALC) {
          requiredFields.push(...conditionalRequiredFieldsForService);
        }
      }

      return requiredFields;
    },
    [],
  );

  const handleValidate = (data: RecommendedQuestionItem) => {
    // RecommendedQuestionItem을 RecommendedQuestionData로 변환
    const validationData: Parameters<typeof RecommendedQuestionValidator.validateAll>[0] = {
      serviceNm: data.serviceNm,
      qstCtgr: data.qstCtgr,
      displayCtnt: data.displayCtnt,
      promptCtnt: data.promptCtnt,
      qstStyle: data.qstStyle,
      parentId: data.parentId,
      parentNm: data.parentNm,
      ageGrp: data.ageGrp,
      showU17: data.showU17,
      impStartDate: data.impStartDate,
      impEndDate: data.impEndDate,
      status: data.status,
    };
    return RecommendedQuestionValidator.validateAll(validationData);
  };

  return (
    <Box>
      <PageHeader title="추천질문 상세" />
      <DataDetail<RecommendedQuestionItem>
        data={data}
        columns={recommendedQuestionColumns}
        isLoading={isLoading}
        rowIdGetter="qstId"
        onBack={handleBack}
        onDelete={handleDelete}
        onSave={handleSave}
        readOnlyFields={readOnlyFieldsConfig}
        selectFields={selectFieldsConfig}
        dynamicSelectFields={dynamicSelectFieldsConfig}
        dynamicSelectFieldDependencies={dynamicSelectFieldDependenciesConfig}
        dateFields={dateFieldsConfig}
        dateFormat="YYYYMMDDHHmmss"
        validator={handleValidate}
        getRequiredFields={getRequiredFields}
        checkChangesBeforeSave={true}
        excludeFieldsFromChangeCheck={excludeFieldsFromChangeCheckConfig}
        canEdit={true}
      />
    </Box>
  );
};

export default RecommendedQuestionDetailPage;
