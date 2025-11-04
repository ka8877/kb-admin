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

const RecommendedQuestionsCreatePage: React.FC = () => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate(-1); // 이전 상태 유지하며 목록으로 돌아가기
  };

  return (
    <Box>
      {/* 페이지 헤더 */}
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Button variant="outlined" size="small" startIcon={<ArrowBackIcon />} onClick={handleBack}>
          목록으로
        </Button>
        <Typography variant="h4" component="h1">
          추천 질문 등록
        </Typography>
      </Box>

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

// 서비스 옵션 데이터
const serviceOptions = [
  { label: 'AI 검색', value: 'ai_search' },
  { label: 'AI 금융계산기', value: 'ai_calc' },
  { label: 'AI 이체', value: 'ai_transfer' },
  { label: 'AI 모임총무', value: 'ai_shared_account' },
];

// 연령대 옵션 데이터
const ageGroupOptions = [
  { label: '10대', value: '10' },
  { label: '20대', value: '20' },
  { label: '30대', value: '30' },
  { label: '40대', value: '40' },
  { label: '50대', value: '50' },
];

// 17세 미만 노출 여부 옵션 데이터
const under17Options = [
  { label: '예', value: 'Y' },
  { label: '아니오', value: 'N' },
];

// 질문 카테고리 옵션 데이터
const questionCategoryOptions = [
  {
    groupLabel: 'AI검색',
    options: [
      { label: 'mid (엔어드민아이디)', value: 'ai_search_mid' },
      { label: 'story (돈이뭔놈이야기)', value: 'ai_search_story' },
      { label: 'child (아동보호)', value: 'ai_search_child' },
      { label: 'promo (프로모션)', value: 'ai_search_promo' },
      { label: 'signature (시그니처)', value: 'ai_search_signature' },
    ],
  },
  {
    groupLabel: 'AI금융계산기',
    options: [
      { label: 'save (저축)', value: 'ai_calc_save' },
      { label: 'loan (대출)', value: 'ai_calc_loan' },
      { label: 'exchange (환율)', value: 'ai_calc_exchange' },
    ],
  },
  {
    groupLabel: 'AI이체',
    options: [
      { label: 'svc_intro', value: 'ai_transfer_svc_intro' },
      { label: 'trn_nick', value: 'ai_transfer_trn_nick' },
      { label: 'sec_auth', value: 'ai_transfer_sec_auth' },
      { label: 'mstk_trn', value: 'ai_transfer_mstk_trn' },
    ],
  },
  {
    groupLabel: 'AI모임총무',
    options: [
      { label: 'DUES_STATUS', value: 'ai_shared_dues_status' },
      { label: 'DUES_RECORD', value: 'ai_shared_dues_record' },
      { label: 'DUES_ANALYSIS', value: 'ai_shared_dues_analysis' },
      { label: 'EXPENSE_OVERVIEW', value: 'ai_shared_expense_overview' },
      { label: 'EXPENSE_ANALYSIS', value: 'ai_shared_expense_analysis' },
      { label: 'MOIM_DUES_STATUS', value: 'ai_shared_moim_dues_status' },
      { label: 'MOIM_DUES_RECORD', value: 'ai_shared_moim_dues_record' },
    ],
  },
];

// 폼 검증 스키마
const schema = yup.object({
  service_nm: yup.string().required('서비스명은 필수입니다'),
  qst_ctgr: yup.string().required('질문 카테고리는 필수입니다'),
  qst_ctnt: yup.string().required('질문 내용은 필수입니다'),
  qst_style: yup.string(),
  parentId: yup.string().when('qst_ctgr', {
    is: (value: string) => value === 'ai_search_mid' || value === 'ai_search_story',
    then: (schema) => schema.required('부모 ID는 필수입니다'),
    otherwise: (schema) => schema,
  }),
  parentIdName: yup.string().when('qst_ctgr', {
    is: (value: string) => value === 'ai_search_mid' || value === 'ai_search_story',
    then: (schema) => schema.required('부모 ID명은 필수입니다'),
    otherwise: (schema) => schema,
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

  const {
    control,
    handleSubmit,
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

            <CreateDataActions
              onSave={handleSubmit(onSubmit)}
              onCancel={handleCancel}
              size="medium"
            />
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

  const handleTemplateDownload = () => {
    // TODO: 템플릿 파일 다운로드 로직
    console.log('템플릿 다운로드');
  };

  return (
    <ExcelUpload
      onSave={handleSave}
      onCancel={handleCancel}
      acceptedFormats={['.xlsx', '.csv']}
      description="엑셀을 업로드하여 다수의 데이터를 한번에 신규등록 할 수 있습니다. (수정/삭제는 불가)"
      onTemplateDownload={handleTemplateDownload}
      templateLabel="엑셀 양식 다운로드"
      size="medium"
    />
  );
};

export default RecommendedQuestionsCreatePage;
