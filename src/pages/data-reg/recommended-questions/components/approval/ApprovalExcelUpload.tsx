import React, { useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import type { GridColDef } from '@mui/x-data-grid';
import ExcelUpload from '@/components/common/upload/ExcelUpload';
import { SERVICE_CD } from '@/pages/data-reg/recommended-questions/data';
import { yesNoOptions } from '@/constants/options';
import { recommendedQuestionColumns } from '@/pages/data-reg/recommended-questions/components/columns/columns';
import { useRecommendedQuestionValidator } from '@/pages/data-reg/recommended-questions/validation/recommendedQuestionValidation';
import {
  useCreateRecommendedQuestionsBatch,
  useExcelSelectFieldsData,
  useQuestionMappingData,
  useServiceDataConverter,
} from '@/pages/data-reg/recommended-questions/hooks';
import { transformToApiFormat, type CodeItem } from '@/pages/data-reg/recommended-questions/api';
import { ROUTES } from '@/routes/menu';
import { excludeFields } from '@/pages/data-reg/recommended-questions/data';
import { APPROVAL_RETURN_URL } from '@/constants/options';
import {
  exampleData,
  fieldGuides,
  excelDateFieldsConfig,
  excelExcludeFields,
} from '@/pages/data-reg/recommended-questions/data';
import { validateExcelDuplicates } from '@/pages/data-reg/recommended-questions/validation';
import {
  SERVICE_NM,
  QST_CTGR,
  AGE_GRP,
  SHOW_U17,
} from '@/pages/data-reg/recommended-questions/data';
import { CODE_GROUP_ID_SERVICE_CD, CODE_GRUOP_ID_SERVICE_NM } from '@/constants/options';

const ApprovalExcelUpload: React.FC = () => {
  const navigate = useNavigate();
  const createBatchMutation = useCreateRecommendedQuestionsBatch();
  const selectFieldsData = useExcelSelectFieldsData();
  const { validateAll } = useRecommendedQuestionValidator();
  const { getServiceData } = useServiceDataConverter();

  // 서비스 코드별 질문 카테고리 옵션 맵 로드 (공통 훅 사용)
  const { codeItems, serviceMappings, questionMappings } = useQuestionMappingData();

  // 템플릿용 컬럼 (엑셀 파일용 - no 제외, serviceNm을 serviceCd로 교체)
  const templateColumns: GridColDef[] = useMemo(() => {
    const filtered = recommendedQuestionColumns.filter((col) => !excludeFields.includes(col.field));

    const result = filtered.map((col) => {
      // serviceNm을 serviceCd로 교체
      if (col.field === SERVICE_NM) {
        return {
          field: SERVICE_CD,
          headerName: '서비스코드',
          width: 140,
        };
      }
      return col;
    });

    return result;
  }, []);

  // 그리드 표시용 컬럼 (no 포함, serviceNm을 serviceCd로 교체)
  const gridColumns: GridColDef[] = useMemo(() => {
    const result = recommendedQuestionColumns
      .filter((col) => !(excelExcludeFields as readonly string[]).includes(col.field))
      .map((col) => {
        // serviceNm을 serviceCd로 교체
        if (col.field === SERVICE_NM) {
          return {
            field: SERVICE_CD,
            headerName: '서비스코드',
            width: 140,
          };
        }
        return col;
      });

    return result;
  }, []);

  const handleSave = useCallback(
    async (data: Record<string, unknown>[]) => {
      try {
        console.log('🚀 ApprovalExcelUpload handleSave 시작!');
        console.log('ExcelListPreview에서 전달받은 데이터:', data);
        console.log(`총 ${data.length}개 행`);

        // API 형식으로 데이터 변환
        const apiDataList = data.map((rowData) => {
          // ageGrp: 문자열로 변환 (포매팅 없음)
          if (
            rowData[AGE_GRP] !== null &&
            rowData[AGE_GRP] !== undefined &&
            String(rowData[AGE_GRP]).trim() !== ''
          ) {
            rowData[AGE_GRP] = String(rowData[AGE_GRP]);
          }

          // showU17: 대문자로 변환
          if (rowData[SHOW_U17]) {
            rowData[SHOW_U17] = String(rowData[SHOW_U17]).toUpperCase();
          }

          // 서비스 코드/명 변환
          const { serviceCd, serviceNm } = getServiceData(
            (rowData[SERVICE_CD] as string) || (rowData[SERVICE_NM] as string) || '',
          );

          return transformToApiFormat({
            ...rowData,
            serviceCd,
            serviceNm,
          } as unknown as Parameters<typeof transformToApiFormat>[0]);
        });

        // 일괄 등록 API 호출
        await createBatchMutation.mutateAsync(apiDataList);
        //toast.success(`${TOAST_MESSAGES.SAVE_SUCCESS} (${apiDataList.length}개 항목)`);

        // 성공 시 이전 페이지로 이동 또는 목록 페이지로 이동
        const returnUrl = sessionStorage.getItem(APPROVAL_RETURN_URL);
        if (returnUrl) {
          navigate(returnUrl);
          sessionStorage.removeItem(APPROVAL_RETURN_URL);
        } else {
          navigate(ROUTES.RECOMMENDED_QUESTIONS);
        }
      } catch (error) {
        console.error('데이터 처리 오류:', error);
        // toast.error(TOAST_MESSAGES.SAVE_FAILED);
        throw error;
      }
    },
    [createBatchMutation, navigate, getServiceData],
  );

  const handleCancel = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  // Sheet2에 표시할 참조 데이터
  const referenceData = useMemo(
    () => ({
      서비스코드: selectFieldsData[SERVICE_NM],
      연령대: selectFieldsData[AGE_GRP],
      '17세미만노출여부': yesNoOptions,
      질문카테고리: selectFieldsData[QST_CTGR],
    }),
    [selectFieldsData],
  );

  // 서비스 코드에 따른 질문 카테고리 옵션 getter (공통 훅 사용)
  const getQuestionCategoryOptionsByService = useCallback(
    (serviceCode: string | undefined) => {
      if (!serviceCode || !codeItems.length) return [];

      let serviceCodeItem: CodeItem | undefined;

      // 1. 입력값이 service_cd 그룹의 코드나 이름과 일치하는지 확인 (직접 매핑)
      serviceCodeItem = codeItems.find(
        (item) =>
          item.code_group_id === CODE_GROUP_ID_SERVICE_CD &&
          (item.code === serviceCode || item.code_name === serviceCode),
      );

      // 2. 일치하는 service_cd가 없다면, service_nm 그룹에서 찾아서 매핑 확인 (간접 매핑)
      if (!serviceCodeItem) {
        const serviceNameItem = codeItems.find(
          (item) =>
            item.code_group_id === CODE_GRUOP_ID_SERVICE_NM &&
            (item.code === serviceCode || item.code_name === serviceCode),
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

      const questionCategoryIds = new Set(relatedQuestionMappings.map((m) => m.child_code_item_id));

      // 4. qst_ctgr 아이템 정보 반환
      return codeItems
        .filter((item) => questionCategoryIds.has(item.firebaseKey))
        .map((item) => ({
          label: item.code_name,
          value: item.code_name,
        }))
        .sort((a, b) => a.label.localeCompare(b.label));
    },
    [codeItems, serviceMappings, questionMappings],
  );

  // 동적 질문 카테고리 옵션 getter
  const dynamicQuestionCategoryOptionsGetter = useCallback(
    (row: Record<string, unknown>) =>
      getQuestionCategoryOptionsByService(row[SERVICE_CD] as string),
    [getQuestionCategoryOptionsByService],
  );

  // 서비스 코드가 변경되면 질문 카테고리 초기화
  const handleRowSanitizer = useCallback(
    (newRow: Record<string, unknown>, oldRow: Record<string, unknown>) => {
      if (newRow[SERVICE_CD] !== oldRow[SERVICE_CD]) {
        return {
          ...newRow,
          [QST_CTGR]: '',
        };
      }
      return newRow;
    },
    [],
  );

  // ExcelListPreview용 selectFields 설정
  const selectFieldsConfig = useMemo(
    () => ({
      [SERVICE_CD]: selectFieldsData[SERVICE_NM],
      [AGE_GRP]: selectFieldsData[AGE_GRP],
      [SHOW_U17]: yesNoOptions,
      [QST_CTGR]: [], // 동적으로 변경되므로 빈 배열
    }),
    [selectFieldsData],
  );

  // Validation 함수 (serviceCd를 serviceNm으로 변환하여 체크)
  const handleValidate = useCallback(
    (data: Record<string, unknown>) => {
      const normalized = { ...data };
      // serviceCd를 serviceNm으로 변환 (빈 문자열도 변환)
      if (normalized[SERVICE_CD] !== undefined && normalized[SERVICE_CD] !== null) {
        normalized[SERVICE_NM] = normalized[SERVICE_CD];
      }
      return validateAll(normalized as unknown as Parameters<typeof validateAll>[0]);
    },
    [validateAll],
  );

  return (
    <ExcelUpload
      onSave={handleSave}
      onCancel={handleCancel}
      columns={templateColumns}
      gridColumns={gridColumns}
      templateFileName="추천질문_업로드템플릿"
      fieldGuides={fieldGuides}
      exampleData={exampleData}
      validator={handleValidate}
      referenceData={referenceData}
      acceptedFormats={['.xlsx', '.csv']}
      description="엑셀을 업로드하여 다수의 데이터를 한번에 신규등록 할 수 있습니다. (수정/삭제는 불가)"
      templateLabel="엑셀 양식 다운로드"
      size="medium"
      selectFields={selectFieldsConfig}
      dateFields={excelDateFieldsConfig}
      dateFormat="YYYYMMDDHHmmss"
      rowIdGetter="no"
      readOnlyFields={['no']}
      getDynamicSelectOptions={dynamicQuestionCategoryOptionsGetter}
      dynamicSelectFields={[QST_CTGR]}
      onProcessRowUpdate={handleRowSanitizer}
      preSaveCheck={validateExcelDuplicates}
    />
  );
};

export default ApprovalExcelUpload;
