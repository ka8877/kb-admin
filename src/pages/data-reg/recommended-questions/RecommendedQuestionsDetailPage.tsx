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
        const { serviceCd, serviceNm } = getServiceData(updatedData.serviceNm);

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

  // 서비스 코드별 질문 카테고리 옵션 맵 로드 (삭제됨 - useQuestionCategoriesByService 사용)
  // const questionCategoryOptionsMap = useQuestionCategoryOptionsMap();

  // editedData의 serviceNm에 따라 동적으로 카테고리 옵션 반환
  // DataDetail 컴포넌트가 훅을 직접 호출할 수 없으므로,
  // 여기서는 훅을 사용하여 데이터를 미리 로드하는 방식이 아니라,
  // DataDetail 내부에서 동적으로 옵션을 가져올 수 있는 구조가 필요함.
  // 하지만 현재 구조상 DataDetail에 전달하는 dynamicSelectFieldsConfig는 함수 형태이므로
  // 훅을 내부에서 호출할 수 없음.
  // 따라서, 현재 선택된 서비스명에 대한 옵션을 미리 로드하여 전달하거나,
  // DataDetail이 훅을 사용할 수 있도록 구조를 변경해야 함.
  // 여기서는 일단 useQuestionCategoriesByService 훅을 사용하여
  // 현재 데이터의 서비스명에 맞는 옵션을 가져오는 방식으로 구현하되,
  // 편집 중 서비스명이 변경될 때마다 옵션이 갱신되어야 하므로
  // 이 부분은 DataDetail 내부 구현에 의존적임.

  // 임시 해결책: DataDetail 컴포넌트가 훅을 직접 사용할 수 없으므로,
  // useQuestionCategoriesByService 훅을 사용하여 모든 서비스에 대한 옵션을 미리 로드하는 것은 비효율적임.
  // 대신, useQuestionCategoriesByService 훅은 단일 서비스에 대한 옵션만 반환하므로,
  // 이를 활용하기 위해 약간의 트릭을 사용해야 함.
  // 하지만 useQuestionCategoriesByService는 훅이므로 콜백 내부에서 호출 불가.

  // 따라서 기존 방식(useQuestionCategoryOptionsMap)이 아닌,
  // API를 통해 동적으로 매핑 정보를 가져오는 useQuestionCategoriesByService 로직을
  // 일반 함수로 분리하거나, 여기서 모든 매핑 정보를 가져와서 처리해야 함.

  // 하지만 useQuestionCategoriesByService 내부 로직이 복잡(API 호출 3번)하므로,
  // 이를 재사용하기 위해 커스텀 훅을 사용하여 데이터를 가져오고,
  // 그 데이터를 기반으로 옵션을 반환하도록 수정.

  // 1. 모든 코드 아이템, 서비스 매핑, 질문 매핑 데이터를 미리 로드 (useQuestionCategoriesByService 내부 로직과 유사)
  // 이를 위해 별도의 훅을 만들거나, useQuestionCategoriesByService를 수정하여
  // 특정 서비스가 아닌 전체 매핑 정보를 반환하도록 할 수 있음.

  // 하지만 요청하신 내용은 "useQuestionCategoriesByService(watchedServiceNm)을 사용해야 돼" 이므로,
  // DataDetail 컴포넌트에서 편집 중인 데이터의 serviceNm을 알 수 있는 방법이 필요함.
  // DataDetail은 내부적으로 상태를 관리하므로, 외부에서 훅을 호출하여 주입하기 어려움.

  // 대안: DataDetail 컴포넌트가 `useQuestionCategoriesByService` 훅을 사용할 수 있도록
  // `useQuestionCategoriesByService` 훅을 `dynamicSelectFieldsConfig` 내부에서 호출하는 것이 아니라,
  // `DataDetail` 컴포넌트가 `serviceNm`이 변경될 때마다 외부에서 전달받은 `getOptions` 함수를 호출하도록 해야 하는데,
  // `getOptions` 함수는 훅이 아니므로 훅을 호출할 수 없음.

  // 따라서, 가장 현실적인 방법은
  // `useQuestionCategoriesByService` 훅 내부의 로직(매핑 데이터 로드)을 분리하여
  // 컴포넌트 레벨에서 데이터를 로드하고,
  // `dynamicSelectFieldsConfig` 함수 내부에서 그 데이터를 사용하여 필터링하는 것임.

  // `useQuestionCategoriesByService` 훅을 보면 `codeItems`, `serviceMappings`, `questionMappings`를 로드함.
  // 이 데이터들을 여기서 로드하고, 필터링 로직을 `dynamicSelectFieldsConfig`에 구현.

  // 서비스 코드별 질문 카테고리 옵션 맵 로드
  const { codeItems, serviceMappings, questionMappings } = useQuestionMappingData();

  // editedData의 serviceNm에 따라 동적으로 카테고리 옵션 반환
  const dynamicSelectFieldsConfig = React.useMemo(
    () => ({
      qstCtgr: (editedData?: RecommendedQuestionItem) => {
        const serviceInput = editedData?.serviceNm;
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
      />
    </Box>
  );
};

export default RecommendedQuestionDetailPage;
