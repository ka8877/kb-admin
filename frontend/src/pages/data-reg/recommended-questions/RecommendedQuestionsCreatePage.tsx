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
import { serviceOptions, ageGroupOptions, under17Options, questionCategoryOptions } from './data';
import { useConfirmDialog } from '../../../hooks/useConfirmDialog';
import { CONFIRM_MESSAGES, CONFIRM_TITLES } from '../../../constants/message';
import { recommendedQuestionColumns } from './components/columns/columns';

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

// 폼 검증 스키마
const schema = yup.object({
  service_nm: yup
    .string()
    .required('서비스명은 필수입니다')
    .max(50, '서비스명은 50자를 초과할 수 없습니다'),
  qst_ctgr: yup
    .string()
    .required('질문 카테고리는 필수입니다')
    .max(100, '질문 카테고리는 100자를 초과할 수 없습니다'),
  qst_ctnt: yup
    .string()
    .required('질문 내용은 필수입니다')
    .min(5, '질문 내용은 최소 5자 이상 입력해주세요')
    .max(500, '질문 내용은 500자를 초과할 수 없습니다'),
  qst_style: yup.string().max(200, '질문 태그는 200자를 초과할 수 없습니다'),
  parentId: yup.string().when('qst_ctgr', {
    is: (value: string) => value === 'ai_search_mid' || value === 'ai_search_story',
    then: (schema) =>
      schema.required('부모 ID는 필수입니다').max(20, '부모 ID는 20자를 초과할 수 없습니다'),
    otherwise: (schema) => schema.max(20, '부모 ID는 20자를 초과할 수 없습니다'),
  }),
  parentIdName: yup.string().when('qst_ctgr', {
    is: (value: string) => value === 'ai_search_mid' || value === 'ai_search_story',
    then: (schema) =>
      schema.required('부모 ID명은 필수입니다').max(100, '부모 ID명은 100자를 초과할 수 없습니다'),
    otherwise: (schema) => schema.max(100, '부모 ID명은 100자를 초과할 수 없습니다'),
  }),
  age_grp: yup.string().when('service_nm', {
    is: (value: string) => value === 'ai_calc',
    then: (schema) => schema.required('연령대는 필수입니다'),
    otherwise: (schema) => schema,
  }),
  under_17_yn: yup.string().required('17세 미만 노출 여부는 필수입니다'),
  imp_start_date: yup.mixed<Dayjs>().required('노출 시작 일시는 필수입니다'),
  imp_end_date: yup.mixed<Dayjs>().required('노출 종료 일시는 필수입니다'),
});

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

  const {
    control,
    handleSubmit,
    trigger,
    formState: { errors },
  } = useForm<FormData>({
    resolver: yupResolver(schema) as any,
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

  const onSubmit = (data: FormData) => {
    // TODO: 폼 데이터 검증 및 저장 로직
    console.log('직접 입력 저장:', data);
  };

  const handleSaveClick = async () => {
    // 먼저 validation 체크
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
    // validation 실패 시 에러 메시지가 자동으로 표시됨
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
                  error={!!errors.service_nm}
                  helperText={errors.service_nm?.message}
                  placeholder="선택"
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
                  optionGroups={questionCategoryOptions}
                  onChange={field.onChange}
                  required
                  error={!!errors.qst_ctgr}
                  helperText={errors.qst_ctgr?.message}
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
                  error={!!errors.qst_ctnt}
                  helperText={errors.qst_ctnt?.message}
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
                  error={!!errors.qst_style}
                  helperText={errors.qst_style?.message}
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
                  error={!!errors.parentId}
                  helperText={errors.parentId?.message}
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
                  error={!!errors.parentIdName}
                  helperText={errors.parentIdName?.message}
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
                  error={!!errors.age_grp}
                  helperText={errors.age_grp?.message}
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
                  error={!!errors.imp_start_date}
                  helperText={errors.imp_start_date?.message}
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
                  error={!!errors.imp_end_date}
                  helperText={errors.imp_end_date?.message}
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
                  error={!!errors.under_17_yn}
                  helperText={errors.under_17_yn?.message}
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

  const handleSave = (file: File) => {
    // TODO: 파일 업로드 검증 및 저장 로직
    console.log('엑셀 업로드 저장:', file.name);
  };

  const handleCancel = () => {
    navigate(-1);
  };

  // 템플릿에서 제외할 자동 생성 필드들
  const excludeFields = ['no', 'qst_id', 'updatedAt', 'registeredAt'];

  // 템플릿용 컬럼 (자동 생성 필드 제외)
  const templateColumns = recommendedQuestionColumns.filter(
    (col) => !excludeFields.includes(col.field),
  );

  // 필드별 가이드 메시지 (필요한 필드만)
  const fieldGuides: Record<string, string> = {
    service_nm: '필수 | AI 검색, AI 금융계산기 등',
    qst_ctnt: '필수 | 5-500자',
    parent_id: '선택 | 부모 ID (예: M020011)',
    parent_nm: '선택 | 부모 ID명',
    imp_start_date: '필수 | YYYYMMDDHHMMSS 형식',
    imp_end_date: '필수 | YYYYMMDDHHMMSS 형식',
    status: 'in_service 또는 out_of_service',
  };

  // 예시 데이터 (자동 생성 필드 제외)
  const exampleData = [
    {
      service_nm: 'AI 검색',
      qst_ctnt: '하루만 맡겨도 연 2% 받을 수 있어?',
      parent_id: 'M020011',
      parent_nm: '26주 적금',
      imp_start_date: '20250501235959',
      imp_end_date: '99991231235959',
      status: 'in_service',
    },
  ];

  return (
    <ExcelUpload
      onSave={handleSave}
      onCancel={handleCancel}
      columns={templateColumns}
      templateFileName="추천질문_업로드템플릿"
      fieldGuides={fieldGuides}
      exampleData={exampleData}
      acceptedFormats={['.xlsx', '.csv']}
      description="엑셀을 업로드하여 다수의 데이터를 한번에 신규등록 할 수 있습니다. (수정/삭제는 불가)"
      templateLabel="엑셀 양식 다운로드"
      size="medium"
    />
  );
};

export default RecommendedQuestionsCreatePage;
