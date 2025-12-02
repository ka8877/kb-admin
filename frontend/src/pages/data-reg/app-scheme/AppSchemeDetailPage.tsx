import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Box } from '@mui/material';
import type { AppSchemeItem } from '@/pages/data-reg/app-scheme/types';
import DataDetail from '@/components/common/detail/DataDetail';
import PageHeader from '@/components/common/PageHeader';
import { toast } from 'react-toastify';
import {
  selectFieldsConfig,
  dateFieldsConfig,
  readOnlyFieldsConfig,
} from '@/pages/data-reg/app-scheme/data';
import {
  useAppScheme,
  useUpdateAppScheme,
  useDeleteAppScheme,
} from '@/pages/data-reg/app-scheme/hooks';
import { appSchemeColumns } from '@/pages/data-reg/app-scheme/components/columns/columns';
import { createAppSchemeYupSchema } from '@/pages/data-reg/app-scheme/validation/appSchemeValidation';
import { TOAST_MESSAGES } from '@/constants/message';
import { ROUTES } from '@/routes/menu';
import type { ValidationResult } from '@/types/types';

const AppSchemeDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const updateMutation = useUpdateAppScheme();
  const deleteMutation = useDeleteAppScheme();

  const { data, isLoading, refetch } = useAppScheme(id);

  // 편집 가능 여부: 저장 후에는 편집 불가 (결재 요청이 들어갔으므로)
  const [canEdit, setCanEdit] = React.useState(true);

  const handleBack = React.useCallback(() => {
    navigate(ROUTES.APP_SCHEME);
  }, [navigate]);

  const handleDelete = React.useCallback(async () => {
    if (!id) return;

    try {
      await deleteMutation.mutateAsync(id);
      toast.success(TOAST_MESSAGES.DELETE_SUCCESS);
      navigate(-1);
    } catch (error) {
      toast.error(TOAST_MESSAGES.DELETE_FAILED);
    }
  }, [id, deleteMutation, navigate]);

  const handleSave = React.useCallback(
    async (updatedData: AppSchemeItem) => {
      if (!id) return;

      try {
        await updateMutation.mutateAsync({ id, data: updatedData });
        // 저장 성공 후 refetch 및 편집 불가 처리
        await refetch();
        setCanEdit(false); // 저장 후 편집 불가
      } catch (error) {
        console.error('수정 요청 실패:', error);
        throw error;
      }
    },
    [id, updateMutation, refetch],
  );

  // 필수 필드 목록 추출 (yup 스키마에서 required 필드 확인)
  const getRequiredFields = React.useCallback(
    (currentData: AppSchemeItem | undefined): string[] => {
      // 앱스킴 필수 필드: yup 스키마의 required 필드들
      return ['productMenuName', 'description', 'appSchemeLink', 'oneLink', 'startDate', 'endDate'];
    },
    [],
  );

  // Validation 함수
  const handleValidate = React.useCallback(
    (data: AppSchemeItem): Record<string, ValidationResult> => {
      const schema = createAppSchemeYupSchema();
      const results: Record<string, ValidationResult> = {};

      // yup의 동기 validation 사용
      try {
        schema.validateSync(data, { abortEarly: false });
        // 모든 필드가 유효한 경우
        Object.keys(schema.fields).forEach((field) => {
          results[field] = { isValid: true };
        });
      } catch (err: any) {
        // validation 실패 시 에러 메시지 수집
        const errors = err.inner || [];
        const fieldErrors: Record<string, string> = {};

        errors.forEach((error: any) => {
          if (error.path) {
            fieldErrors[error.path] = error.message;
          }
        });

        // 모든 필드에 대해 결과 생성
        Object.keys(schema.fields).forEach((field) => {
          if (fieldErrors[field]) {
            results[field] = { isValid: false, message: fieldErrors[field] };
          } else {
            results[field] = { isValid: true };
          }
        });
      }

      return results;
    },
    [],
  );

  return (
    <Box>
      <PageHeader title="앱스킴 상세" />
      <DataDetail<AppSchemeItem>
        data={data}
        columns={appSchemeColumns}
        isLoading={isLoading}
        rowIdGetter="appSchemeId"
        onBack={handleBack}
        onDelete={handleDelete}
        onSave={handleSave}
        readOnlyFields={readOnlyFieldsConfig}
        selectFields={selectFieldsConfig}
        dateFields={dateFieldsConfig}
        dateFormat="YYYYMMDDHHmmss"
        validator={handleValidate}
        getRequiredFields={getRequiredFields}
        canEdit={canEdit}
      />
    </Box>
  );
};

export default AppSchemeDetailPage;
