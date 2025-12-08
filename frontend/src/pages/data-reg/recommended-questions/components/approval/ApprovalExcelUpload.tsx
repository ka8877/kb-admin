import React, { useCallback, useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { GridColDef } from '@mui/x-data-grid';
import ExcelUpload from '@/components/common/upload/ExcelUpload';
import { serviceOptions, ageGroupOptions } from '@/pages/data-reg/recommended-questions/data';
import { yesNoOptions } from '@/constants/options';
import { recommendedQuestionColumns } from '@/pages/data-reg/recommended-questions/components/columns/columns';
import { RecommendedQuestionValidator } from '@/pages/data-reg/recommended-questions/validation/recommendedQuestionValidation';
import {
  useCreateRecommendedQuestionsBatch,
  useQuestionCategoryOptionsMap,
} from '@/pages/data-reg/recommended-questions/hooks';
import { transformToApiFormat } from '@/pages/data-reg/recommended-questions/api';
import { toast } from 'react-toastify';
import { TOAST_MESSAGES } from '@/constants/message';
import { ROUTES } from '@/routes/menu';
import { excludeFields } from '@/pages/data-reg/recommended-questions/data';
import { APPROVAL_RETURN_URL } from '@/constants/options';
import {
  exampleData,
  fieldGuides,
  excelDateFieldsConfig,
  excelExcludeFields,
  excelReferenceData,
} from '@/pages/data-reg/recommended-questions/data';

const ApprovalExcelUpload: React.FC = () => {
  const navigate = useNavigate();
  const createBatchMutation = useCreateRecommendedQuestionsBatch();

  // 서비스 코드별 질문 카테고리 옵션 맵 로드 (공통 훅 사용)
  const questionCategoryOptionsMap = useQuestionCategoryOptionsMap();

  // 템플릿용 컬럼 (엑셀 파일용 - no 제외, serviceNm을 serviceCd로 교체)
  const templateColumns: GridColDef[] = useMemo(() => {
    const filtered = recommendedQuestionColumns.filter((col) => !excludeFields.includes(col.field));

    const result = filtered.map((col) => {
      // serviceNm을 serviceCd로 교체
      if (col.field === 'serviceNm') {
        return {
          field: 'serviceCd',
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
      .filter((col) => !excelExcludeFields.includes(col.field))
      .map((col) => {
        // serviceNm을 serviceCd로 교체
        if (col.field === 'serviceNm') {
          return {
            field: 'serviceCd',
            headerName: '서비스코드',
            width: 140,
          };
        }
        return col;
      });

    return result;
  }, []);

  const handleSave = useCallback(
    async (data: any[]) => {
      try {
        console.log('🚀 ApprovalExcelUpload handleSave 시작!');
        console.log('ExcelListPreview에서 전달받은 데이터:', data);
        console.log(`총 ${data.length}개 행`);

        // API 형식으로 데이터 변환
        const apiDataList = data.map((rowData) => {
          // ageGrp: 숫자로 변환
          if (
            rowData.ageGrp !== null &&
            rowData.ageGrp !== undefined &&
            String(rowData.ageGrp).trim() !== ''
          ) {
            rowData.ageGrp = String(Number(rowData.ageGrp));
          }

          // showU17: 대문자로 변환
          if (rowData.showU17) {
            rowData.showU17 = String(rowData.showU17).toUpperCase();
          }

          return transformToApiFormat(rowData);
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
    [createBatchMutation, navigate],
  );

  const handleCancel = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  // Sheet2에 표시할 참조 데이터
  const referenceData = excelReferenceData;

  // 서비스 코드에 따른 질문 카테고리 옵션 getter (공통 훅 사용)
  const getQuestionCategoryOptionsByService = useCallback(
    (serviceCode: string | undefined) => {
      if (!serviceCode) return [];
      return questionCategoryOptionsMap[serviceCode] ?? [];
    },
    [questionCategoryOptionsMap],
  );

  // 동적 질문 카테고리 옵션 getter
  const dynamicQuestionCategoryOptionsGetter = useCallback(
    (row: any) => getQuestionCategoryOptionsByService(row.serviceCd),
    [getQuestionCategoryOptionsByService],
  );

  // 서비스 코드가 변경되면 질문 카테고리 초기화
  const handleRowSanitizer = useCallback((newRow: any, oldRow: any) => {
    if (newRow.serviceCd !== oldRow.serviceCd) {
      return {
        ...newRow,
        qstCtgr: '',
      };
    }
    return newRow;
  }, []);

  // ExcelListPreview용 selectFields 설정
  const selectFieldsConfig = useMemo(
    () => ({
      serviceCd: serviceOptions,
      ageGrp: ageGroupOptions,
      showU17: yesNoOptions,
      qstCtgr: [], // 동적으로 변경되므로 빈 배열
    }),
    [],
  );

  // Validation 함수 (serviceCd를 serviceNm으로 변환하여 체크)
  const handleValidate = useCallback((data: any) => {
    const normalized = { ...data };
    // serviceCd를 serviceNm으로 변환 (빈 문자열도 변환)
    if (normalized.serviceCd !== undefined && normalized.serviceCd !== null) {
      normalized.serviceNm = normalized.serviceCd;
    }
    return RecommendedQuestionValidator.validateAll(normalized);
  }, []);

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
      dynamicSelectFields={['qstCtgr']}
      onProcessRowUpdate={handleRowSanitizer}
    />
  );
};

export default ApprovalExcelUpload;
