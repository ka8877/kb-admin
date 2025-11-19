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
    () =>
      appSchemeColumns.filter((col) => !excludeFields.includes(col.field)),
    [],
  );

  const handleSave = useCallback(
    async (file: File) => {
      try {
        // TODO: 실제 파일 파싱 및 데이터 변환 로직
        // 엑셀 파일을 읽어서 JSON 데이터로 변환
        const ExcelJS = await import('exceljs');
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(await file.arrayBuffer());
        const worksheet = workbook.getWorksheet(1);

        if (!worksheet) {
          throw new Error('워크시트를 찾을 수 없습니다.');
        }

        const data: Record<string, unknown>[] = [];
        const startRow = 4; // 4행부터 데이터 시작
        const lastRow = worksheet.lastRow?.number || startRow - 1;
        const columnFields = templateColumns.map((col) => col.field);

        // 각 행의 데이터를 변환
        for (let rowNum = startRow; rowNum <= lastRow; rowNum++) {
          const row = worksheet.getRow(rowNum);
          const rowData: Record<string, unknown> = {};

          columnFields.forEach((field, colIndex) => {
            let cellValue = row.getCell(colIndex + 1).value;

            // ExcelJS의 rich text 객체 처리
            if (cellValue && typeof cellValue === 'object' && 'richText' in cellValue) {
              const richTextObj = cellValue as { richText: Array<{ text: string }> };
              cellValue = richTextObj.richText.map((t) => t.text).join('');
            }

            rowData[field] = cellValue;
          });

          // 빈 행 스킵
          const hasData = columnFields.some((field) => {
            const value = rowData[field];
            return value !== null && value !== undefined && String(value).trim() !== '';
          });

          if (!hasData) continue;

          // 데이터 타입 변환
          // 문자열 필드: trim 처리
          ['product_menu_name', 'description', 'app_scheme_link', 'one_link', 'goods_name_list', 'parent_id', 'parent_title'].forEach((field) => {
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

          // 날짜 필드: 문자열 형태로 유지 (YYYY-MM-DD HH:mm:ss 또는 YYYYMMDDHHmmss)
          // validation에서 날짜 형태 체크함

          data.push(rowData);
        }

        console.log('변환된 데이터:', data);
        console.log('엑셀 업로드 저장:', file.name, `총 ${data.length}개 행`);

        // TODO: 백엔드 API 호출
        // await api.saveAppSchemes(data);
      } catch (error) {
        console.error('파일 처리 오류:', error);
        throw error;
      }
    },
    [templateColumns],
  );

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
    start_date: '필수 | 날짜 형식 (예: 2025-12-12 15:00:00 또는 20251212150000)',
    end_date: '필수 | 날짜 형식, 노출시작일시 이후여야 함 (예: 2025-12-12 15:00:00 또는 20251212150000)',
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
      start_date: '2025-05-01 23:59:59',
      end_date: '9999-12-31 23:59:59',
    },
  ];

  // 공통 validation을 사용한 엑셀 검증 규칙
  const validationRules = createExcelValidationRules();

  return (
    <ExcelUpload
      onSave={handleSave}
      onCancel={handleCancel}
      columns={templateColumns}
      templateFileName="앱스킴_업로드템플릿"
      fieldGuides={fieldGuides}
      validationRules={validationRules}
      exampleData={exampleData}
      acceptedFormats={['.xlsx', '.csv']}
      description="엑셀을 업로드하여 다수의 데이터를 한번에 신규등록 할 수 있습니다. (수정/삭제는 불가)"
      templateLabel="엑셀 양식 다운로드"
      size="medium"
    />
  );
};

export default ApprovalExcelUpload;

