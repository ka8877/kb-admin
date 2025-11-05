import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import type { GridColDef } from '@mui/x-data-grid';
import type { RowItem } from './types';
import DataDetail from '../../../components/common/detail/DataDetail';
import { useConfirmDialog } from '../../../hooks/useConfirmDialog';
import { ROUTES } from '../../../routes/menu';

// 상세 조회용 컬럼 - 서비스명 관리를 위한 상세 정보 표시
const detailColumns: GridColDef<RowItem>[] = [
  { field: 'no', headerName: 'No', width: 80 },
  { field: 'category_nm', headerName: '카테고리명', width: 200 },
  { field: 'service_cd', headerName: '서비스코드', width: 220 },
  {
    field: 'status_display',
    headerName: '상태',
    width: 140,
    valueGetter: (params) => (params.row.status_code === 'Y' ? '활성' : '비활성'),
  },
];

// API 예시 (하드코딩)
const detailApi = {
  getById: async (id: string): Promise<RowItem> => {
    return {
      no: Number(id) || 1,
      category_nm: '적금',
      service_cd: id,
      status_code: 'Y',
    };
  },

  update: async (id: string, data: RowItem): Promise<RowItem> => {
    console.log('Updating item:', id, data);
    return {
      ...data,
    };
  },
};

const ServiceNameDetailPage: React.FC = () => {
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

  const handleSave = async (updatedData: RowItem) => {
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
    <DataDetail<RowItem>
      data={data}
      columns={detailColumns}
      isLoading={isLoading}
      rowIdGetter="service_cd"
      onBack={handleBack}
      onDelete={handleDelete}
      onSave={handleSave}
      readOnlyFields={['no', 'service_cd']} // No와 service_cd는 수정 불가
    />
  );
};

export default ServiceNameDetailPage;
