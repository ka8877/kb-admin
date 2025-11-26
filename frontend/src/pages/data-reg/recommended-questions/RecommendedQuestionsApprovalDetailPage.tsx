import React, { useCallback, useMemo, useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Box } from '@mui/material';
import type { RecommendedQuestionItem } from './types';
import { recommendedQuestionColumns } from './components/columns/columns';
import EditableList from '@/components/common/list/EditableList';
import PageHeader from '@/components/common/PageHeader';
import { ROUTES } from '@/routes/menu';
import {
  loadServiceOptions,
  loadAgeGroupOptions,
  loadQuestionCategoryGroupedOptions,
  questionCategoryOptions,
  statusOptions,
  under17Options,
} from './data';
import { useConfirmDialog } from '@/hooks/useConfirmDialog';
import { useAlertDialog } from '@/hooks/useAlertDialog';
import { CONFIRM_TITLES, CONFIRM_MESSAGES, TOAST_MESSAGES } from '@/constants/message';
import { RecommendedQuestionValidator } from './validation/recommendedQuestionValidation';
import { toast } from 'react-toastify';
import { useApprovalDetailQuestions } from './hooks';
import { updateApprovalDetailList, deleteApprovalDetailListItems, fetchApprovalRequest, updateApprovalRequestStatus } from './api';
import { useQuery } from '@tanstack/react-query';
import { formatDateForStorage } from '@/utils/dateUtils';
import { APPROVAL_STATUS_OPTIONS } from '@/constants/options';
import GlobalLoadingSpinner from '@/components/common/spinner/GlobalLoadingSpinner';

const RecommendedQuestionsApprovalDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showConfirm } = useConfirmDialog();
  const { showAlert } = useAlertDialog();
  const queryClient = useQueryClient();
  const [isEditMode, setIsEditMode] = useState(false);
  const [serviceOptions, setServiceOptions] = useState<{ label: string; value: string }[]>([]);
  const [ageGroupOptions, setAgeGroupOptions] = useState<{ label: string; value: string }[]>([]);
  const [questionCategoryGroupedOptions, setQuestionCategoryGroupedOptions] = useState<
    Array<{ groupLabel: string; groupValue: string; options: Array<{ label: string; value: string }> }>
  >([]);

  // 옵션 데이터 로드
  useEffect(() => {
    const loadOptions = async () => {
      const [services, ageGroups, categories] = await Promise.all([
        loadServiceOptions(),
        loadAgeGroupOptions(),
        loadQuestionCategoryGroupedOptions(),
      ]);
      setServiceOptions(services);
      setAgeGroupOptions(ageGroups);
      setQuestionCategoryGroupedOptions(categories);
    };
    loadOptions();
  }, []);

  // React Query로 데이터 fetching (자동 캐싱, loading 상태 관리)
  const { data = [], isLoading } = useApprovalDetailQuestions(id);

  // 승인 요청 정보 조회 (status 확인용)
  const { data: approvalRequest } = useQuery({
    queryKey: ['approval-request', id],
    queryFn: () => fetchApprovalRequest(id!),
    enabled: !!id,
  });

  // status가 done_review 또는 in_review인 경우 편집 불가
  // 저장 성공 후에도 편집 불가로 설정
  const [canEditState, setCanEditState] = useState(true);
  const canEdit = useMemo(() => {
    if (!canEditState) return false; // 저장 후 편집 불가
    if (!approvalRequest) return true; // 데이터 로딩 전에는 편집 가능으로 설정
    const status = approvalRequest.status;
    return status !== 'done_review' && status !== 'in_review';
  }, [approvalRequest, canEditState]);

  // 초기 데이터 저장 (편집 전 원본 데이터)
  const initialDataRef = React.useRef<RecommendedQuestionItem[]>([]);
  
  useEffect(() => {
    if (data.length > 0 && !isEditMode) {
      // 편집 모드가 아닐 때 초기 데이터 저장
      initialDataRef.current = JSON.parse(JSON.stringify(data));
    }
  }, [data, isEditMode]);

  // sessionStorage 접근 최적화 (useMemo로 한 번만 읽기)
  const savedApprovalState = useMemo(() => sessionStorage.getItem('approval_page_state'), []);

  // Mutation for reject (삭제)
  const rejectMutation = useMutation({
    mutationFn: async (selectedIds: (string | number)[]) => {
      if (!id) return Promise.reject('Invalid ID');
      // 승인 요청 상세 목록에서 선택된 항목 삭제
      await deleteApprovalDetailListItems(id, selectedIds);
    },
    onSuccess: () => {
      // React Query 캐시 무효화하여 데이터 자동 refetch
      queryClient.invalidateQueries({ queryKey: ['approval-detail-questions', id] });
      toast.success(TOAST_MESSAGES.SAVE_SUCCESS);
      // 편집 모드 유지 (setIsEditMode(false) 제거)
      // 체크박스 선택은 EditableList에서 externalRows 변경 시 자동 초기화됨
      console.log('선택된 항목들이 삭제되었습니다.');
    },
    onError: (error) => {
      console.error('삭제 처리 실패:', error);
      toast.error(TOAST_MESSAGES.DELETE_FAILED);
    },
  });

  // Mutation for approve all
  const approveMutation = useMutation({
    mutationFn: async () => {
      if (!id) return Promise.reject('Invalid ID');
      const allIds = data.map((item) => item.qst_id);
      // TODO: 실제 승인 처리 API 호출
      console.log('승인 처리:', id, allIds);
      return Promise.resolve();
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

  const dateFieldsConfig = ['imp_start_date', 'imp_end_date', 'updatedAt', 'registeredAt'];
  
  // 삭제 요청인 경우 모든 필드를 읽기 전용으로 설정
  const readOnlyFieldsConfig = useMemo(() => {
    const baseReadOnlyFields = ['no', 'qst_id', 'updatedAt', 'registeredAt'];
    
    // 삭제 요청인 경우 모든 컬럼 필드를 읽기 전용으로 추가
    if (approvalRequest?.approval_form === 'data_deletion' && isEditMode) {
      const allFields = recommendedQuestionColumns.map((col) => col.field);
      return [...new Set([...baseReadOnlyFields, ...allFields])];
    }
    
    return baseReadOnlyFields;
  }, [approvalRequest?.approval_form, isEditMode]);

  const handleEdit = useCallback(() => {
    setIsEditMode(true);
  }, []);

  const handleCancelEdit = useCallback(() => {
    setIsEditMode(false);
  }, []);

  const handleSave = useCallback(
    async (editedData: RecommendedQuestionItem[]) => {
      showConfirm({
        title: CONFIRM_TITLES.APPROVAL_REQUEST,
        message: CONFIRM_MESSAGES.APPROVAL_REQUEST,
        onConfirm: async () => {
          try {
            if (!id) {
              toast.error('승인 요청 ID가 없습니다.');
              return;
            }
            // 승인 요청 상세 목록 수정 API 호출 (저장 시점의 데이터로 업데이트)
            await updateApprovalDetailList(id, editedData);
            
            // status를 in_review로 업데이트
            const inReviewStatus = APPROVAL_STATUS_OPTIONS.find(opt => opt.value === 'in_review')?.value || 'in_review';
            const processDate = formatDateForStorage(new Date(), 'YYYYMMDDHHmmss') || '';
            await updateApprovalRequestStatus(id, inReviewStatus, processDate);
            
            // 모든 관련 쿼리 무효화
            queryClient.invalidateQueries({ queryKey: ['approval-request', id] });
            queryClient.invalidateQueries({ queryKey: ['approval-detail-questions', id] });
            // 목록 쿼리도 무효화하여 뒤로가기 시 자동 리프레시
            queryClient.invalidateQueries({ queryKey: ['approval-requests', 'recommended-questions'] });
            
            toast.success(TOAST_MESSAGES.FINAL_APPROVAL_REQUESTED);
            setIsEditMode(false);
            // 저장 성공 후 편집 불가 처리
            setCanEditState(false);
            // refetch하여 최신 상태 가져오기
            await queryClient.refetchQueries({ queryKey: ['approval-request', id] });
            // 뒤로 가기 제거 (뒤로가기 버튼도 제거됨)
          } catch (error) {
            console.error('수정 실패:', error);
            toast.error('수정에 실패했습니다.');
          }
        },
      });
    },
    [showConfirm, queryClient, id, approvalRequest, handleBack],
  );

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
  }, [questionCategoryGroupedOptions]);

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

  // 필수 필드 목록 추출 (조건적 필수 포함, 행별로 다를 수 있음)
  const getRequiredFields = useCallback((row: RecommendedQuestionItem): string[] => {
    const requiredFields: string[] = [
      'service_nm',
      'qst_ctgr',
      'display_ctnt',
      'under_17_yn',
      'imp_start_date',
      'imp_end_date',
    ];

    // 조건적 필수: qst_ctgr가 'ai_search_mid' 또는 'ai_search_story'일 때 parent_id, parent_nm 필수
    const qstCtgr = row.qst_ctgr;
    if (qstCtgr === 'ai_search_mid' || qstCtgr === 'ai_search_story') {
      requiredFields.push('parent_id', 'parent_nm');
    }

    // 조건적 필수: service_nm이 'ai_calc'일 때 age_grp 필수
    const serviceNm = row.service_nm;
    if (serviceNm === 'ai_calc') {
      requiredFields.push('age_grp');
    }

    return requiredFields;
  }, []);

  // Validation 함수
  const handleValidate = (data: RecommendedQuestionItem) => {
    return RecommendedQuestionValidator.validateAll(data);
  };

  return (
    <Box>
      <PageHeader title="추천질문 결재 상세" />
      <GlobalLoadingSpinner isLoading={isLoading} />
      <EditableList<RecommendedQuestionItem>
        rows={data}
        columns={recommendedQuestionColumns}
        rowIdGetter="qst_id"
        onBack={handleBack}
        onEdit={canEdit ? handleEdit : undefined}
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
        getRequiredFields={getRequiredFields}
        isLoading={false}
      />
    </Box>
  );
};
export default RecommendedQuestionsApprovalDetailPage;
