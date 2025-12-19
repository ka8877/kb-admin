import React, { useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import type { GridColDef } from '@mui/x-data-grid';
import ExcelUpload from '@/components/common/upload/ExcelUpload';
import { appSchemeColumns } from '@/pages/data-reg/app-scheme/components/columns/columns';
import { createExcelValidationRules } from '@/pages/data-reg/app-scheme/validation';
import {
  fieldGuides,
  exampleData,
  excludeFields,
  processedFields,
  excelDateFieldsConfig,
  GOODS_NAME_LIST,
  PARENT_ID,
  PARENT_TITLE,
} from '@/pages/data-reg/app-scheme/data';
import { transformToApiFormat } from '@/pages/data-reg/app-scheme/api';
import { useCreateAppSchemesBatch } from '@/pages/data-reg/app-scheme/hooks';
import { GUIDE_MESSAGES } from '@/constants/message';

import type { AppSchemeItem } from '@/pages/data-reg/app-scheme/types';

const ApprovalExcelUpload: React.FC = () => {
  const navigate = useNavigate();
  const createBatchMutation = useCreateAppSchemesBatch();

  // 템플릿에서 제외할 자동 생성 필드들

  // 템플릿용 컬럼 (자동 생성 필드 제외)
  const templateColumns: GridColDef[] = useMemo(
    () => appSchemeColumns.filter((col) => !excludeFields.includes(col.field)),
    [],
  );

  const handleSave = useCallback(
    async (data: AppSchemeItem[]) => {
      try {
        console.log('ExcelListPreview에서 전달받은 데이터:', data);
        console.log(`총 ${data.length}개 행`);

        // 데이터 전처리
        const processedData = data.map((rowData) => {
          const processedRow = { ...rowData } as Record<string, unknown>;

          // 문자열 필드: trim 처리
          processedFields.forEach((field) => {
            if (processedRow[field] !== null && processedRow[field] !== undefined) {
              processedRow[field] = String(processedRow[field]).trim();
            }
          });

          // 빈 문자열을 null로 변환 (선택 필드)
          [GOODS_NAME_LIST, PARENT_ID, PARENT_TITLE].forEach((field) => {
            if (processedRow[field] === '') {
              processedRow[field] = null;
            }
          });

          return processedRow;
        });

        console.log('전처리된 데이터:', processedData);

        // API 포맷으로 변환
        const apiData = processedData.map((item) =>
          transformToApiFormat(item as Partial<AppSchemeItem>),
        );

        // 백엔드 API 호출
        await createBatchMutation.mutateAsync(apiData);

        navigate(-1);
      } catch (error) {
        console.error('데이터 처리 오류:', error);
        throw error;
      }
    },
    [navigate, createBatchMutation],
  );

  const handleCancel = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  // 필드별 가이드 메시지

  // 공통 validation을 사용한 엑셀 검증 규칙
  const validationRules = createExcelValidationRules();

  // Validation 함수 (ExcelUpload의 validator prop 형식에 맞춤)
  const handleValidate = useCallback(
    (data: AppSchemeItem): Record<string, { isValid: boolean; message?: string }> => {
      const results: Record<string, { isValid: boolean; message?: string }> = {};

      // 각 필드에 대해 validation 실행
      Object.keys(validationRules).forEach((field) => {
        const validator = validationRules[field];
        const value = (data as Record<string, unknown>)[field];
        results[field] = validator(value as string | null | undefined, data);
      });

      return results;
    },
    [validationRules],
  );

  return (
    <ExcelUpload
      onSave={handleSave}
      onCancel={handleCancel}
      columns={templateColumns}
      templateFileName="앱스킴_업로드템플릿"
      fieldGuides={fieldGuides}
      validationRules={validationRules}
      validator={handleValidate}
      exampleData={exampleData}
      acceptedFormats={['.xlsx', '.csv']}
      description={GUIDE_MESSAGES.EXCEL_UPLOAD_DESCRIPTION}
      templateLabel="엑셀 양식 다운로드"
      size="medium"
      dateFields={excelDateFieldsConfig}
      dateFormat="YYYYMMDDHHmmss"
      rowIdGetter="no"
      readOnlyFields={['no']}
    />
  );
};

export default ApprovalExcelUpload;
