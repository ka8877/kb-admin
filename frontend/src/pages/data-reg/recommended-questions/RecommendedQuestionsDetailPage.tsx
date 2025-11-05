// frontend/src/pages/data-reg/recommended-questions/detail/RecommendedQuestionDetailPage.tsx
import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import type { GridColDef } from '@mui/x-data-grid';
import type { RecommendedQuestionItem } from './types';
import DataDetail from '../../../components/common/detail/DataDetail';
import { useConfirmDialog } from '../../../hooks/useConfirmDialog';
import { ROUTES } from '../../../routes/menu';

// 상세 조회용 컬럼 - 일반 목록보다 더 자세한 정보 표시
const detailColumns: GridColDef<RecommendedQuestionItem>[] = [
  { field: 'no', headerName: 'No', width: 80 },
  { field: 'qst_id', headerName: '질문아이디', width: 120 },
  { field: 'service_nm', headerName: '서비스명', width: 140 },
  { field: 'qst_ctnt', headerName: '질문내용', flex: 2, minWidth: 300 },
  { field: 'parent_id', headerName: '부모아이디', width: 140 },
  { field: 'parent_nm', headerName: '부모아이디명', flex: 1, minWidth: 160 },
  { field: 'imp_start_date', headerName: '노출시작일시', width: 180 },
  { field: 'imp_end_date', headerName: '노출종료일시', width: 180 },
  { field: 'updatedAt', headerName: '마지막수정일시', width: 180 },
  { field: 'registeredAt', headerName: '반영일시', width: 180 },
  { field: 'status', headerName: '데이터등록반영상태', width: 160 },
];

// API 예시
const detailApi = {
  getById: async (id: string): Promise<RecommendedQuestionItem> => {
    // 실제로는 API 호출
    return {
      no: 560,
      qst_id: id,
      service_nm: 'AI 검색',
      qst_ctnt: '하루만 맡겨도 연 2% 받을 수 있어?',
      parent_id: 'M020011',
      parent_nm: '26주 적금',
      imp_start_date: '20250501235959',
      imp_end_date: '99991231235959',
      updatedAt: '202501235959',
      registeredAt: '202501235959',
      status: 'in_service',
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
      columns={detailColumns}
      isLoading={isLoading}
      rowIdGetter="qst_id"
      onBack={handleBack}
      onDelete={handleDelete}
      onSave={handleSave}
      readOnlyFields={['no', 'qst_id']} // No와 qst_id는 수정 불가
    />
  );
};

export default RecommendedQuestionDetailPage;
