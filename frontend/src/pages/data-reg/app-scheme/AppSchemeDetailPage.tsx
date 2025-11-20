import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Box } from '@mui/material';
import type { AppSchemeItem } from './types';
import DataDetail from '@/components/common/detail/DataDetail';
import PageHeader from '@/components/common/PageHeader';
import { useConfirmDialog } from '@/hooks/useConfirmDialog';
import { toast } from 'react-toastify';
import { statusOptions, mockAppSchemeDetail } from './data';
import { appSchemeColumns } from './components/columns/columns';
import { createAppSchemeYupSchema } from './validation/appSchemeValidation';
import { CONFIRM_TITLES, CONFIRM_MESSAGES, TOAST_MESSAGES } from '@/constants/message';
import type { ValidationResult } from '@/components/common/detail/DataDetail';

// API 예시
const detailApi = {
  getById: async (id: string): Promise<AppSchemeItem> => {
    // 실제로는 API 호출
    return {
      ...mockAppSchemeDetail,
      id: id,
    };
  },

  update: async (id: string, data: AppSchemeItem): Promise<AppSchemeItem> => {
    // 실제로는 API 호출
    console.log('Updating item:', id, data);
    // 업데이트된 데이터 반환
    return {
      ...data,
      updatedAt: new Date().toISOString().replace(/[-:T]/g, '').slice(0, 14),
    };
  },
};

const AppSchemeDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { showConfirm } = useConfirmDialog();

  const { data, isLoading } = useQuery({
    queryKey: ['appScheme', id],
    queryFn: () => (id ? detailApi.getById(id) : Promise.reject('Invalid ID')),
    enabled: !!id,
  });

  const handleBack = React.useCallback(() => {
    navigate(-1);
  }, [navigate]);

  const handleDelete = React.useCallback(() => {
    showConfirm({
      title: CONFIRM_TITLES.DELETE,
      message: CONFIRM_MESSAGES.DELETE,
      confirmText: '삭제',
      cancelText: '취소',
      severity: 'error',
      onConfirm: () => {
        console.log('Delete:', id);
        toast.success(TOAST_MESSAGES.DELETE_APPROVAL_REQUESTED);
        navigate(-1);
      },
    });
  }, [showConfirm, id, navigate]);

  const handleSave = React.useCallback(
    async (updatedData: AppSchemeItem) => {
      if (!id) return;

      try {
        await detailApi.update(id, updatedData);
        console.log('데이터가 성공적으로 저장되었습니다.');
      } catch (error) {
        console.error('저장 실패:', error);
        throw error;
      }
    },
    [id],
  );

  const selectFieldsConfig = {
    status: statusOptions,
  };

  const dateFieldsConfig = ['start_date', 'end_date', 'updatedAt', 'registeredAt'];

  const readOnlyFieldsConfig = ['no', 'id', 'updatedAt', 'registeredAt'];

  // 필수 필드 목록 추출 (yup 스키마에서 required 필드 확인)
  const getRequiredFields = React.useCallback((currentData: AppSchemeItem | undefined): string[] => {
    // 앱스킴 필수 필드: yup 스키마의 required 필드들
    return [
      'product_menu_name',
      'description',
      'app_scheme_link',
      'one_link',
      'start_date',
      'end_date',
    ];
  }, []);

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
        rowIdGetter="id"
        onBack={handleBack}
        onDelete={handleDelete}
        onSave={handleSave}
        readOnlyFields={readOnlyFieldsConfig}
        selectFields={selectFieldsConfig}
        dateFields={dateFieldsConfig}
        dateFormat="YYYYMMDDHHmmss"
        validator={handleValidate}
        getRequiredFields={getRequiredFields}
      />
    </Box>
  );
};

export default AppSchemeDetailPage;
