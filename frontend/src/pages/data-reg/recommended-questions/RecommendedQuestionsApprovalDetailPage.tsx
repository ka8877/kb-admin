import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';

import type { RecommendedQuestionItem } from './types';
import { recommendedQuestionColumns } from './components/columns/columns';
import EditableList from '../../../components/common/list/EditableList';
import { ROUTES } from '../../../routes/menu';
import {
  ageGroupOptions,
  mockApprovalDetailQuestions,
  questionCategoryOptions,
  serviceOptions,
  statusOptions,
  under17Options,
} from './data';
import { useConfirmDialog } from '../../../hooks/useConfirmDialog';
import { CONFIRM_TITLES, CONFIRM_MESSAGES } from '../../../constants/message';
import { RecommendedQuestionValidator } from './validation';

// 결재 요청에 포함된 추천 질문 데이터를 가져오는 API
const approvalDetailApi = {
  getRecommendedQuestions: async (approvalId: string): Promise<RecommendedQuestionItem[]> => {
    // 실제로는 결재 요청 ID를 통해 관련된 추천 질문들을 조회
    return Promise.resolve(mockApprovalDetailQuestions);
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
  const location = useLocation();
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
    // ApprovalPage의 저장된 상태로 돌아가기
    const savedApprovalState = sessionStorage.getItem('approval_page_state');
    console.log('🔍 DetailPage handleBack - savedApprovalState:', savedApprovalState);

    if (savedApprovalState) {
      // ApprovalPage의 이전 상태(검색조건 포함)로 복원
      console.log(
        '🔍 DetailPage handleBack - navigating to saved approval state:',
        savedApprovalState,
      );
      sessionStorage.removeItem('approval_page_state'); // 사용 후 정리
      navigate(savedApprovalState);
    } else {
      // 저장된 상태가 없으면 기본 결재 요청 목록으로
      console.log('🔍 DetailPage handleBack - no saved state, going to default approval page');
      navigate(ROUTES.RECOMMENDED_QUESTIONS_APPROVAL);
    }
  };

  const handleEdit = () => {
    setIsEditMode(true);
  };

  const handleCancelEdit = () => {
    setIsEditMode(false);
  };

  const handleSave = () => {
    showConfirm({
      title: CONFIRM_TITLES.APPROVAL_REQUEST,
      message: CONFIRM_MESSAGES.APPROVAL_REQUEST,
      onConfirm: () => {
        // 편집 모드 저장 처리
        console.log('편집 내용 저장 및 결재 요청');
        setIsEditMode(false);
        // TODO: 실제 저장 및 결재 요청 API 호출
      },
    });
  };

  const handleDeleteConfirm = async (selectedIds: (string | number)[]) => {
    if (!id) return;

    try {
      await approvalDetailApi.reject(id, selectedIds);
      console.log('선택된 항목들이 거부되었습니다:', selectedIds);
      // 목록 새로고침 또는 상태 업데이트
      const updatedData = data.filter((item) => !selectedIds.includes(item.qst_id));
      setData(updatedData);
    } catch (error) {
      console.error('거부 처리 실패:', error);
    }
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
export default RecommendedQuestionsApprovalDetailPage;
