import React, { useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import type { GridColDef } from '@mui/x-data-grid';
import ExcelUpload from '@/components/common/upload/ExcelUpload';
import { appSchemeColumns } from '../../components/columns/columns';
import { createExcelValidationRules } from '../../validation';

const ApprovalExcelUpload: React.FC = () => {
  const navigate = useNavigate();

  // 템플릿에서 제외할 자동 생성 필드들
  const excludeFields = ['no', 'id', 'updatedAt', 'registeredAt', 'status'];

  // 템플릿용 컬럼 (자동 생성 필드 제외)
  const templateColumns: GridColDef[] = useMemo(
    () => appSchemeColumns.filter((col) => !excludeFields.includes(col.field)),
    [],
  );

  const handleSave = useCallback(async (data: any[]) => {
    try {
      console.log('ExcelListPreview에서 전달받은 데이터:', data);
      console.log(`총 ${data.length}개 행`);

      // 데이터 전처리
      const processedData = data.map((rowData) => {
        // 문자열 필드: trim 처리
        [
          'product_menu_name',
          'description',
          'app_scheme_link',
          'one_link',
          'goods_name_list',
          'parent_id',
          'parent_title',
        ].forEach((field) => {
          if (rowData[field] !== null && rowData[field] !== undefined) {
            rowData[field] = String(rowData[field]).trim();
          }
        });

        // 빈 문자열을 null로 변환 (선택 필드)
        ['goods_name_list', 'parent_id', 'parent_title'].forEach((field) => {
          if (rowData[field] === '') {
            rowData[field] = null;
          }
        });

        return rowData;
      });

      console.log('전처리된 데이터:', processedData);

      // TODO: 백엔드 API 호출
      // await api.saveAppSchemes(processedData);
    } catch (error) {
      console.error('데이터 처리 오류:', error);
      throw error;
    }
  }, []);

  const handleCancel = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  // 필드별 가이드 메시지
  const fieldGuides: Record<string, string> = {
    product_menu_name: '필수 | 200자 이하',
    description: '필수 | 2000자 이하',
    app_scheme_link: '필수 | URL 형식, 500자 이하',
    one_link: '필수 | URL 형식, 500자 이하',
    goods_name_list: '선택 | 200자 이하',
    parent_id: '선택 | 50자 이하 (예: M020011)',
    parent_title: '선택 | 200자 이하',
    start_date: '필수 | 20251125000000 형식 (14자리 숫자: 연월일시분초)',
    end_date: '필수 | 20251125000000 형식 (14자리 숫자: 연월일시분초, 노출시작일시 이후여야 함)',
  };

  // 예시 데이터 (자동 생성 필드 제외)
  const exampleData = [
    {
      product_menu_name: 'AI 검색 노출버튼명 예시',
      description: '앱스킴설명 예시입니다.',
      app_scheme_link: 'https://appscheme.to/abcd',
      one_link: 'https://onelink.to/abcd',
      goods_name_list: '자유적금, 햇살론 15',
      parent_id: 'M020011',
      parent_title: '26주 적금',
      start_date: '20250501235959',
      end_date: '99991231235959',
    },
  ];

  // 공통 validation을 사용한 엑셀 검증 규칙
  const validationRules = createExcelValidationRules();

  // Validation 함수 (ExcelUpload의 validator prop 형식에 맞춤)
  const handleValidate = useCallback(
    (data: any): Record<string, { isValid: boolean; message?: string }> => {
      const results: Record<string, { isValid: boolean; message?: string }> = {};

      // 각 필드에 대해 validation 실행
      Object.keys(validationRules).forEach((field) => {
        const validator = validationRules[field];
        const value = data[field];
        results[field] = validator(value, data);
      });

      return results;
    },
    [validationRules],
  );

  // 날짜 필드 설정
  const dateFieldsConfig = ['start_date', 'end_date'];

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
      description="엑셀을 업로드하여 다수의 데이터를 한번에 신규등록 할 수 있습니다. (수정/삭제는 불가)"
      templateLabel="엑셀 양식 다운로드"
      size="medium"
      dateFields={dateFieldsConfig}
      dateFormat="YYYYMMDDHHmmss"
      rowIdGetter="no"
      readOnlyFields={['no']}
    />
  );
};

export default ApprovalExcelUpload;
