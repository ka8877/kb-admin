import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import type { RecommendedQuestionItem } from './types';
import { recommendedQuestionColumns } from './components/columns/columns';
import ManagementList from '../../../components/common/list/ManagementList';
import { ROUTES } from '../../../routes/menu';
import {
  mockRecommendedQuestions,
  serviceOptions,
  ageGroupOptions,
  under17Options,
  statusOptions,
  questionCategoryOptions,
} from './data';

const listApi = {
  list: async (): Promise<RecommendedQuestionItem[]> => {
    return Promise.resolve(mockRecommendedQuestions);
  },
};

const RecommendedQuestionsPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleCreate = () => {
    navigate(ROUTES.RECOMMENDED_QUESTIONS_CREATE);
  };
  const handleRequestApproval = () => {
    // 현재 URL을 sessionStorage에 저장하고 결재 요청 페이지로 이동
    const currentUrl = location.pathname + location.search;

    console.log('🔍 RecommendedQuestionsPage - saving currentUrl to sessionStorage:', currentUrl);
    sessionStorage.setItem('approval_return_url', currentUrl);

    navigate(ROUTES.RECOMMENDED_QUESTIONS_APPROVAL);
  };
  const handleDeleteConfirm = (ids: (string | number)[]) => {
    console.log('삭제 요청 ids:', ids);
    // 실제 삭제 처리 후 필요 시 재요청
  };

  return (
    <ManagementList<RecommendedQuestionItem>
      onRowClick={(params) => {
        navigate(ROUTES.RECOMMENDED_QUESTIONS_DETAIL(params.id));
      }}
      columns={recommendedQuestionColumns}
      fetcher={listApi.list}
      rowIdGetter={'qst_id'}
      onCreate={handleCreate}
      onRequestApproval={handleRequestApproval}
      onDeleteConfirm={handleDeleteConfirm}
      enableStatePreservation={true} // URL 기반 상태 보존 활성화
      exportFileName="추천질문목록" // 다운로드 파일명
      selectFields={{
        service_nm: serviceOptions,
        age_grp: ageGroupOptions,
        under_17_yn: under17Options,
        status: statusOptions,
        qst_ctgr: questionCategoryOptions,
      }}
      dateFields={['imp_start_date', 'imp_end_date', 'updatedAt', 'registeredAt']}
      dateFormat="YYYYMMDDHHmmss"
      // onExportAll can be provided to override default CSV behavior
    />
  );
};

export default RecommendedQuestionsPage;
