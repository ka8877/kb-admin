import React, { useCallback, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Box } from '@mui/material';
import type { RecommendedQuestionItem } from './types';
import { recommendedQuestionColumns } from './components/columns/columns';
import EditableList from '@/components/common/list/EditableList';
import PageHeader from '@/components/common/PageHeader';
import { ROUTES } from '@/routes/menu';
import {
  ageGroupOptions,
  mockApprovalDetailQuestions,
  questionCategoryGroupedOptions,
  questionCategoryOptions,
  serviceOptions,
  statusOptions,
  under17Options,
} from './data';
import { useConfirmDialog } from '@/hooks/useConfirmDialog';
import { CONFIRM_TITLES, CONFIRM_MESSAGES } from '@/constants/message';
import { RecommendedQuestionValidator } from './validation/recommendedQuestionValidation';

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
  const { showConfirm } = useConfirmDialog();
  const queryClient = useQueryClient();
  const [isEditMode, setIsEditMode] = useState(false);

  // React Query로 데이터 fetching (자동 캐싱, loading 상태 관리)
  const { data = [] } = useQuery({
    queryKey: ['approvalDetail', id],
    queryFn: () => {
      if (!id) {
        navigate(ROUTES.RECOMMENDED_QUESTIONS_APPROVAL);
        return Promise.reject('Invalid ID');
      }
      return approvalDetailApi.getRecommendedQuestions(id);
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
      queryClient.invalidateQueries({ queryKey: ['approvalDetail', id] });
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
      const allIds = data.map((item) => item.qst_id);
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
      navigate(ROUTES.RECOMMENDED_QUESTIONS_APPROVAL);
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

  const questionCategoryOptionsByService = useMemo(() => {
    return questionCategoryGroupedOptions.reduce<
      Record<string, { label: string; value: string }[]>
    >((acc, group) => {
      acc[group.groupValue] = group.options;
      return acc;
    }, {});
  }, []);

  const getQuestionCategoryOptionsByService = useCallback(
    (serviceCode: string | undefined) => {
      if (!serviceCode) return [];
      return questionCategoryOptionsByService[serviceCode] ?? [];
    },
    [questionCategoryOptionsByService],
  );

  const dynamicQuestionCategoryOptionsGetter = useMemo(() => {
    if (!isEditMode) {
      return undefined;
    }
    return (row: RecommendedQuestionItem) => getQuestionCategoryOptionsByService(row.service_nm);
  }, [getQuestionCategoryOptionsByService, isEditMode]);

  const handleRowSanitizer = useCallback(
    (newRow: RecommendedQuestionItem, oldRow: RecommendedQuestionItem) => {
      if (newRow.service_nm !== oldRow.service_nm) {
        return {
          ...newRow,
          qst_ctgr: '',
        };
      }
      return newRow;
    },
    [],
  );

  const selectFieldsConfig = {
    service_nm: serviceOptions,
    age_grp: ageGroupOptions,
    under_17_yn: under17Options,
    status: statusOptions,
    qst_ctgr: isEditMode ? [] : questionCategoryOptions,
  };

  const dateFieldsConfig = ['imp_start_date', 'imp_end_date', 'updatedAt', 'registeredAt'];

  const readOnlyFieldsConfig = ['no', 'qst_id', 'updatedAt', 'registeredAt'];

  // Validation 함수
  const handleValidate = (data: RecommendedQuestionItem) => {
    return RecommendedQuestionValidator.validateAll(data);
  };

  return (
    <Box>
      <PageHeader title="추천질문 결재 상세" />
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
        readOnlyFields={readOnlyFieldsConfig}
        selectFields={selectFieldsConfig}
        dateFields={dateFieldsConfig}
        dateFormat="YYYYMMDDHHmmss"
        validator={handleValidate}
        getDynamicSelectOptions={dynamicQuestionCategoryOptionsGetter}
        onProcessRowUpdate={handleRowSanitizer}
        externalRows={data}
      />
    </Box>
  );
};
export default RecommendedQuestionsApprovalDetailPage;
