// frontend/src/pages/data-reg/recommended-questions/detail/RecommendedQuestionDetailPage.tsx
import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Box } from '@mui/material';
import type { RecommendedQuestionItem } from './types';
import DataDetail from '../../../components/common/detail/DataDetail';
import PageHeader from '../../../components/common/PageHeader';
import { useConfirmDialog } from '../../../hooks/useConfirmDialog';
import { toast } from 'react-toastify';
import {
  statusOptions,
  mockRecommendedQuestionDetail,
  serviceOptions,
  ageGroupOptions,
  under17Options,
  questionCategoryOptions,
} from './data';
import { recommendedQuestionColumns } from './components/columns/columns';
import { RecommendedQuestionValidator } from './validation/recommendedQuestionValidation';
import { CONFIRM_TITLES, CONFIRM_MESSAGES, TOAST_MESSAGES } from '../../../constants/message';

// API 예시
const detailApi = {
  getById: async (id: string): Promise<RecommendedQuestionItem> => {
    // 실제로는 API 호출
    return {
      ...mockRecommendedQuestionDetail,
      qst_id: id,
    };
  },

  update: async (id: string, data: RecommendedQuestionItem): Promise<RecommendedQuestionItem> => {
    // 실제로는 API 호출
    console.log('Updating item:', id, data);
    // 업데이트된 데이터 반환
    return {
      ...data,
      updatedAt: new Date().toISOString().replace(/[-:T]/g, '').slice(0, 14),
    };
  },
};

const RecommendedQuestionDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { showConfirm } = useConfirmDialog();

  const { data, isLoading } = useQuery({
    queryKey: ['recommendedQuestion', id],
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
    async (updatedData: RecommendedQuestionItem) => {
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
    service_nm: serviceOptions,
    age_grp: ageGroupOptions,
    under_17_yn: under17Options,
    status: statusOptions,
    qst_ctgr: questionCategoryOptions,
  };

  const dateFieldsConfig = ['imp_start_date', 'imp_end_date', 'updatedAt', 'registeredAt'];

  const readOnlyFieldsConfig = ['no', 'qst_id', 'updatedAt', 'registeredAt'];

  const handleValidate = (data: RecommendedQuestionItem) =>
    RecommendedQuestionValidator.validateAll(data as any);

  return (
    <Box>
      <PageHeader title="추천질문 상세" />
      <DataDetail<RecommendedQuestionItem>
        data={data}
        columns={recommendedQuestionColumns}
        isLoading={isLoading}
        rowIdGetter="qst_id"
        onBack={handleBack}
        onDelete={handleDelete}
        onSave={handleSave}
        readOnlyFields={readOnlyFieldsConfig}
        selectFields={selectFieldsConfig}
        dateFields={dateFieldsConfig}
        dateFormat="YYYYMMDDHHmmss"
        validator={handleValidate}
      />
    </Box>
  );
};

export default RecommendedQuestionDetailPage;
