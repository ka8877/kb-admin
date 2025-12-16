import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, TextField, Stack } from '@mui/material';
import { useForm, Controller, useWatch, type Resolver } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import dayjs, { Dayjs } from 'dayjs';
import CreateDataActions from '@/components/common/actions/CreateDataActions';
import SelectInput from '@/components/common/input/SelectInput';
import GroupedSelectInput from '@/components/common/input/GroupedSelectInput';
import DateInput from '@/components/common/input/DateInput';
import RadioInput from '@/components/common/input/RadioInput';
import { loadAgeGroupOptions } from '@/pages/data-reg/recommended-questions/data';
import { yesNoOptions } from '@/constants/options';
import { useConfirmDialog } from '@/hooks/useConfirmDialog';
import { CONFIRM_MESSAGES, CONFIRM_TITLES, TOAST_MESSAGES } from '@/constants/message';
import { createRecommendedQuestionYupSchema } from '@/pages/data-reg/recommended-questions/validation';
import {
  useQuestionCategoriesByService,
  useCreateRecommendedQuestion,
  useServiceCodeOptions,
} from '@/pages/data-reg/recommended-questions/hooks';
import { transformToApiFormat } from '@/pages/data-reg/recommended-questions/api';
import { toast } from 'react-toastify';
import { ROUTES } from '@/routes/menu';
import { APPROVAL_RETURN_URL } from '@/constants/options';

// 공통 validation을 사용한 폼 검증 스키마
const schema = createRecommendedQuestionYupSchema();

type FormData = {
  serviceNm: string;
  qstCtgr: string;
  displayCtnt: string;
  promptCtnt?: string;
  qstStyle?: string;
  parentId?: string;
  parentIdName?: string;
  ageGrp?: string;
  showU17: string;
  impStartDate: Dayjs | null;
  impEndDate: Dayjs | null;
};

const ApprovalManualForm: React.FC = () => {
  const navigate = useNavigate();
  const { showConfirm } = useConfirmDialog();
  const createMutation = useCreateRecommendedQuestion();
  const { data: serviceOptions = [] } = useServiceCodeOptions();

  // 동적 옵션 상태
  const [ageGroupOptions, setAgeGroupOptions] = useState<{ label: string; value: string }[]>([]);

  // validation 모드 상태 관리
  const [hasTriedSubmit, setHasTriedSubmit] = React.useState(false);

  // 서비스명 및 연령대 옵션 로드
  useEffect(() => {
    const loadOptions = async () => {
      const ageGroups = await loadAgeGroupOptions();
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
      serviceNm: '',
      qstCtgr: '',
      displayCtnt: '',
      promptCtnt: '',
      qstStyle: '',
      parentId: '',
      parentIdName: '',
      ageGrp: '',
      showU17: '',
      impStartDate: dayjs().add(30, 'minute'), // 현재 일시 + 30분
      impEndDate: dayjs('9999-12-31 00:00'), // 9999-12-31 0시로 초기화
    },
  });

  // qstCtgr 값을 감시하여 부모 ID 필수 여부 결정
  const watchedQstCtgr = useWatch({
    control,
    name: 'qstCtgr',
  });

  // serviceNm 값을 감시하여 연령대 필수 여부 결정
  const watchedServiceNm = useWatch({
    control,
    name: 'serviceNm',
  });

  // 선택된 서비스에 따라 필터링된 질문 카테고리 옵션 생성 (API 기반 동적 매핑)
  const questionCategoryOptions = useQuestionCategoriesByService(watchedServiceNm);

  // mid 또는 story인 경우 부모 ID 필수
  const isParentIdRequired =
    watchedQstCtgr === 'ai_search_mid' || watchedQstCtgr === 'ai_search_story';

  // ai_calc인 경우 연령대 필수
  const isAgeGroupRequired = watchedServiceNm === 'ai_calc';

  // 이전 서비스명을 추적
  const prevServiceNmRef = React.useRef<string>('');

  // serviceNm 변경 시 qstCtgr 초기화 및 validation 재실행
  React.useEffect(() => {
    console.log('Changed serviceNm:', watchedServiceNm);
    // 실제로 서비스명이 변경된 경우에만 질문 카테고리 초기화
    if (prevServiceNmRef.current && prevServiceNmRef.current !== watchedServiceNm) {
      setValue('qstCtgr', '');
    }

    // 이전 값 업데이트
    prevServiceNmRef.current = watchedServiceNm || '';

    if (hasTriedSubmit) {
      trigger(['ageGrp', 'qstCtgr']);
    }
  }, [watchedServiceNm, hasTriedSubmit, trigger, setValue]);

  // qstCtgr 변경 시 부모 ID 관련 필드 validation 재실행
  React.useEffect(() => {
    console.log('Changed qstCtgr:', watchedQstCtgr);
    if (hasTriedSubmit) {
      trigger(['parentId', 'parentIdName']);
    }
  }, [watchedQstCtgr, hasTriedSubmit, trigger]);

  const onSubmit = useCallback(
    async (data: FormData) => {
      try {
        // 폼 데이터를 API 형식으로 변환 (공통 함수 사용)
        const apiData = transformToApiFormat({
          serviceNm: data.serviceNm,
          displayCtnt: data.displayCtnt,
          promptCtnt: data.promptCtnt,
          qstCtgr: data.qstCtgr,
          qstStyle: data.qstStyle,
          parentId: data.parentId,
          parentIdName: data.parentIdName,
          ageGrp: data.ageGrp,
          showU17: data.showU17,
          impStartDate: data.impStartDate,
          impEndDate: data.impEndDate,
        });

        await createMutation.mutateAsync(apiData);
        // toast.success(TOAST_MESSAGES.SAVE_SUCCESS);

        // 성공 시 이전 페이지로 이동 또는 목록 페이지로 이동
        const returnUrl = sessionStorage.getItem(APPROVAL_RETURN_URL);
        if (returnUrl) {
          navigate(returnUrl);
          sessionStorage.removeItem(APPROVAL_RETURN_URL);
        } else {
          navigate(ROUTES.RECOMMENDED_QUESTIONS);
        }
      } catch (error) {
        console.error('추천질문 생성 실패:', error);
        // toast.error(TOAST_MESSAGES.SAVE_FAILED);
      }
    },
    [createMutation, navigate],
  );

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
              name="serviceNm"
              control={control}
              render={({ field }) => (
                <SelectInput
                  label="서비스명"
                  value={field.value}
                  options={serviceOptions}
                  onChange={field.onChange}
                  required
                  error={hasTriedSubmit && !!errors.serviceNm}
                  helperText={hasTriedSubmit ? errors.serviceNm?.message : undefined}
                  placeholder="선택"
                />
              )}
            />

            <Controller
              name="displayCtnt"
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
                  error={hasTriedSubmit && !!errors.displayCtnt}
                  helperText={hasTriedSubmit ? errors.displayCtnt?.message : undefined}
                />
              )}
            />

            <Controller
              name="promptCtnt"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="AI input 쿼리"
                  placeholder="AI input 쿼리를 입력하세요"
                  fullWidth
                  error={hasTriedSubmit && !!errors.promptCtnt}
                  helperText={hasTriedSubmit ? errors.promptCtnt?.message : undefined}
                />
              )}
            />

            <Controller
              name="qstCtgr"
              control={control}
              render={({ field }) => (
                <SelectInput
                  label="질문 카테고리"
                  value={field.value}
                  options={questionCategoryOptions}
                  onChange={field.onChange}
                  required
                  disabled={!watchedServiceNm}
                  error={hasTriedSubmit && !!errors.qstCtgr}
                  helperText={
                    hasTriedSubmit
                      ? errors.qstCtgr?.message
                      : !watchedServiceNm
                        ? '서비스명을 먼저 선택해주세요'
                        : undefined
                  }
                  placeholder="선택"
                />
              )}
            />

            <Controller
              name="qstStyle"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="질문 태그"
                  placeholder="질문 태그를 입력하세요"
                  fullWidth
                  error={hasTriedSubmit && !!errors.qstStyle}
                  helperText={hasTriedSubmit ? errors.qstStyle?.message : undefined}
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
              name="ageGrp"
              control={control}
              render={({ field }) => (
                <SelectInput
                  label="연령대"
                  value={field.value || ''}
                  options={ageGroupOptions}
                  onChange={field.onChange}
                  required={isAgeGroupRequired}
                  error={hasTriedSubmit && !!errors.ageGrp}
                  helperText={hasTriedSubmit ? errors.ageGrp?.message : undefined}
                  placeholder="선택"
                />
              )}
            />

            <Controller
              name="impStartDate"
              control={control}
              render={({ field }) => (
                <DateInput
                  label="노출 시작일시"
                  value={field.value}
                  onChange={field.onChange}
                  required
                  error={hasTriedSubmit && !!errors.impStartDate}
                  helperText={hasTriedSubmit ? errors.impStartDate?.message : undefined}
                  format="YYYY-MM-DD HH:mm"
                />
              )}
            />

            <Controller
              name="impEndDate"
              control={control}
              render={({ field }) => (
                <DateInput
                  label="노출 종료일시"
                  value={field.value}
                  onChange={field.onChange}
                  required
                  error={hasTriedSubmit && !!errors.impEndDate}
                  helperText={hasTriedSubmit ? errors.impEndDate?.message : undefined}
                  format="YYYY-MM-DD HH:mm"
                />
              )}
            />

            <Controller
              name="showU17"
              control={control}
              render={({ field }) => (
                <RadioInput
                  label="17세 미만 노출 여부"
                  value={field.value || ''}
                  options={yesNoOptions}
                  onChange={field.onChange}
                  required
                  row
                  error={hasTriedSubmit && !!errors.showU17}
                  helperText={hasTriedSubmit ? errors.showU17?.message : undefined}
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
