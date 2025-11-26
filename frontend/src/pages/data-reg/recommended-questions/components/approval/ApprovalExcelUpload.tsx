import React, { useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import type { GridColDef } from '@mui/x-data-grid';
import ExcelUpload from '@/components/common/upload/ExcelUpload';
import { serviceOptions, ageGroupOptions, under17Options, questionCategoryOptions } from '../../data';
import { recommendedQuestionColumns } from '../../components/columns/columns';
import { createExcelValidationRules } from '../../validation';
import { importExcelToJson, type ExcelRowData } from '@/utils/excelUtils';
import { useCreateRecommendedQuestionsBatch } from '../../hooks';
import { transformToApiFormat } from '../../api';
import { toast } from 'react-toastify';
import { TOAST_MESSAGES } from '@/constants/message';
import { ROUTES } from '@/routes/menu';

const ApprovalExcelUpload: React.FC = () => {
  const navigate = useNavigate();
  const createBatchMutation = useCreateRecommendedQuestionsBatch();

  // 템플릿에서 제외할 자동 생성 필드들
  const excludeFields = ['no', 'qst_id', 'updatedAt', 'registeredAt', 'status'];

  // 템플릿용 컬럼 (자동 생성 필드 제외)
  const baseTemplateColumns = recommendedQuestionColumns.filter(
    (col) => !excludeFields.includes(col.field),
  );

  // service_nm 제외하고 service_cd로 대체
  const templateColumns: GridColDef[] = useMemo(() => {
    const filtered = baseTemplateColumns.filter((col) => col.field !== 'service_nm');
    const result = filtered
      .map((col, index) => {
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
      .flat();
    
    // 디버깅: prompt_ctnt가 포함되어 있는지 확인
    const hasPromptCtnt = result.some((col) => col.field === 'prompt_ctnt');
    if (!hasPromptCtnt) {
      console.warn('⚠️ prompt_ctnt가 templateColumns에 없습니다!', {
        baseTemplateColumns: baseTemplateColumns.map((c) => c.field),
        filtered: filtered.map((c) => c.field),
        result: result.map((c) => c.field),
      });
    }
    
    return result;
  }, [baseTemplateColumns]);

  const handleSave = useCallback(
    async (file: File) => {
      try {
        const columnFields = templateColumns.map((col) => col.field);

        // 엑셀 파일을 읽어서 JSON 데이터로 변환
        const excelData = await importExcelToJson({
          file,
          columnFields,
          startRow: 4, // 4행부터 데이터 시작
          dateFields: ['imp_start_date', 'imp_end_date'], // 날짜 필드: 텍스트로 읽어서 잘못된 변환 방지
          transformRow: (rowData: ExcelRowData) => {
            // age_grp: 숫자로 변환 (엑셀에서 읽은 후 문자열로 변환하여 API 전송)
            if (
              rowData.age_grp !== null &&
              rowData.age_grp !== undefined &&
              String(rowData.age_grp).trim() !== ''
            ) {
              rowData.age_grp = String(Number(rowData.age_grp));
            }

            // under_17_yn: 대문자로 변환
            if (rowData.under_17_yn) {
              rowData.under_17_yn = String(rowData.under_17_yn).toUpperCase();
            }

            return rowData;
          },
        });

        console.log('변환된 데이터:', excelData);
        console.log('엑셀 업로드 저장:', file.name, `총 ${excelData.length}개 행`);

        // API 형식으로 데이터 변환 (공통 함수 사용)
        const apiDataList = excelData.map((rowData) => transformToApiFormat(rowData));

        // 일괄 등록 API 호출
        await createBatchMutation.mutateAsync(apiDataList);
        toast.success(`${TOAST_MESSAGES.SAVE_SUCCESS} (${apiDataList.length}개 항목)`);

        // 성공 시 이전 페이지로 이동 또는 목록 페이지로 이동
        const returnUrl = sessionStorage.getItem('approval_return_url');
        if (returnUrl) {
          navigate(returnUrl);
          sessionStorage.removeItem('approval_return_url');
        } else {
          navigate(ROUTES.RECOMMENDED_QUESTIONS);
        }
      } catch (error) {
        console.error('파일 처리 오류:', error);
        toast.error(TOAST_MESSAGES.SAVE_FAILED);
        throw error;
      }
    },
    [templateColumns, createBatchMutation, navigate],
  );

  const handleCancel = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  // 필드별 가이드 메시지 (필요한 필드만)
  const fieldGuides: Record<string, string> = {
    service_cd: '필수 | 참조 데이터 확인 (ai_search, ai_calc, ai_transfer, ai_shared_account)',
    display_ctnt: '필수 | 5-500자',
    prompt_ctnt: '선택 | 1000자 이하',
    qst_ctgr: '필수 | 참조 데이터 확인',
    qst_style: '선택 | 질문 관련 태그나 스타일',
    parent_id: '조건부 필수 | AI검색 mid/story인 경우 필수 (예: M020011)',
    parent_nm: '조건부 필수 | AI검색 mid/story인 경우 필수',
    age_grp: '조건부 필수 | AI 금융계산기인 경우 필수, 참조 데이터 확인 (10, 20, 30, 40, 50)',
    under_17_yn: '필수 | Y 또는 N',
    imp_start_date: '필수 | 20251125000000 형식 (14자리 숫자: 연월일시분초)',
    imp_end_date: '필수 | 20251125000000 형식 (14자리 숫자: 연월일시분초, 노출시작일시 이후여야 함)',
  };

  // 예시 데이터 (자동 생성 필드 제외)
  const exampleData = [
    {
      service_cd: 'ai_search',
      display_ctnt: '하루만 맡겨도 연 2% 받을 수 있어?',
      prompt_ctnt: '적금 상품의 금리 정보를 알려주세요',
      qst_ctgr: 'ai_search_mid',
      qst_style: '적금, 금리',
      parent_id: 'M020011',
      parent_nm: '26주 적금',
      age_grp: 10,
      under_17_yn: 'N',
      imp_start_date: '20251125000000',
      imp_end_date: '99991231000000',
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

