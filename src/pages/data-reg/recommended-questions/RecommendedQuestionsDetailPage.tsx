// frontend/src/pages/data-reg/recommended-questions/detail/RecommendedQuestionDetailPage.tsx
import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Box } from '@mui/material';
import type { RecommendedQuestionItem } from '@/pages/data-reg/recommended-questions/types';
import type { CodeItem } from '@/pages/data-reg/recommended-questions/api';
import DataDetail from '@/components/common/detail/DataDetail';
import PageHeader from '@/components/common/PageHeader';
import { toast } from 'react-toastify';
import {
  dateFieldsConfig,
  readOnlyFieldsConfig,
  excludeFieldsFromChangeCheckConfig,
  baseRequiredFieldsConfig,
  CONDITIONAL_REQUIRED_FIELDS,
  conditionalRequiredFieldsForQuestionCategory,
  conditionalRequiredFieldsForService,
  QST_CTGR,
  DISPLAY_CTNT,
  PROMPT_CTNT,
  QST_STYLE,
  PARENT_ID,
  PARENT_NM,
  AGE_GRP,
  SHOW_U17,
  IMP_START_DATE,
  IMP_END_DATE,
  STATUS,
} from '@/pages/data-reg/recommended-questions/data';
import {
  useRecommendedQuestion,
  useUpdateRecommendedQuestion,
  useDeleteRecommendedQuestion,
  useQuestionMappingData,
  useSelectFieldsData,
  useServiceDataConverter,
} from '@/pages/data-reg/recommended-questions/hooks';
import { recommendedQuestionColumns } from '@/pages/data-reg/recommended-questions/components/columns/columns';
import { useRecommendedQuestionValidator } from '@/pages/data-reg/recommended-questions/validation/recommendedQuestionValidation';
import { TOAST_MESSAGES } from '@/constants/message';
import { ROUTES } from '@/routes/menu';
import { PAGE_TITLES } from '@/constants/pageTitle';
import { QST_ID, SERVICE_NM } from '@/pages/data-reg/recommended-questions/data';
import { CODE_GRUOP_ID_SERVICE_NM, CODE_GROUP_ID_SERVICE_CD } from '@/constants/options';

const RecommendedQuestionDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const updateMutation = useUpdateRecommendedQuestion();
  const deleteMutation = useDeleteRecommendedQuestion();
  const { validateAll } = useRecommendedQuestionValidator();
  const selectFieldsData = useSelectFieldsData();
  const { getServiceData } = useServiceDataConverter();

  const { data, isLoading, refetch } = useRecommendedQuestion(id);

  const handleBack = React.useCallback(() => {
    navigate(ROUTES.RECOMMENDED_QUESTIONS);
  }, [navigate]);

  const handleDelete = React.useCallback(async () => {
    if (!id) return;

    try {
      await deleteMutation.mutateAsync(id);
      // toast.success(TOAST_MESSAGES.DELETE_SUCCESS);
      navigate(-1);
    } catch (error) {
      // TODO : 나중에 제거 예정
      toast.error(TOAST_MESSAGES.DELETE_FAILED);
    }
  }, [id, deleteMutation, navigate]);

  const handleSave = React.useCallback(
    async (updatedData: RecommendedQuestionItem) => {
      if (!id) return;

      try {
        // 서비스 코드와 명칭 분리
        const { serviceCd, serviceNm } = getServiceData(updatedData[SERVICE_NM] as string);

        const dataToSave = {
          ...updatedData,
          serviceCd,
          serviceNm,
        };

        await updateMutation.mutateAsync({ id, data: dataToSave });
        // 저장 성공 후 refetch
        await refetch();
      } catch (error) {
        console.error('수정 요청 실패:', error);
        throw error;
      }
    },
    [id, updateMutation, refetch, getServiceData],
  );

  // 서비스 코드별 질문 카테고리 옵션 맵 로드
  const { codeItems, serviceMappings, questionMappings } = useQuestionMappingData();

  // editedData의 serviceNm에 따라 동적으로 카테고리 옵션 반환
  const dynamicSelectFieldsConfig = React.useMemo(
    () => ({
      qstCtgr: (editedData?: RecommendedQuestionItem) => {
        const serviceInput = editedData?.[SERVICE_NM];
        if (!serviceInput || !codeItems.length) return [];

        let serviceCodeItem: CodeItem | undefined;

        // 1. 입력값이 service_cd 그룹의 코드나 이름과 일치하는지 확인 (직접 매핑)
        serviceCodeItem = codeItems.find(
          (item) =>
            item.code_group_id === CODE_GROUP_ID_SERVICE_CD &&
            (item.code === serviceInput || item.code_name === serviceInput),
        );

        // 2. 일치하는 service_cd가 없다면, service_nm 그룹에서 찾아서 매핑 확인 (간접 매핑)
        if (!serviceCodeItem) {
          const serviceNameItem = codeItems.find(
            (item) =>
              item.code_group_id === CODE_GRUOP_ID_SERVICE_NM &&
              (item.code === serviceInput || item.code_name === serviceInput),
          );

          if (serviceNameItem) {
            const serviceMapping = serviceMappings.find(
              (m) => m.parent_code_item_id === serviceNameItem.firebaseKey,
            );
            if (serviceMapping) {
              serviceCodeItem = codeItems.find(
                (item) => item.firebaseKey === serviceMapping.child_code_item_id,
              );
            }
          }
        }

        if (!serviceCodeItem) return [];

        // 3. service_cd 아이템과 매핑된 qst_ctgr 아이템들 찾기
        const relatedQuestionMappings = questionMappings.filter(
          (m) => m.parent_code_item_id === serviceCodeItem!.firebaseKey,
        );

        const questionCategoryIds = new Set(
          relatedQuestionMappings.map((m) => m.child_code_item_id),
        );

        // 4. qst_ctgr 아이템 정보 반환
        return codeItems
          .filter((item) => questionCategoryIds.has(item.firebaseKey))
          .map((item) => ({
            label: item.code_name,
            value: item.code_name,
          }))
          .sort((a, b) => a.label.localeCompare(b.label));
      },
    }),
    [codeItems, serviceMappings, questionMappings],
  );

  // 동적 셀렉트 필드의 의존성 설정: qstCtgr는 serviceNm에 의존
  const dynamicSelectFieldDependenciesConfig = React.useMemo(
    () => ({
      qstCtgr: [SERVICE_NM], // qstCtgr 필드는 serviceNm 필드에 의존
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
    const validationData: Parameters<typeof validateAll>[0] = {
      [SERVICE_NM]: data[SERVICE_NM],
      [QST_CTGR]: data[QST_CTGR],
      [DISPLAY_CTNT]: data[DISPLAY_CTNT],
      [PROMPT_CTNT]: data[PROMPT_CTNT],
      [QST_STYLE]: data[QST_STYLE],
      [PARENT_ID]: data[PARENT_ID],
      [PARENT_NM]: data[PARENT_NM],
      [AGE_GRP]: data[AGE_GRP],
      [SHOW_U17]: data[SHOW_U17],
      [IMP_START_DATE]: data[IMP_START_DATE],
      [IMP_END_DATE]: data[IMP_END_DATE],
      [STATUS]: data[STATUS],
    };
    return validateAll(validationData);
  };

  return (
    <Box>
      <PageHeader title={PAGE_TITLES.RECOMMENDED_QUESTIONS_DETAIL} />
      <DataDetail<RecommendedQuestionItem>
        data={data}
        columns={recommendedQuestionColumns}
        isLoading={isLoading}
        rowIdGetter={QST_ID}
        onBack={handleBack}
        onDelete={handleDelete}
        onSave={handleSave}
        readOnlyFields={readOnlyFieldsConfig}
        selectFields={selectFieldsData}
        dynamicSelectFields={dynamicSelectFieldsConfig}
        dynamicSelectFieldDependencies={dynamicSelectFieldDependenciesConfig}
        dateFields={dateFieldsConfig}
        dateFormat="YYYYMMDDHHmmss"
        validator={handleValidate}
        getRequiredFields={getRequiredFields}
        checkChangesBeforeSave={true}
        excludeFieldsFromChangeCheck={excludeFieldsFromChangeCheckConfig}
        canEdit={true}
        isLocked={data?.locked ?? false}
      />
    </Box>
  );
};

export default RecommendedQuestionDetailPage;
