import React, { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, TextField, Stack } from '@mui/material';
import { useForm, Controller, type Resolver } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import CreateDataActions from '@/components/common/actions/CreateDataActions';
import DateInput from '@/components/common/input/DateInput'; // Re-import
import { useConfirmDialog } from '@/hooks/useConfirmDialog';
import { CONFIRM_MESSAGES, CONFIRM_TITLES } from '@/constants/message';
import { createAppSchemeYupSchema } from '@/pages/data-reg/app-scheme/validation';
import { useCreateAppScheme } from '@/pages/data-reg/app-scheme/hooks';
import { transformToApiFormat } from '@/pages/data-reg/app-scheme/api';
import { ROUTES } from '@/routes/menu';
import type { FormData } from '@/pages/data-reg/app-scheme/types';
import {
  defaultApprovalData,
  PRODUCT_MENU_NAME,
  DESCRIPTION,
  APP_SCHEME_LINK,
  ONE_LINK,
  GOODS_NAME_LIST,
  PARENT_ID,
  PARENT_TITLE,
  START_DATE,
  END_DATE,
} from '@/pages/data-reg/app-scheme/data';
import { APPROVAL_RETURN_URL } from '@/constants/options';

// 앱스킴 폼 검증 스키마
const schema = createAppSchemeYupSchema();

const ApprovalManualForm: React.FC = () => {
  const navigate = useNavigate();
  const { showConfirm } = useConfirmDialog();
  const createMutation = useCreateAppScheme();

  // validation 모드 상태 관리
  const [hasTriedSubmit, setHasTriedSubmit] = React.useState(false);

  const {
    control,
    handleSubmit,
    trigger,
    formState: { errors },
  } = useForm<FormData>({
    resolver: yupResolver(schema) as unknown as Resolver<FormData>,
    mode: 'onChange', // 항상 실시간 validation 활성화
    defaultValues: defaultApprovalData,
  });

  const onSubmit = useCallback(
    async (data: FormData) => {
      try {
        // 폼 데이터를 API 형식으로 변환 (공통 함수 사용)
        const apiData = transformToApiFormat({
          [PRODUCT_MENU_NAME]: data[PRODUCT_MENU_NAME],
          [DESCRIPTION]: data[DESCRIPTION],
          [APP_SCHEME_LINK]: data[APP_SCHEME_LINK],
          [ONE_LINK]: data[ONE_LINK],
          [GOODS_NAME_LIST]: data[GOODS_NAME_LIST],
          [PARENT_ID]: data[PARENT_ID],
          [PARENT_TITLE]: data[PARENT_TITLE],
          [START_DATE]: data[START_DATE],
          [END_DATE]: data[END_DATE],
        });

        await createMutation.mutateAsync(apiData);
        // toast.success(TOAST_MESSAGES.SAVE_SUCCESS);

        // 성공 시 이전 페이지로 이동 또는 목록 페이지로 이동
        const returnUrl = sessionStorage.getItem(APPROVAL_RETURN_URL);
        if (returnUrl) {
          navigate(returnUrl);
          sessionStorage.removeItem(APPROVAL_RETURN_URL);
        } else {
          navigate(ROUTES.APP_SCHEME);
        }
      } catch (error) {
        console.error('앱스킴 생성 실패:', error);
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
          const executeSubmit = async () => {
            await handleSubmit(onSubmit)();
          };
          executeSubmit();
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
              name={PRODUCT_MENU_NAME}
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="AI 검색 노출 버튼명"
                  placeholder="AI 검색 노출 버튼명을 입력하세요"
                  fullWidth
                  required
                  inputProps={{ maxLength: 200 }}
                  error={hasTriedSubmit && !!errors[PRODUCT_MENU_NAME]}
                  helperText={hasTriedSubmit ? errors[PRODUCT_MENU_NAME]?.message : undefined}
                />
              )}
            />

            <Controller
              name={DESCRIPTION}
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="앱스킴 설명"
                  placeholder="앱스킴 설명을 입력하세요"
                  multiline
                  rows={4}
                  fullWidth
                  required
                  inputProps={{ maxLength: 2000 }}
                  error={hasTriedSubmit && !!errors[DESCRIPTION]}
                  helperText={hasTriedSubmit ? errors[DESCRIPTION]?.message : undefined}
                />
              )}
            />

            <Controller
              name={APP_SCHEME_LINK}
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="앱스킴 주소"
                  placeholder="앱스킴 주소를 입력하세요 (예: kakaobank://mini?type=pocket_money_message_card)"
                  fullWidth
                  required
                  inputProps={{ maxLength: 500 }}
                  error={hasTriedSubmit && !!errors[APP_SCHEME_LINK]}
                  helperText={hasTriedSubmit ? errors[APP_SCHEME_LINK]?.message : undefined}
                />
              )}
            />

            <Controller
              name={ONE_LINK}
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="원링크 주소"
                  placeholder="원링크 주소를 입력하세요 (예: https://kakaobank.onelink.me/4YTm/crdkrh44)"
                  fullWidth
                  required
                  inputProps={{ maxLength: 500 }}
                  error={hasTriedSubmit && !!errors[ONE_LINK]}
                  helperText={hasTriedSubmit ? errors[ONE_LINK]?.message : undefined}
                />
              )}
            />

            <Controller
              name={GOODS_NAME_LIST}
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="연관 상품/서비스 리스트"
                  placeholder="연관 상품/서비스 리스트를 입력하세요 (AI 금융 계산기 필수, 예: 자유적금, 햇살론 15)"
                  fullWidth
                  inputProps={{ maxLength: 200 }}
                  error={hasTriedSubmit && !!errors[GOODS_NAME_LIST]}
                  helperText={hasTriedSubmit ? errors[GOODS_NAME_LIST]?.message : undefined}
                />
              )}
            />

            <Controller
              name={PARENT_ID}
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="MID"
                  placeholder="MID를 입력하세요 (예: M020011)"
                  fullWidth
                  inputProps={{ maxLength: 50 }}
                  error={hasTriedSubmit && !!errors[PARENT_ID]}
                  helperText={hasTriedSubmit ? errors[PARENT_ID]?.message : undefined}
                />
              )}
            />

            <Controller
              name={PARENT_TITLE}
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="MID 상품/서비스명"
                  placeholder="MID 상품/서비스명을 입력하세요 (예: 이체/출금)"
                  fullWidth
                  inputProps={{ maxLength: 200 }}
                  error={hasTriedSubmit && !!errors[PARENT_TITLE]}
                  helperText={hasTriedSubmit ? errors[PARENT_TITLE]?.message : undefined}
                />
              )}
            />

            <Controller
              name={START_DATE}
              control={control}
              render={({ field }) => (
                <DateInput
                  label="노출 시작일시"
                  value={field.value}
                  onChange={field.onChange}
                  required
                  error={hasTriedSubmit && !!errors[START_DATE]}
                  helperText={hasTriedSubmit ? errors[START_DATE]?.message : undefined}
                  format="YYYY-MM-DD HH:mm"
                />
              )}
            />

            <Controller
              name={END_DATE}
              control={control}
              render={({ field }) => (
                <DateInput
                  label="노출 종료일시"
                  value={field.value}
                  onChange={field.onChange}
                  required
                  error={hasTriedSubmit && !!errors[END_DATE]}
                  helperText={hasTriedSubmit ? errors[END_DATE]?.message : undefined}
                  format="YYYY-MM-DD HH:mm"
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
