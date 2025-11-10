// frontend/src/pages/data-reg/recommended-questions/detail/RecommendedQuestionDetailPage.tsx
import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import type { RecommendedQuestionItem } from './types';
import DataDetail from '../../../components/common/detail/DataDetail';
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

  const handleBack = () => {
    navigate(-1); // 뒤로가기로 이전 상태 유지
  };

  const handleDelete = () => {
    showConfirm({
      title: '삭제 확인',
      message: '정말로 삭제하시겠습니까?',
      confirmText: '삭제',
      cancelText: '취소',
      severity: 'error',
      onConfirm: () => {
        console.log('Delete:', id);
        toast.success('결재를 요청하였습니다.');
        navigate(-1); // 뒤로가기로 이전 상태 유지
      },
    });
  };

  const handleSave = async (updatedData: RecommendedQuestionItem) => {
    if (!id) return;

    try {
      await detailApi.update(id, updatedData);
      console.log('데이터가 성공적으로 저장되었습니다.');
      // 필요시 데이터 다시 조회하거나 상태 업데이트
    } catch (error) {
      console.error('저장 실패:', error);
      throw error; // DataDetail에서 에러 처리
    }
  };

  return (
    <DataDetail<RecommendedQuestionItem>
      data={data}
      columns={recommendedQuestionColumns}
      isLoading={isLoading}
      rowIdGetter="qst_id"
      onBack={handleBack}
      onDelete={handleDelete}
      onSave={handleSave}
      readOnlyFields={['no', 'qst_id', 'updatedAt', 'registeredAt']} // No, qst_id, 날짜 필드는 수정 불가
      selectFields={{
        service_nm: serviceOptions,
        age_grp: ageGroupOptions,
        under_17_yn: under17Options,
        status: statusOptions,
        qst_ctgr: questionCategoryOptions,
      }}
      dateFields={['imp_start_date', 'imp_end_date', 'updatedAt', 'registeredAt']}
      dateFormat="YYYYMMDDHHmmss"
      validator={(data) => RecommendedQuestionValidator.validateAll(data as any)}
    />
  );
};

export default RecommendedQuestionDetailPage;
