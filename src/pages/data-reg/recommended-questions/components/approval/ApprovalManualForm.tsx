import React, { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, TextField, Stack } from '@mui/material';
import { useForm, Controller, useWatch, type Resolver } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import dayjs, { Dayjs } from 'dayjs';
import CreateDataActions from '@/components/common/actions/CreateDataActions';
import SelectInput from '@/components/common/input/SelectInput';
import DateInput from '@/components/common/input/DateInput';
import RadioInput from '@/components/common/input/RadioInput';
import { yesNoOptions, CODE_GROUP_ID_AGE, CODE_GRUOP_ID_SERVICE_NM } from '@/constants/options';
import { useConfirmDialog } from '@/hooks/useConfirmDialog';
import { CONFIRM_MESSAGES, CONFIRM_TITLES, TOAST_MESSAGES } from '@/constants/message';
import { useRecommendedQuestionYupSchema } from '@/pages/data-reg/recommended-questions/validation';
import {
  useQuestionCategoriesByService,
  useCreateRecommendedQuestion,
  useServiceDataConverter,
} from '@/pages/data-reg/recommended-questions/hooks';
import { useCommonCodeOptions } from '@/hooks';
import { transformToApiFormat } from '@/pages/data-reg/recommended-questions/api';
import { ROUTES } from '@/routes/menu';
import { APPROVAL_RETURN_URL } from '@/constants/options';
import { COMMON_CODE } from '@/constants/commonCode';
import {
  SERVICE_NM,
  QST_CTGR,
  DISPLAY_CTNT,
  PROMPT_CTNT,
  QST_STYLE,
  PARENT_ID,
  PARENT_NM,
  AGE_GRP,
  SHOW_U17,
  IMP_START_DATE,
  IMP_END_DATE,
} from '@/pages/data-reg/recommended-questions/data';

// 공통 validation을 사용한 폼 검증 스키마 (Hook으로 이동됨)

type FormData = {
  [SERVICE_NM]: string;
  [QST_CTGR]: string;
  [DISPLAY_CTNT]: string;
  [PROMPT_CTNT]?: string;
  [QST_STYLE]?: string;
  [PARENT_ID]?: string;
  [PARENT_NM]?: string;
  [AGE_GRP]?: string;
  [SHOW_U17]: string;
  [IMP_START_DATE]: Dayjs | null;
  [IMP_END_DATE]: Dayjs | null;
};

const ApprovalManualForm: React.FC = () => {
  const navigate = useNavigate();
  const { showConfirm } = useConfirmDialog();
  const createMutation = useCreateRecommendedQuestion();
  const { data: serviceOptions = [] } = useCommonCodeOptions(CODE_GRUOP_ID_SERVICE_NM, true);
  const { data: ageGroupOptions = [] } = useCommonCodeOptions(CODE_GROUP_ID_AGE);

  const { getServiceData } = useServiceDataConverter();

  // 공통 validation을 사용한 폼 검증 스키마
  const schema = useRecommendedQuestionYupSchema();

  // validation 모드 상태 관리
  const [hasTriedSubmit, setHasTriedSubmit] = React.useState(false);

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
      [SERVICE_NM]: '',
      [QST_CTGR]: '',
      [DISPLAY_CTNT]: '',
      [PROMPT_CTNT]: '',
      [QST_STYLE]: '',
      [PARENT_ID]: '',
      [PARENT_NM]: '',
      [AGE_GRP]: '',
      [SHOW_U17]: '',
      [IMP_START_DATE]: dayjs().add(30, 'minute'), // 현재 일시 + 30분
      [IMP_END_DATE]: dayjs('9999-12-31 00:00'), // 9999-12-31 0시로 초기화
    },
  });

  // qstCtgr 값을 감시하여 부모 ID 필수 여부 결정
  const watchedQstCtgr = useWatch({
    control,
    name: QST_CTGR,
  });

  // serviceNm 값을 감시하여 연령대 필수 여부 결정
  const watchedServiceNm = useWatch({
    control,
    name: SERVICE_NM, // 문자열 값 그대로 사용
  });

  // 선택된 서비스에 따라 필터링된 질문 카테고리 옵션 생성 (API 기반 동적 매핑)
  const questionCategoryOptions = useQuestionCategoriesByService(watchedServiceNm);

  // mid 또는 story인 경우 부모 ID 필수
  const isParentIdRequired =
    watchedQstCtgr === COMMON_CODE.QST_CTGR.AI_SEARCH_MID ||
    watchedQstCtgr === COMMON_CODE.QST_CTGR.AI_SEARCH_STORY;

  // ai_calc인 경우 연령대 필수
  const isAgeGroupRequired = watchedServiceNm === COMMON_CODE.SERVICE_CODE.AI_CALC;

  // 이전 서비스명을 추적
  const prevServiceNmRef = React.useRef<string>('');

  // serviceNm 변경 시 qstCtgr 초기화 및 validation 재실행
  React.useEffect(() => {
    console.log('Changed serviceNm:', watchedServiceNm);
    // 실제로 서비스명이 변경된 경우에만 질문 카테고리 초기화
    if (prevServiceNmRef.current && prevServiceNmRef.current !== watchedServiceNm) {
      setValue(QST_CTGR, '');
    }

    // 이전 값 업데이트
    prevServiceNmRef.current = watchedServiceNm || '';

    if (hasTriedSubmit) {
      trigger([AGE_GRP, QST_CTGR]);
    }
  }, [watchedServiceNm, hasTriedSubmit, trigger, setValue]);

  // qstCtgr 변경 시 부모 ID 관련 필드 validation 재실행
  React.useEffect(() => {
    console.log('Changed qstCtgr:', watchedQstCtgr);
    if (hasTriedSubmit) {
      trigger([PARENT_ID, PARENT_NM]);
    }
  }, [watchedQstCtgr, hasTriedSubmit, trigger]);

  const onSubmit = useCallback(
    async (data: FormData) => {
      try {
        // 서비스 코드와 명칭 분리
        const { serviceCd, serviceNm } = getServiceData(data[SERVICE_NM]);

        // 폼 데이터를 API 형식으로 변환 (공통 함수 사용)
        const apiData = transformToApiFormat({
          serviceCd,
          serviceNm,
          [DISPLAY_CTNT]: data[DISPLAY_CTNT],
          [PROMPT_CTNT]: data[PROMPT_CTNT],
          [QST_CTGR]: data[QST_CTGR],
          [QST_STYLE]: data[QST_STYLE],
          [PARENT_ID]: data[PARENT_ID],
          [PARENT_NM]: data[PARENT_NM],
          [AGE_GRP]: data[AGE_GRP],
          [SHOW_U17]: data[SHOW_U17],
          [IMP_START_DATE]: data[IMP_START_DATE],
          [IMP_END_DATE]: data[IMP_END_DATE],
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
              name={SERVICE_NM}
              control={control}
              render={({ field }) => (
                <SelectInput
                  label="서비스명"
                  value={field.value}
                  options={serviceOptions}
                  onChange={field.onChange}
                  required
                  error={hasTriedSubmit && !!errors[SERVICE_NM]}
                  helperText={hasTriedSubmit ? errors[SERVICE_NM]?.message : undefined}
                  placeholder="선택"
                />
              )}
            />

            <Controller
              name={DISPLAY_CTNT}
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
                  error={hasTriedSubmit && !!errors[DISPLAY_CTNT]}
                  helperText={hasTriedSubmit ? errors[DISPLAY_CTNT]?.message : undefined}
                />
              )}
            />

            <Controller
              name={PROMPT_CTNT}
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="AI input 쿼리"
                  placeholder="AI input 쿼리를 입력하세요"
                  fullWidth
                  error={hasTriedSubmit && !!errors[PROMPT_CTNT]}
                  helperText={hasTriedSubmit ? errors[PROMPT_CTNT]?.message : undefined}
                />
              )}
            />

            <Controller
              name={QST_CTGR}
              control={control}
              render={({ field }) => (
                <SelectInput
                  label="질문 카테고리"
                  value={field.value}
                  options={questionCategoryOptions}
                  onChange={field.onChange}
                  required
                  disabled={!watchedServiceNm}
                  error={hasTriedSubmit && !!errors[QST_CTGR]}
                  helperText={
                    hasTriedSubmit
                      ? errors[QST_CTGR]?.message
                      : !watchedServiceNm
                        ? '서비스명을 먼저 선택해주세요'
                        : undefined
                  }
                  placeholder="선택"
                />
              )}
            />

            <Controller
              name={QST_STYLE}
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="질문 태그"
                  placeholder="질문 태그를 입력하세요"
                  fullWidth
                  error={hasTriedSubmit && !!errors[QST_STYLE]}
                  helperText={hasTriedSubmit ? errors[QST_STYLE]?.message : undefined}
                />
              )}
            />

            <Controller
              name={PARENT_ID}
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="부모 ID"
                  placeholder="부모 ID를 입력하세요"
                  fullWidth
                  required={isParentIdRequired}
                  error={hasTriedSubmit && !!errors[PARENT_ID]}
                  helperText={hasTriedSubmit ? errors[PARENT_ID]?.message : undefined}
                />
              )}
            />

            <Controller
              name={PARENT_NM}
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="부모 ID명"
                  placeholder="부모 ID명을 입력하세요"
                  fullWidth
                  required={isParentIdRequired}
                  error={hasTriedSubmit && !!errors[PARENT_NM]}
                  helperText={hasTriedSubmit ? errors[PARENT_NM]?.message : undefined}
                />
              )}
            />

            <Controller
              name={AGE_GRP}
              control={control}
              render={({ field }) => (
                <SelectInput
                  label="연령대"
                  value={field.value || ''}
                  options={ageGroupOptions}
                  onChange={field.onChange}
                  required={isAgeGroupRequired}
                  error={hasTriedSubmit && !!errors[AGE_GRP]}
                  helperText={hasTriedSubmit ? errors[AGE_GRP]?.message : undefined}
                  placeholder="선택"
                />
              )}
            />

            <Controller
              name={IMP_START_DATE}
              control={control}
              render={({ field }) => (
                <DateInput
                  label="노출 시작일시"
                  value={field.value}
                  onChange={field.onChange}
                  required
                  error={hasTriedSubmit && !!errors[IMP_START_DATE]}
                  helperText={hasTriedSubmit ? errors[IMP_START_DATE]?.message : undefined}
                  format="YYYY-MM-DD HH:mm"
                />
              )}
            />

            <Controller
              name={IMP_END_DATE}
              control={control}
              render={({ field }) => (
                <DateInput
                  label="노출 종료일시"
                  value={field.value}
                  onChange={field.onChange}
                  required
                  error={hasTriedSubmit && !!errors[IMP_END_DATE]}
                  helperText={hasTriedSubmit ? errors[IMP_END_DATE]?.message : undefined}
                  format="YYYY-MM-DD HH:mm"
                />
              )}
            />

            <Controller
              name={SHOW_U17}
              control={control}
              render={({ field }) => (
                <RadioInput
                  label="17세 미만 노출 여부"
                  value={field.value || ''}
                  options={yesNoOptions}
                  onChange={field.onChange}
                  required
                  row
                  error={hasTriedSubmit && !!errors[SHOW_U17]}
                  helperText={hasTriedSubmit ? errors[SHOW_U17]?.message : undefined}
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
