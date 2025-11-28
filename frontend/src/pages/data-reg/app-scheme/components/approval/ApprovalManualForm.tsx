import React, { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, TextField, Stack } from '@mui/material';
import { useForm, Controller, type Resolver } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import dayjs, { Dayjs } from 'dayjs';
import CreateDataActions from '@/components/common/actions/CreateDataActions';
import DateInput from '@/components/common/input/DateInput';
import { useConfirmDialog } from '@/hooks/useConfirmDialog';
import { CONFIRM_MESSAGES, CONFIRM_TITLES, TOAST_MESSAGES } from '@/constants/message';
import { createAppSchemeYupSchema } from '../../validation';
import { useCreateAppScheme } from '../../hooks';
import { transformToApiFormat } from '../../api';
import { toast } from 'react-toastify';
import { ROUTES } from '@/routes/menu';

// 앱스킴 폼 검증 스키마
const schema = createAppSchemeYupSchema();

type FormData = {
  product_menu_name: string;
  description: string;
  app_scheme_link: string;
  one_link: string;
  goods_name_list?: string | null;
  parent_id?: string | null;
  parent_title?: string | null;
  start_date: Dayjs | null;
  end_date: Dayjs | null;
};

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
    defaultValues: {
      product_menu_name: '',
      description: '',
      app_scheme_link: '',
      one_link: '',
      goods_name_list: null,
      parent_id: null,
      parent_title: null,
      start_date:dayjs().add(30, 'minute'), // 현재 일시 + 30분
      end_date: dayjs('9999-12-31 00:00'), // 9999-12-31 0시로 초기화
    },
  });

  const onSubmit = useCallback(
    async (data: FormData) => {
      try {
        // 폼 데이터를 API 형식으로 변환 (공통 함수 사용)
        const apiData = transformToApiFormat({
          product_menu_name: data.product_menu_name,
          description: data.description,
          app_scheme_link: data.app_scheme_link,
          one_link: data.one_link,
          goods_name_list: data.goods_name_list,
          parent_id: data.parent_id,
          parent_title: data.parent_title,
          start_date: data.start_date,
          end_date: data.end_date,
        });

        await createMutation.mutateAsync(apiData);
        toast.success(TOAST_MESSAGES.SAVE_SUCCESS);

        // 성공 시 이전 페이지로 이동 또는 목록 페이지로 이동
        const returnUrl = sessionStorage.getItem('approval_return_url');
        if (returnUrl) {
          navigate(returnUrl);
          sessionStorage.removeItem('approval_return_url');
        } else {
          navigate(ROUTES.APP_SCHEME);
        }
      } catch (error) {
        console.error('앱스킴 생성 실패:', error);
        toast.error(TOAST_MESSAGES.SAVE_FAILED);
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
              name="product_menu_name"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="AI검색 노출버튼명"
                  placeholder="AI검색 노출버튼명을 입력하세요"
                  fullWidth
                  required
                  inputProps={{ maxLength: 200 }}
                  error={hasTriedSubmit && !!errors.product_menu_name}
                  helperText={hasTriedSubmit ? errors.product_menu_name?.message : undefined}
                />
              )}
            />

            <Controller
              name="description"
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
                  error={hasTriedSubmit && !!errors.description}
                  helperText={hasTriedSubmit ? errors.description?.message : undefined}
                />
              )}
            />

            <Controller
              name="app_scheme_link"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="앱스킴 주소"
                  placeholder="앱스킴 주소를 입력하세요 (예: https://appscheme.to/abcd)"
                  fullWidth
                  required
                  inputProps={{ maxLength: 500 }}
                  error={hasTriedSubmit && !!errors.app_scheme_link}
                  helperText={hasTriedSubmit ? errors.app_scheme_link?.message : undefined}
                />
              )}
            />

            <Controller
              name="one_link"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="원링크 주소"
                  placeholder="원링크 주소를 입력하세요 (예: https://onelink.to/abcd)"
                  fullWidth
                  required
                  inputProps={{ maxLength: 500 }}
                  error={hasTriedSubmit && !!errors.one_link}
                  helperText={hasTriedSubmit ? errors.one_link?.message : undefined}
                />
              )}
            />

            <Controller
              name="goods_name_list"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="연관 상품/서비스 리스트"
                  placeholder="연관 상품/서비스 리스트를 입력하세요 (예: 자유적금, 햇살론 15)"
                  fullWidth
                  inputProps={{ maxLength: 200 }}
                  error={hasTriedSubmit && !!errors.goods_name_list}
                  helperText={hasTriedSubmit ? errors.goods_name_list?.message : undefined}
                />
              )}
            />

            <Controller
              name="parent_id"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="MID"
                  placeholder="MID를 입력하세요 (예: M020011)"
                  fullWidth
                  inputProps={{ maxLength: 50 }}
                  error={hasTriedSubmit && !!errors.parent_id}
                  helperText={hasTriedSubmit ? errors.parent_id?.message : undefined}
                />
              )}
            />

            <Controller
              name="parent_title"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="MID 상품/서비스명"
                  placeholder="MID 상품/서비스명을 입력하세요 (예: 26주 적금)"
                  fullWidth
                  inputProps={{ maxLength: 200 }}
                  error={hasTriedSubmit && !!errors.parent_title}
                  helperText={hasTriedSubmit ? errors.parent_title?.message : undefined}
                />
              )}
            />

            <Controller
              name="start_date"
              control={control}
              render={({ field }) => (
                <DateInput
                  label="노출 시작 일시"
                  value={field.value}
                  onChange={field.onChange}
                  required
                  error={hasTriedSubmit && !!errors.start_date}
                  helperText={hasTriedSubmit ? errors.start_date?.message : undefined}
                  format="YYYY-MM-DD HH:mm"
                />
              )}
            />

            <Controller
              name="end_date"
              control={control}
              render={({ field }) => (
                <DateInput
                  label="노출 종료 일시"
                  value={field.value}
                  onChange={field.onChange}
                  required
                  error={hasTriedSubmit && !!errors.end_date}
                  helperText={hasTriedSubmit ? errors.end_date?.message : undefined}
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

