// frontend/src/pages/data-reg/recommended-questions/detail/RecommendedQuestionDetailPage.tsx
import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Box } from '@mui/material';
import type { RecommendedQuestionItem } from './types';
import DataDetail from '@/components/common/detail/DataDetail';
import PageHeader from '@/components/common/PageHeader';
import { useConfirmDialog } from '@/hooks/useConfirmDialog';
import { toast } from 'react-toastify';
import {
  statusOptions,
  serviceOptions,
  ageGroupOptions,
  under17Options,
  questionCategoryOptions,
  loadQuestionCategoryGroupedOptions,
} from './data';
import { useRecommendedQuestion, useUpdateRecommendedQuestion, useDeleteRecommendedQuestion } from './hooks';
import { recommendedQuestionColumns } from './components/columns/columns';
import { RecommendedQuestionValidator } from './validation/recommendedQuestionValidation';
import { CONFIRM_TITLES, CONFIRM_MESSAGES, TOAST_MESSAGES } from '@/constants/message';
import { ROUTES } from '@/routes/menu';

const RecommendedQuestionDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { showConfirm } = useConfirmDialog();
  const updateMutation = useUpdateRecommendedQuestion();
  const deleteMutation = useDeleteRecommendedQuestion();

  const { data, isLoading, refetch } = useRecommendedQuestion(id);
  
  // 편집 가능 여부: 저장 후에는 편집 불가 (결재 요청이 들어갔으므로)
  const [canEdit, setCanEdit] = React.useState(true);

  const handleBack = React.useCallback(() => {
    navigate(ROUTES.RECOMMENDED_QUESTIONS);
  }, [navigate]);

  const handleDelete = React.useCallback(() => {
    if (!id) return;

    showConfirm({
      title: CONFIRM_TITLES.DELETE,
      message: CONFIRM_MESSAGES.DELETE,
      confirmText: '삭제',
      cancelText: '취소',
      severity: 'error',
      onConfirm: async () => {
        try {
          console.log('삭제 요청 id:', id);
          await deleteMutation.mutateAsync(id);
          toast.success(TOAST_MESSAGES.DELETE_SUCCESS);
          navigate(-1);
        } catch (error) {
          console.error('삭제 실패:', error);
          toast.error(TOAST_MESSAGES.DELETE_FAILED);
        }
      },
    });
  }, [showConfirm, id, deleteMutation, navigate]);

  const handleSave = React.useCallback(
    async (updatedData: RecommendedQuestionItem) => {
      if (!id) return;

      try {
        await updateMutation.mutateAsync({ id, data: updatedData });
        // 저장 성공 후 refetch 및 편집 불가 처리
        await refetch();
        setCanEdit(false); // 저장 후 편집 불가
      } catch (error) {
        console.error('수정 요청 실패:', error);
        throw error;
      }
    },
    [id, updateMutation, refetch],
  );

  const selectFieldsConfig = {
    service_nm: serviceOptions,
    age_grp: ageGroupOptions,
    under_17_yn: under17Options,
    status: statusOptions,
  };

  // 질문 카테고리 그룹 옵션 로드 (편집 중 service_nm 변경에 대응하기 위해 전체 로드)
  const [questionCategoryGroupedOptions, setQuestionCategoryGroupedOptions] = React.useState<
    Array<{ groupLabel: string; groupValue: string; options: Array<{ label: string; value: string }> }>
  >([]);

  React.useEffect(() => {
    const loadCategories = async () => {
      const categories = await loadQuestionCategoryGroupedOptions();
      setQuestionCategoryGroupedOptions(categories);
    };
    loadCategories();
  }, []);

  // editedData의 service_nm에 따라 동적으로 카테고리 옵션 반환
  const dynamicSelectFieldsConfig = React.useMemo(
    () => ({
      qst_ctgr: (editedData?: RecommendedQuestionItem) => {
        if (!editedData?.service_nm) {
          return [];
        }
        // editedData의 service_nm에 해당하는 그룹 찾기
        const matchedGroup = questionCategoryGroupedOptions.find(
          (group) => group.groupValue === editedData.service_nm,
        );
        return matchedGroup ? matchedGroup.options : [];
      },
    }),
    [questionCategoryGroupedOptions],
  );

  // 동적 셀렉트 필드의 의존성 설정: qst_ctgr는 service_nm에 의존
  const dynamicSelectFieldDependenciesConfig = React.useMemo(
    () => ({
      qst_ctgr: ['service_nm'], // qst_ctgr 필드는 service_nm 필드에 의존
    }),
    [],
  );

  const dateFieldsConfig = ['imp_start_date', 'imp_end_date', 'updatedAt', 'registeredAt'];

  const readOnlyFieldsConfig = ['no', 'qst_id', 'updatedAt', 'registeredAt'];

  // 필수 필드 목록 추출 (조건적 필수 포함)
  const getRequiredFields = React.useCallback((currentData: RecommendedQuestionItem | undefined): string[] => {
    const requiredFields: string[] = [
      'service_nm',
      'qst_ctgr',
      'display_ctnt',
      'under_17_yn',
      'imp_start_date',
      'imp_end_date',
    ];

    if (currentData) {
      // 조건적 필수: qst_ctgr가 'ai_search_mid' 또는 'ai_search_story'일 때 parent_id, parent_nm 필수
      const qstCtgr = currentData.qst_ctgr;
      if (qstCtgr === 'ai_search_mid' || qstCtgr === 'ai_search_story') {
        requiredFields.push('parent_id', 'parent_nm');
      }

      // 조건적 필수: service_nm이 'ai_calc'일 때 age_grp 필수
      const serviceNm = currentData.service_nm;
      if (serviceNm === 'ai_calc') {
        requiredFields.push('age_grp');
      }
    }

    return requiredFields;
  }, []);

  const handleValidate = (data: RecommendedQuestionItem) => {
    // RecommendedQuestionItem을 RecommendedQuestionData로 변환
    const validationData: Parameters<typeof RecommendedQuestionValidator.validateAll>[0] = {
      service_nm: data.service_nm,
      qst_ctgr: data.qst_ctgr,
      display_ctnt: data.display_ctnt,
      prompt_ctnt: data.prompt_ctnt,
      qst_style: data.qst_style,
      parent_id: data.parent_id,
      parent_nm: data.parent_nm,
      age_grp: data.age_grp,
      under_17_yn: data.under_17_yn,
      imp_start_date: data.imp_start_date,
      imp_end_date: data.imp_end_date,
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
        rowIdGetter="qst_id"
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
        excludeFieldsFromChangeCheck={['updatedAt', 'registeredAt', 'no', 'qst_id']}
        canEdit={canEdit}
      />
    </Box>
  );
};

export default RecommendedQuestionDetailPage;
