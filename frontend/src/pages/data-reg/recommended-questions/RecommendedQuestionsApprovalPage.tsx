import React from 'react';
import { useNavigate } from 'react-router-dom';

import type { ApprovalRequestItem } from './types';
import { approvalRequestColumns } from './components/columns/columns';
import SimpleList from '../../../components/common/list/SimpleList';
import { ROUTES } from '../../../routes/menu';

const listApi = {
  list: async (): Promise<ApprovalRequestItem[]> => {
    return Promise.resolve([
      {
        no: 1,
        id: 'req_001',
        approval_form: '데이터 등록',
        title: '추천질문 등록 요청합니다',
        content: '추천질문 AI_검색 관련하여 등록합니다..',
        requester: 'jasmin.t',
        department: '대화형 AI 서비스',
        request_date: '2025.06.17. 00:00:00',
        status: '요청',
        process_date: '2025.06.17. 00:00:00',
      },
      {
        no: 2,
        id: 'req_002',
        approval_form: '데이터 수정',
        title: '추천질문 수정 요청드립니다',
        content: 'AI 계산기 서비스 관련 질문 내용을 수정하고자 합니다.',
        requester: 'john.kim',
        department: '데이터 관리팀',
        request_date: '2025.06.16. 14:30:00',
        status: '검토중',
        process_date: '2025.06.16. 15:00:00',
      },
      {
        no: 3,
        id: 'req_003',
        approval_form: '데이터 삭제',
        title: '불필요한 추천질문 삭제 요청',
        content: '서비스 종료로 인한 관련 질문들을 일괄 삭제 요청합니다.',
        requester: 'sarah.lee',
        department: '서비스 기획팀',
        request_date: '2025.06.15. 09:15:00',
        status: '승인완료',
        process_date: '2025.06.15. 16:45:00',
      },
    ]);
  },
};

const RecommendedQuestionsApprovalPage: React.FC = () => {
  const navigate = useNavigate();

  const handleRowClick = (params: { id: string | number; row: ApprovalRequestItem }) => {
    // 결재 요청 상세 페이지로 이동
    navigate(ROUTES.RECOMMENDED_QUESTIONS_APPROVAL_DETAIL(params.id));
  };

  return (
    <SimpleList<ApprovalRequestItem>
      columns={approvalRequestColumns}
      fetcher={listApi.list}
      onBack={() => navigate(-1)}
      onRowClick={handleRowClick}
    />
  );
};

export default RecommendedQuestionsApprovalPage;
