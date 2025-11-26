import React, { useCallback, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Box } from '@mui/material';
import type { AppSchemeItem } from './types';
import { appSchemeColumns } from './components/columns/columns';
import EditableList from '@/components/common/list/EditableList';
import PageHeader from '@/components/common/PageHeader';
import { ROUTES } from '@/routes/menu';
import { mockAppSchemes, statusOptions } from './data';
import { useConfirmDialog } from '@/hooks/useConfirmDialog';
import { CONFIRM_TITLES, CONFIRM_MESSAGES, TOAST_MESSAGES } from '@/constants/message';
import { createAppSchemeYupSchema } from './validation/appSchemeValidation';
import type { ValidationResult } from '@/types/types';
import { toast } from 'react-toastify';

// 결재 요청에 포함된 앱스킴 데이터를 가져오는 API
const approvalDetailApi = {
  getAppSchemes: async (approvalId: string): Promise<AppSchemeItem[]> => {
    // 실제로는 결재 요청 ID를 통해 관련된 앱스킴들을 조회
    return Promise.resolve(mockAppSchemes);
  },

  approve: async (approvalId: string, selectedIds: (string | number)[]): Promise<void> => {
    // 실제로는 선택된 앱스킴들을 승인 처리
    console.log('승인 처리:', approvalId, selectedIds);
  },

  reject: async (approvalId: string, selectedIds: (string | number)[]): Promise<void> => {
    // 실제로는 선택된 앱스킴들을 거부 처리
    console.log('거부 처리:', approvalId, selectedIds);
  },
};

const AppSchemeApprovalDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showConfirm } = useConfirmDialog();
  const queryClient = useQueryClient();
  const [isEditMode, setIsEditMode] = useState(false);

  // React Query로 데이터 fetching (자동 캐싱, loading 상태 관리)
  const { data = [], isLoading } = useQuery({
    queryKey: ['appSchemeApprovalDetail', id],
    queryFn: () => {
      if (!id) {
        navigate(ROUTES.APP_SCHEME_APPROVAL);
        return Promise.reject('Invalid ID');
      }
      return approvalDetailApi.getAppSchemes(id);
    },
    enabled: !!id,
  });

  // sessionStorage 접근 최적화 (useMemo로 한 번만 읽기)
  const savedApprovalState = useMemo(() => sessionStorage.getItem('approval_page_state'), []);

  // Mutation for reject (삭제)
  const rejectMutation = useMutation({
    mutationFn: (selectedIds: (string | number)[]) => {
      if (!id) return Promise.reject('Invalid ID');
      return approvalDetailApi.reject(id, selectedIds);
    },
    onSuccess: () => {
      // React Query 캐시 무효화하여 데이터 자동 refetch
      queryClient.invalidateQueries({ queryKey: ['appSchemeApprovalDetail', id] });
      toast.success(TOAST_MESSAGES.DELETE_SUCCESS);
      setIsEditMode(false);
      console.log('선택된 항목들이 거부되었습니다.');
    },
    onError: (error) => {
      console.error('거부 처리 실패:', error);
    },
  });

  // Mutation for approve all
  const approveMutation = useMutation({
    mutationFn: () => {
      if (!id) return Promise.reject('Invalid ID');
      const allIds = data.map((item) => item.id);
      return approvalDetailApi.approve(id, allIds);
    },
    onSuccess: () => {
      console.log('모든 항목이 승인되었습니다.');
      handleBack();
    },
    onError: (error) => {
      console.error('승인 처리 실패:', error);
    },
  });

  const handleBack = useCallback(() => {
    console.log('🔍 DetailPage handleBack - savedApprovalState:', savedApprovalState);

    if (savedApprovalState) {
      console.log(
        '🔍 DetailPage handleBack - navigating to saved approval state:',
        savedApprovalState,
      );
      sessionStorage.removeItem('approval_page_state');
      navigate(savedApprovalState);
    } else {
      console.log('🔍 DetailPage handleBack - no saved state, going to default approval page');
      navigate(ROUTES.APP_SCHEME_APPROVAL);
    }
  }, [savedApprovalState, navigate]);

  const handleEdit = useCallback(() => {
    setIsEditMode(true);
  }, []);

  const handleCancelEdit = useCallback(() => {
    setIsEditMode(false);
  }, []);

  const handleSave = useCallback(() => {
    showConfirm({
      title: CONFIRM_TITLES.APPROVAL_REQUEST,
      message: CONFIRM_MESSAGES.APPROVAL_REQUEST,
      onConfirm: () => {
        console.log('편집 내용 저장 및 결재 요청');
        toast.success(TOAST_MESSAGES.UPDATE_REQUESTED);
        setIsEditMode(false);
        // TODO: 실제 저장 및 결재 요청 API 호출
      },
    });
  }, [showConfirm]);

  const handleDeleteConfirm = useCallback(
    async (selectedIds: (string | number)[]) => {
      rejectMutation.mutate(selectedIds);
    },
    [rejectMutation],
  );

  const handleApproveAll = useCallback(() => {
    approveMutation.mutate();
  }, [approveMutation]);

  const selectFieldsConfig = {
    status: statusOptions,
  };

  const dateFieldsConfig = ['start_date', 'end_date', 'updatedAt', 'registeredAt'];

  const readOnlyFieldsConfig = ['no', 'id', 'updatedAt', 'registeredAt'];

  // 필수 필드 목록 추출 (yup 스키마에서 required 필드 확인)
  const getRequiredFields = useCallback((row: AppSchemeItem): string[] => {
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
  const handleValidate = useCallback((data: AppSchemeItem): Record<string, ValidationResult> => {
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
  }, []);

  return (
    <Box>
      <PageHeader title="앱스킴 결재 상세" />
      <EditableList<AppSchemeItem>
        rows={data}
        columns={appSchemeColumns}
        rowIdGetter="id"
        isLoading={isLoading}
        onBack={handleBack}
        onEdit={handleEdit}
        isEditMode={isEditMode}
        onSave={handleSave}
        onCancel={handleCancelEdit}
        onDeleteConfirm={handleDeleteConfirm}
        readOnlyFields={readOnlyFieldsConfig}
        selectFields={selectFieldsConfig}
        dateFields={dateFieldsConfig}
        dateFormat="YYYYMMDDHHmmss"
        validator={handleValidate}
        externalRows={data}
        getRequiredFields={getRequiredFields}
      />
    </Box>
  );
};
export default AppSchemeApprovalDetailPage;
