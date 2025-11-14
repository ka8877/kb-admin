// frontend/src/pages/data-reg/recommended-questions/RecommendedQuestionsCreatePage.tsx
import React, { useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Card, CardContent, TextField, Stack } from '@mui/material';
import { useForm, Controller, useWatch, type Resolver } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Dayjs } from 'dayjs';
import type { GridColDef } from '@mui/x-data-grid';
import DualTabs from '@/components/common/tabs/DualTabs';
import PageHeader from '@/components/common/PageHeader';
import CreateDataActions from '@/components/common/actions/CreateDataActions';
import ExcelUpload from '@/components/common/upload/ExcelUpload';
import SelectInput from '@/components/common/input/SelectInput';
import GroupedSelectInput from '@/components/common/input/GroupedSelectInput';
import DateInput from '@/components/common/input/DateInput';
import RadioInput from '@/components/common/input/RadioInput';
import { serviceOptions, ageGroupOptions, under17Options, questionCategoryOptions } from './data';
import { useConfirmDialog } from '@/hooks/useConfirmDialog';
import { CONFIRM_MESSAGES, CONFIRM_TITLES } from '@/constants/message';
import { recommendedQuestionColumns } from './components/columns/columns';
import { createRecommendedQuestionYupSchema, createExcelValidationRules } from './validation';
import { useFilteredQuestionCategories } from './hooks';

const RecommendedQuestionsCreatePage: React.FC = () => {
  const navigate = useNavigate();

  const handleBack = useCallback(() => {
    navigate(-1); // 이전 상태 유지하며 목록으로 돌아가기
  }, [navigate]);

  return (
    <Box>
      <PageHeader title="추천질문 등록" />
      <DualTabs
        label1="직접 입력하기"
        label2="엑셀파일로 일괄등록"
        component1={<ManualInputComponent />}
        component2={<ExcelUploadComponent />}
        defaultTab={0}
        variant="standard"
      />
    </Box>
  );
};

// 공통 validation을 사용한 폼 검증 스키마
const schema = createRecommendedQuestionYupSchema();

type FormData = {
  service_nm: string;
  qst_ctgr: string;
  qst_ctnt: string;
  qst_style?: string;
  parentId?: string;
  parentIdName?: string;
  age_grp?: string;
  under_17_yn: string;
  imp_start_date: Dayjs | null;
  imp_end_date: Dayjs | null;
};

// 직접 입력 컴포넌트
const ManualInputComponent: React.FC = () => {
  const navigate = useNavigate();
  const { showConfirm } = useConfirmDialog();

  // validation 모드 상태 관리
  const [hasTriedSubmit, setHasTriedSubmit] = React.useState(false);

  const {
    control,
    handleSubmit,
    trigger,
    formState: { errors },
    setValue,
    watch,
  } = useForm<FormData>({
    resolver: yupResolver(schema) as Resolver<FormData>,
    mode: 'onChange', // 항상 실시간 validation 활성화
    defaultValues: {
      service_nm: '',
      qst_ctgr: '',
      qst_ctnt: '',
      qst_style: '',
      parentId: '',
      parentIdName: '',
      age_grp: '',
      under_17_yn: '',
      imp_start_date: null, // 현재 날짜로 초기화
      imp_end_date: null, // 사용자가 직접 선택하도록 null로 초기화
    },
  });

  // qst_ctgr 값을 감시하여 부모 ID 필수 여부 결정
  const watchedQstCtgr = useWatch({
    control,
    name: 'qst_ctgr',
  });

  // service_nm 값을 감시하여 연령대 필수 여부 결정
  const watchedServiceNm = useWatch({
    control,
    name: 'service_nm',
  });

  // 선택된 서비스에 따라 필터링된 질문 카테고리 옵션 생성 (커스텀 훅 사용)
  const filteredQuestionCategoryOptions = useFilteredQuestionCategories(watchedServiceNm);

  // mid 또는 story인 경우 부모 ID 필수
  const isParentIdRequired =
    watchedQstCtgr === 'ai_search_mid' || watchedQstCtgr === 'ai_search_story';

  // ai_calc인 경우 연령대 필수
  const isAgeGroupRequired = watchedServiceNm === 'ai_calc';

  // service_nm 변경 시 qst_ctgr 초기화 및 validation 재실행
  React.useEffect(() => {
    // 서비스명이 변경되면 질문 카테고리 초기화
    setValue('qst_ctgr', '');

    if (hasTriedSubmit) {
      trigger(['age_grp', 'qst_ctgr']);
    }
  }, [watchedServiceNm, hasTriedSubmit, trigger, setValue]);

  // qst_ctgr 변경 시 부모 ID 관련 필드 validation 재실행
  React.useEffect(() => {
    if (hasTriedSubmit) {
      trigger(['parentId', 'parentIdName']);
    }
  }, [watchedQstCtgr, hasTriedSubmit, trigger]);

  const onSubmit = useCallback((data: FormData) => {
    // TODO: 폼 데이터 검증 및 저장 로직
    console.log('직접 입력 저장:', data);
  }, []);

  const handleSaveClick = useCallback(async () => {
    // 첫 번째 submit 시도 표시
    setHasTriedSubmit(true);

    // validation 체크
    const isValid = await trigger();

    if (isValid) {
      // validation 통과한 경우에만 확인 다이얼로그 표시
      showConfirm({
        title: CONFIRM_TITLES.SAVE,
        message: CONFIRM_MESSAGES.SAVE,
        onConfirm: () => {
          handleSubmit(onSubmit)();
        },
      });
    }
    // validation 실패 시 에러 메시지가 자동으로 표시되고, 이후부터는 실시간 validation 시작
  }, [trigger, showConfirm, handleSubmit, onSubmit]);

  const handleCancel = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  return (
    <Card>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Stack spacing={3}>
            <Controller
              name="service_nm"
              control={control}
              render={({ field }) => (
                <SelectInput
                  label="서비스명"
                  value={field.value}
                  options={serviceOptions}
                  onChange={field.onChange}
                  required
                  error={hasTriedSubmit && !!errors.service_nm}
                  helperText={hasTriedSubmit ? errors.service_nm?.message : undefined}
                  placeholder="선택"
                />
              )}
            />

            <Controller
              name="qst_ctnt"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="질문 내용"
                  placeholder="질문 내용을 입력하세요"
                  multiline
                  rows={4}
                  fullWidth
                  required
                  error={hasTriedSubmit && !!errors.qst_ctnt}
                  helperText={hasTriedSubmit ? errors.qst_ctnt?.message : undefined}
                />
              )}
            />

            <Controller
              name="qst_ctgr"
              control={control}
              render={({ field }) => (
                <GroupedSelectInput
                  label="질문 카테고리"
                  value={field.value}
                  optionGroups={filteredQuestionCategoryOptions}
                  onChange={field.onChange}
                  required
                  disabled={!watchedServiceNm}
                  error={hasTriedSubmit && !!errors.qst_ctgr}
                  helperText={
                    hasTriedSubmit
                      ? errors.qst_ctgr?.message
                      : !watchedServiceNm
                        ? '서비스명을 먼저 선택해주세요'
                        : undefined
                  }
                  placeholder="선택"
                />
              )}
            />

            <Controller
              name="qst_style"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="질문 태그"
                  placeholder="질문 태그를 입력하세요"
                  fullWidth
                  error={hasTriedSubmit && !!errors.qst_style}
                  helperText={hasTriedSubmit ? errors.qst_style?.message : undefined}
                />
              )}
            />

            <Controller
              name="parentId"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="부모 ID"
                  placeholder="부모 ID를 입력하세요"
                  fullWidth
                  required={isParentIdRequired}
                  error={hasTriedSubmit && !!errors.parentId}
                  helperText={hasTriedSubmit ? errors.parentId?.message : undefined}
                />
              )}
            />

            <Controller
              name="parentIdName"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="부모 ID명"
                  placeholder="부모 ID명을 입력하세요"
                  fullWidth
                  required={isParentIdRequired}
                  error={hasTriedSubmit && !!errors.parentIdName}
                  helperText={hasTriedSubmit ? errors.parentIdName?.message : undefined}
                />
              )}
            />

            <Controller
              name="age_grp"
              control={control}
              render={({ field }) => (
                <SelectInput
                  label="연령대"
                  value={field.value || ''}
                  options={ageGroupOptions}
                  onChange={field.onChange}
                  required={isAgeGroupRequired}
                  error={hasTriedSubmit && !!errors.age_grp}
                  helperText={hasTriedSubmit ? errors.age_grp?.message : undefined}
                  placeholder="선택"
                />
              )}
            />

            <Controller
              name="imp_start_date"
              control={control}
              render={({ field }) => (
                <DateInput
                  label="노출 시작 일시"
                  value={field.value}
                  onChange={field.onChange}
                  required
                  error={hasTriedSubmit && !!errors.imp_start_date}
                  helperText={hasTriedSubmit ? errors.imp_start_date?.message : undefined}
                  format="YYYY-MM-DD HH:mm"
                />
              )}
            />

            <Controller
              name="imp_end_date"
              control={control}
              render={({ field }) => (
                <DateInput
                  label="노출 종료 일시"
                  value={field.value}
                  onChange={field.onChange}
                  required
                  error={hasTriedSubmit && !!errors.imp_end_date}
                  helperText={hasTriedSubmit ? errors.imp_end_date?.message : undefined}
                  format="YYYY-MM-DD HH:mm"
                />
              )}
            />

            <Controller
              name="under_17_yn"
              control={control}
              render={({ field }) => (
                <RadioInput
                  label="17세 미만 노출 여부"
                  value={field.value || ''}
                  options={under17Options}
                  onChange={field.onChange}
                  required
                  row
                  error={hasTriedSubmit && !!errors.under_17_yn}
                  helperText={hasTriedSubmit ? errors.under_17_yn?.message : undefined}
                />
              )}
            />

            <CreateDataActions onSave={handleSaveClick} onCancel={handleCancel} size="medium" />
          </Stack>
        </form>
      </CardContent>
    </Card>
  );
};

// 엑셀 일괄 등록 컴포넌트
const ExcelUploadComponent: React.FC = () => {
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

export default RecommendedQuestionsCreatePage;
