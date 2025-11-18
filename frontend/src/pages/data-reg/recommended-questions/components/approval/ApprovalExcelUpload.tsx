import React, { useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import type { GridColDef } from '@mui/x-data-grid';
import ExcelUpload from '@/components/common/upload/ExcelUpload';
import { serviceOptions, ageGroupOptions, under17Options, questionCategoryOptions } from '../../data';
import { recommendedQuestionColumns } from '../../components/columns/columns';
import { createExcelValidationRules } from '../../validation';

const ApprovalExcelUpload: React.FC = () => {
  const navigate = useNavigate();

  // 템플릿에서 제외할 자동 생성 필드들
  const excludeFields = ['no', 'qst_id', 'updatedAt', 'registeredAt', 'status'];

  // 템플릿용 컬럼 (자동 생성 필드 제외)
  const baseTemplateColumns = recommendedQuestionColumns.filter(
    (col) => !excludeFields.includes(col.field),
  );

  // service_nm 제외하고 service_cd로 대체
  const templateColumns: GridColDef[] = useMemo(
    () =>
      baseTemplateColumns
        .filter((col) => col.field !== 'service_nm')
        .map((col, index, arr) => {
          // 첫 번째 위치에 service_cd 추가
          if (index === 0) {
            return [
              {
                field: 'service_cd',
                headerName: '서비스코드',
                width: 140,
              },
              col,
            ];
          }
          return col;
        })
        .flat(),
    [baseTemplateColumns],
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
          // age_grp: 숫자로 변환
          if (
            rowData.age_grp !== null &&
            rowData.age_grp !== undefined &&
            String(rowData.age_grp).trim() !== ''
          ) {
            rowData.age_grp = Number(rowData.age_grp);
          }

          // under_17_yn: 대문자로 변환
          if (rowData.under_17_yn) {
            rowData.under_17_yn = String(rowData.under_17_yn).toUpperCase();
          }

          // 날짜 필드: 문자열 형태로 유지 (YYYY-MM-DD HH:mm:ss 또는 YYYYMMDDHHmmss)
          // validation에서 날짜 형태 체크함

          data.push(rowData);
        }

        console.log('변환된 데이터:', data);
        console.log('엑셀 업로드 저장:', file.name, `총 ${data.length}개 행`);

        // TODO: 백엔드 API 호출
        // await api.saveRecommendedQuestions(data);
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

  // 필드별 가이드 메시지 (필요한 필드만)
  const fieldGuides: Record<string, string> = {
    service_cd: '필수 | 참조 데이터 확인 (ai_search, ai_calc, ai_transfer, ai_shared_account)',
    qst_ctnt: '필수 | 5-500자',
    qst_ctgr: '필수 | 참조 데이터 확인',
    qst_style: '선택 | 질문 관련 태그나 스타일',
    parent_id: '조건부 필수 | AI검색 mid/story인 경우 필수 (예: M020011)',
    parent_nm: '조건부 필수 | AI검색 mid/story인 경우 필수',
    age_grp: '조건부 필수 | AI 금융계산기인 경우 필수, 참조 데이터 확인 (10, 20, 30, 40, 50)',
    under_17_yn: '필수 | Y 또는 N',
    imp_start_date: '필수 | 2025-12-12 15:00:00',
    imp_end_date: '필수 | 2025-12-12 15:00:00 (노출시작일시 이후여야 함)',
  };

  // 예시 데이터 (자동 생성 필드 제외)
  const exampleData = [
    {
      service_cd: 'ai_search',
      qst_ctnt: '하루만 맡겨도 연 2% 받을 수 있어?',
      qst_ctgr: 'ai_search_mid',
      qst_style: '적금, 금리',
      parent_id: 'M020011',
      parent_nm: '26주 적금',
      age_grp: 10,
      under_17_yn: 'N',
      imp_start_date: '2025-05-01 23:59:59',
      imp_end_date: '9999-12-31 23:59:59',
    },
  ];

  // 공통 validation을 사용한 엑셀 검증 규칙
  const validationRules = createExcelValidationRules();

  // Sheet2에 표시할 참조 데이터
  const referenceData = {
    서비스코드: serviceOptions,
    연령대: ageGroupOptions,
    '17세미만노출여부': under17Options,
    질문카테고리: questionCategoryOptions,
  };

  return (
    <ExcelUpload
      onSave={handleSave}
      onCancel={handleCancel}
      columns={templateColumns}
      templateFileName="추천질문_업로드템플릿"
      fieldGuides={fieldGuides}
      validationRules={validationRules}
      exampleData={exampleData}
      referenceData={referenceData}
      acceptedFormats={['.xlsx', '.csv']}
      description="엑셀을 업로드하여 다수의 데이터를 한번에 신규등록 할 수 있습니다. (수정/삭제는 불가)"
      templateLabel="엑셀 양식 다운로드"
      size="medium"
    />
  );
};

export default ApprovalExcelUpload;

