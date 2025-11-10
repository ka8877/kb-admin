// frontend/src/pages/data-reg/recommended-questions/RecommendedQuestionsCreatePage.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, Card, CardContent, Typography, TextField, Stack } from '@mui/material';
import { useForm, Controller, useWatch } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DualTabs from '../../../components/common/tabs/DualTabs';
import CreateDataActions from '../../../components/common/actions/CreateDataActions';
import ExcelUpload from '../../../components/common/upload/ExcelUpload';
import SelectInput from '../../../components/common/input/SelectInput';
import GroupedSelectInput from '../../../components/common/input/GroupedSelectInput';
import DateInput from '../../../components/common/input/DateInput';
import RadioInput from '../../../components/common/input/RadioInput';
import dayjs, { Dayjs } from 'dayjs';
import {
  serviceOptions,
  ageGroupOptions,
  under17Options,
  questionCategoryOptions,
  questionCategoryGroupedOptions,
} from './data';
import { useConfirmDialog } from '../../../hooks/useConfirmDialog';
import { CONFIRM_MESSAGES, CONFIRM_TITLES } from '../../../constants/message';
import { recommendedQuestionColumns } from './components/columns/columns';
import {
  createRecommendedQuestionYupSchema,
  createExcelValidationRules,
  type ValidationFunction,
} from './validation';
// import { toBackendFormat, toCompactFormat } from '../../../utils/dateUtils';

const RecommendedQuestionsCreatePage: React.FC = () => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate(-1); // 이전 상태 유지하며 목록으로 돌아가기
  };

  return (
    <Box>
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
    resolver: yupResolver(schema) as any,
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

  // mid 또는 story인 경우 부모 ID 필수
  const isParentIdRequired =
    watchedQstCtgr === 'ai_search_mid' || watchedQstCtgr === 'ai_search_story';

  // ai_calc인 경우 연령대 필수
  const isAgeGroupRequired = watchedServiceNm === 'ai_calc';

  // qst_ctgr 변경 시 부모 ID 관련 필드 validation 재실행
  React.useEffect(() => {
    if (hasTriedSubmit) {
      trigger(['parentId', 'parentIdName']);
    }
  }, [watchedQstCtgr, hasTriedSubmit, trigger]);

  // service_nm 변경 시 연령대 필드 validation 재실행
  React.useEffect(() => {
    if (hasTriedSubmit) {
      trigger(['age_grp']);
    }
  }, [watchedServiceNm, hasTriedSubmit, trigger]);

  const onSubmit = (data: FormData) => {
    // TODO: 폼 데이터 검증 및 저장 로직
    console.log('직접 입력 저장:', data);
  };

  const handleSaveClick = async () => {
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
  };

  const handleCancel = () => {
    navigate(-1);
  };

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
                  optionGroups={questionCategoryGroupedOptions}
                  onChange={field.onChange}
                  required
                  error={hasTriedSubmit && !!errors.qst_ctgr}
                  helperText={hasTriedSubmit ? errors.qst_ctgr?.message : undefined}
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

  const handleSave = async (file: File) => {
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

      const data: any[] = [];
      const startRow = 4; // 4행부터 데이터 시작
      const lastRow = worksheet.lastRow?.number || startRow - 1;
      const columnFields = templateColumns.map((col) => col.field);

      // 각 행의 데이터를 변환
      for (let rowNum = startRow; rowNum <= lastRow; rowNum++) {
        const row = worksheet.getRow(rowNum);
        const rowData: any = {};

        columnFields.forEach((field, colIndex) => {
          let cellValue = row.getCell(colIndex + 1).value;

          // 드롭다운 필드인 경우 label을 value로 변환
          if (dropdownOptions[field] && cellValue) {
            const option = dropdownOptions[field].find((opt) => opt.label === String(cellValue));
            if (option) {
              cellValue = option.value;
            }
          }

          rowData[field] = cellValue;
        });

        // 빈 행 스킵
        const hasData = columnFields.some((field) => {
          const value = rowData[field];
          return value !== null && value !== undefined && String(value).trim() !== '';
        });

        if (!hasData) continue;

        // 날짜 필드를 백엔드 형식으로 변환 (필요한 경우)
        // ISO 8601 형식으로 보내려면 toBackendFormat 사용
        // 기존 YYYYMMDDHHMMSS 형식을 유지하려면 toCompactFormat 사용

        // 예시: ISO 8601 형식으로 변환
        // if (rowData.imp_start_date) {
        //   rowData.imp_start_date = toBackendFormat(rowData.imp_start_date);
        // }
        // if (rowData.imp_end_date) {
        //   rowData.imp_end_date = toBackendFormat(rowData.imp_end_date);
        // }

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
  };

  const handleCancel = () => {
    navigate(-1);
  };

  // 템플릿에서 제외할 자동 생성 필드들
  const excludeFields = ['no', 'qst_id', 'updatedAt', 'registeredAt', 'status'];

  // 템플릿용 컬럼 (자동 생성 필드 제외)
  const templateColumns = recommendedQuestionColumns.filter(
    (col) => !excludeFields.includes(col.field),
  );

  // 필드별 가이드 메시지 (필요한 필드만)
  const fieldGuides: Record<string, string> = {
    service_nm: '필수 | 드롭다운에서 선택 (AI 검색, AI 금융계산기, AI 이체, AI 모임총무)',
    qst_ctnt: '필수 | 5-500자',
    qst_ctgr:
      '필수 | AI검색: ai_search_mid/story/child/promo/signature, AI계산기: ai_calc_save/loan/exchange, AI이체: ai_transfer_svc_intro/trn_nick/sec_auth/mstk_trn, AI모임: ai_shared_dues_status/dues_record/dues_analysis/expense_overview/expense_analysis/moim_dues_status/moim_dues_record',
    qst_style: '선택 | 질문 관련 태그나 스타일',
    parent_id: '조건부 필수 | AI검색 mid/story인 경우 필수 (예: M020011)',
    parent_nm: '조건부 필수 | AI검색 mid/story인 경우 필수',
    age_grp: '조건부 필수 | AI 금융계산기인 경우 필수, 드롭다운에서 선택 (10, 20, 30, 40, 50)',
    under_17_yn: '필수 | 드롭다운에서 선택 (예 또는 아니오)',
    imp_start_date: '필수 | 2025-12-12 15:00:00 또는 20251212150000 형식',
    imp_end_date: '필수 | 2025-12-12 15:00:00 또는 20251212150000 형식',
  };

  // 예시 데이터 (자동 생성 필드 제외)
  const exampleData = [
    {
      service_nm: 'AI 검색',
      qst_ctnt: '하루만 맡겨도 연 2% 받을 수 있어?',
      qst_ctgr: 'ai_search_mid',
      qst_style: '적금, 금리',
      parent_id: 'M020011',
      parent_nm: '26주 적금',
      age_grp: '10', // AI 검색이므로 선택사항
      under_17_yn: 'N',
      imp_start_date: '2025-05-01 23:59:59',
      imp_end_date: '9999-12-31 23:59:59',
    },
  ];

  // 공통 validation을 사용한 엑셀 검증 규칙
  const validationRules = createExcelValidationRules();

  // Excel 드롭다운 옵션 정의 (옵션 수가 적은 필드만)
  const dropdownOptions: Record<string, Array<{ label: string; value: string }>> = {
    service_nm: serviceOptions,
    // qst_ctgr는 옵션이 너무 많아서 드롭다운 제외 (가이드만 제공)
    age_grp: ageGroupOptions,
    under_17_yn: under17Options,
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
      dropdownOptions={dropdownOptions}
      acceptedFormats={['.xlsx', '.csv']}
      description="엑셀을 업로드하여 다수의 데이터를 한번에 신규등록 할 수 있습니다. (수정/삭제는 불가)"
      templateLabel="엑셀 양식 다운로드"
      size="medium"
    />
  );
};

export default RecommendedQuestionsCreatePage;
