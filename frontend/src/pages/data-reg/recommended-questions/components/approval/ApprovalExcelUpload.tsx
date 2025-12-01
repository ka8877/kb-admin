import React, { useCallback, useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { GridColDef } from '@mui/x-data-grid';
import ExcelUpload from '@/components/common/upload/ExcelUpload';
import {
  serviceOptions,
  ageGroupOptions,
  under17Options,
  questionCategoryOptions,
} from '../../data';
import { recommendedQuestionColumns } from '../../components/columns/columns';
import { createExcelValidationRules } from '../../validation';
import { RecommendedQuestionValidator } from '../../validation/recommendedQuestionValidation';
import {
  useCreateRecommendedQuestionsBatch,
  useQuestionCategoryOptionsMap,
} from '../../hooks';
import { transformToApiFormat } from '../../api';
import { toast } from 'react-toastify';
import { TOAST_MESSAGES } from '@/constants/message';
import { ROUTES } from '@/routes/menu';

const ApprovalExcelUpload: React.FC = () => {
  const navigate = useNavigate();
  const createBatchMutation = useCreateRecommendedQuestionsBatch();

  // 서비스 코드별 질문 카테고리 옵션 맵 로드 (공통 훅 사용)
  const questionCategoryOptionsMap = useQuestionCategoryOptionsMap();

  // 템플릿에서 제외할 자동 생성 필드들 (no 포함)
  const excludeFields = ['no', 'qst_id', 'updatedAt', 'registeredAt', 'status'];

  // 템플릿용 컬럼 (엑셀 파일용 - no 제외, service_nm을 service_cd로 교체)
  const templateColumns: GridColDef[] = useMemo(() => {
    const filtered = recommendedQuestionColumns.filter((col) => !excludeFields.includes(col.field));

    const result = filtered.map((col) => {
      // service_nm을 service_cd로 교체
      if (col.field === 'service_nm') {
        return {
          field: 'service_cd',
          headerName: '서비스코드',
          width: 140,
        };
      }
      return col;
    });

    return result;
  }, []);

  // 그리드 표시용 컬럼 (no 포함, service_nm을 service_cd로 교체)
  const gridColumns: GridColDef[] = useMemo(() => {
    const result = recommendedQuestionColumns
      .filter((col) => !['qst_id', 'updatedAt', 'registeredAt', 'status'].includes(col.field))
      .map((col) => {
        // service_nm을 service_cd로 교체
        if (col.field === 'service_nm') {
          return {
            field: 'service_cd',
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
          // age_grp: 숫자로 변환
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

          return transformToApiFormat(rowData);
        });

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
        console.error('데이터 처리 오류:', error);
        toast.error(TOAST_MESSAGES.SAVE_FAILED);
        throw error;
      }
    },
    [createBatchMutation, navigate],
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
    imp_end_date:
      '필수 | 20251125000000 형식 (14자리 숫자: 연월일시분초, 노출시작일시 이후여야 함)',
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

  // Sheet2에 표시할 참조 데이터
  const referenceData = useMemo(
    () => ({
      서비스코드: serviceOptions,
      연령대: ageGroupOptions,
      '17세미만노출여부': under17Options,
      질문카테고리: questionCategoryOptions,
    }),
    [],
  );

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
    (row: any) => getQuestionCategoryOptionsByService(row.service_cd),
    [getQuestionCategoryOptionsByService],
  );

  // 서비스 코드가 변경되면 질문 카테고리 초기화
  const handleRowSanitizer = useCallback((newRow: any, oldRow: any) => {
    if (newRow.service_cd !== oldRow.service_cd) {
      return {
        ...newRow,
        qst_ctgr: '',
      };
    }
    return newRow;
  }, []);

  // ExcelListPreview용 selectFields 설정
  const selectFieldsConfig = useMemo(
    () => ({
      service_cd: serviceOptions,
      age_grp: ageGroupOptions,
      under_17_yn: under17Options,
      qst_ctgr: [], // 동적으로 변경되므로 빈 배열
    }),
    [],
  );

  // 날짜 필드 설정
  const dateFieldsConfig = ['imp_start_date', 'imp_end_date'];

  // Validation 함수 (service_cd를 service_nm으로 변환하여 체크)
  const handleValidate = useCallback((data: any) => {
    const normalized = { ...data };
    // service_cd를 service_nm으로 변환 (빈 문자열도 변환)
    if (normalized.service_cd !== undefined && normalized.service_cd !== null) {
      normalized.service_nm = normalized.service_cd;
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
      dateFields={dateFieldsConfig}
      dateFormat="YYYYMMDDHHmmss"
      rowIdGetter="no"
      readOnlyFields={['no']}
      getDynamicSelectOptions={dynamicQuestionCategoryOptionsGetter}
      dynamicSelectFields={['qst_ctgr']}
      onProcessRowUpdate={handleRowSanitizer}
    />
  );
};

export default ApprovalExcelUpload;
