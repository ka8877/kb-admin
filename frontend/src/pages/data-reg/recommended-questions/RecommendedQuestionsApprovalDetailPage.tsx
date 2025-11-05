import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

import type { ApprovalRequestItem, RecommendedQuestionItem } from './types';
import { recommendedQuestionColumns } from './components/columns/columns';
import EditableList from '../../../components/common/list/EditableList';
import { useConfirmDialog } from '../../../hooks/useConfirmDialog';
import { ROUTES } from '../../../routes/menu';

// 결재 요청에 포함된 추천 질문 데이터를 가져오는 API
const approvalDetailApi = {
  getRecommendedQuestions: async (approvalId: string): Promise<RecommendedQuestionItem[]> => {
    // 실제로는 결재 요청 ID를 통해 관련된 추천 질문들을 조회
    return Promise.resolve([
      {
        no: 1,
        qst_id: 'Q001',
        service_nm: 'AI 검색',
        qst_ctnt: '하루만 맡겨도 연 2% 받을 수 있어?',
        parent_id: 'M020011',
        parent_nm: '대출 문의',
        imp_start_date: '2025.06.17. 00:00:00',
        imp_end_date: '2025.12.31. 23:59:59',
        updatedAt: '2025.06.17. 14:30:00',
        registeredAt: '2025.06.17. 14:30:00',
        status: 'in_service',
      },
      {
        no: 2,
        qst_id: 'Q002',
        service_nm: 'AI 계산기',
        qst_ctnt: '투자 상품 추천해줘',
        parent_id: null,
        parent_nm: null,
        imp_start_date: '2025.06.17. 00:00:00',
        imp_end_date: '2025.12.31. 23:59:59',
        updatedAt: '2025.06.17. 15:00:00',
        registeredAt: '2025.06.17. 15:00:00',
        status: 'in_service',
      },
    ]);
  },

  approve: async (approvalId: string, selectedIds: (string | number)[]): Promise<void> => {
    // 실제로는 선택된 추천 질문들을 승인 처리
    console.log('승인 처리:', approvalId, selectedIds);
  },

  reject: async (approvalId: string, selectedIds: (string | number)[]): Promise<void> => {
    // 실제로는 선택된 추천 질문들을 거부 처리
    console.log('거부 처리:', approvalId, selectedIds);
  },
};

const RecommendedQuestionsApprovalDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showConfirm } = useConfirmDialog();
  const [data, setData] = useState<RecommendedQuestionItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditMode, setIsEditMode] = useState(false);

  useEffect(() => {
    if (!id) {
      navigate(ROUTES.RECOMMENDED_QUESTIONS_APPROVAL);
      return;
    }

    const fetchData = async () => {
      try {
        setIsLoading(true);
        const result = await approvalDetailApi.getRecommendedQuestions(id);
        setData(result);
      } catch (error) {
        console.error('데이터 로딩 실패:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id, navigate]);

  const handleBack = () => {
    navigate(ROUTES.RECOMMENDED_QUESTIONS_APPROVAL);
  };

  const handleEdit = () => {
    setIsEditMode(true);
  };

  const handleCancelEdit = () => {
    setIsEditMode(false);
  };

  const handleSave = () => {
    // 편집 모드 저장 처리
    console.log('편집 내용 저장');
    setIsEditMode(false);
  };

  const handleDeleteConfirm = async (selectedIds: (string | number)[]) => {
    if (!id) return;

    showConfirm({
      title: '데이터 삭제 확인',
      message: `선택된 ${selectedIds.length}개의 데이터를 삭제하시겠습니까?`,
      onConfirm: async () => {
        try {
          await approvalDetailApi.reject(id, selectedIds);
          console.log('선택된 항목들이 거부되었습니다:', selectedIds);
          // 목록 새로고침 또는 상태 업데이트
          const updatedData = data.filter((item) => !selectedIds.includes(item.qst_id));
          setData(updatedData);
        } catch (error) {
          console.error('거부 처리 실패:', error);
        }
      },
    });
  };

  const handleApproveAll = async () => {
    if (!id) return;

    try {
      const allIds = data.map((item) => item.qst_id);
      await approvalDetailApi.approve(id, allIds);
      console.log('모든 항목이 승인되었습니다.');
      handleBack();
    } catch (error) {
      console.error('승인 처리 실패:', error);
    }
  };

  return (
    <EditableList<RecommendedQuestionItem>
      rows={data}
      columns={recommendedQuestionColumns}
      rowIdGetter="qst_id"
      onBack={handleBack}
      onEdit={handleEdit}
      isEditMode={isEditMode}
      onSave={handleSave}
      onCancel={handleCancelEdit}
      onDeleteConfirm={handleDeleteConfirm}
      readOnlyFields={['no', 'qst_id', 'updatedAt', 'registeredAt']}
    />
  );
};
export default RecommendedQuestionsApprovalDetailPage;
