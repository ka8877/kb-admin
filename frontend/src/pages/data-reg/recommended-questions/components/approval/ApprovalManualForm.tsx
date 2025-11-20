import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, TextField, Stack } from '@mui/material';
import { useForm, Controller, useWatch, type Resolver } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Dayjs } from 'dayjs';
import CreateDataActions from '@/components/common/actions/CreateDataActions';
import SelectInput from '@/components/common/input/SelectInput';
import GroupedSelectInput from '@/components/common/input/GroupedSelectInput';
import DateInput from '@/components/common/input/DateInput';
import RadioInput from '@/components/common/input/RadioInput';
import { loadServiceOptions, loadAgeGroupOptions, under17Options } from '../../data';
import { useConfirmDialog } from '@/hooks/useConfirmDialog';
import { CONFIRM_MESSAGES, CONFIRM_TITLES } from '@/constants/message';
import { createRecommendedQuestionYupSchema } from '../../validation';
import { useFilteredQuestionCategories } from '../../hooks';

// 공통 validation을 사용한 폼 검증 스키마
const schema = createRecommendedQuestionYupSchema();

type FormData = {
  service_nm: string;
  qst_ctgr: string;
  display_ctnt: string;
  prompt_ctnt?: string;
  qst_style?: string;
  parentId?: string;
  parentIdName?: string;
  age_grp?: string;
  under_17_yn: string;
  imp_start_date: Dayjs | null;
  imp_end_date: Dayjs | null;
};

const ApprovalManualForm: React.FC = () => {
  const navigate = useNavigate();
  const { showConfirm } = useConfirmDialog();

  // 동적 옵션 상태
  const [serviceOptions, setServiceOptions] = useState<{ label: string; value: string }[]>([]);
  const [ageGroupOptions, setAgeGroupOptions] = useState<{ label: string; value: string }[]>([]);

  // validation 모드 상태 관리
  const [hasTriedSubmit, setHasTriedSubmit] = React.useState(false);

  // 서비스명 및 연령대 옵션 로드
  useEffect(() => {
    const loadOptions = async () => {
      const [services, ageGroups] = await Promise.all([
        loadServiceOptions(),
        loadAgeGroupOptions(),
      ]);
      setServiceOptions(services);
      setAgeGroupOptions(ageGroups);
    };
    loadOptions();
  }, []);

  const {
    control,
    handleSubmit,
    trigger,
    formState: { errors },
    setValue,
  } = useForm<FormData>({
    resolver: yupResolver(schema) as Resolver<FormData>,
    mode: 'onChange', // 항상 실시간 validation 활성화
    defaultValues: {
      service_nm: '',
      qst_ctgr: '',
      display_ctnt: '',
      prompt_ctnt: '',
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
              name="display_ctnt"
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
                  error={hasTriedSubmit && !!errors.display_ctnt}
                  helperText={hasTriedSubmit ? errors.display_ctnt?.message : undefined}
                />
              )}
            />

            <Controller
              name="prompt_ctnt"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="AI input 쿼리"
                  placeholder="AI input 쿼리를 입력하세요"
                  fullWidth
                  error={hasTriedSubmit && !!errors.prompt_ctnt}
                  helperText={hasTriedSubmit ? errors.prompt_ctnt?.message : undefined}
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

export default ApprovalManualForm;
