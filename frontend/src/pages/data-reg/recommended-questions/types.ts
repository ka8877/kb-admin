export type RecommendedQuestionItem = {
  no: number;
  qst_id: string;
  service_nm: string;
  qst_ctnt: string;
  parent_id: string | null;
  parent_nm: string | null;
  imp_start_date: string;
  imp_end_date: string;
  updatedAt: string;
  registeredAt: string;
  status: 'in_service' | 'out_of_service';
};

export type ApprovalRequestItem = {
  no: number; // 번호
  id: string; // ID
  approval_form: string; // 결재양식
  title: string; // 제목
  content: string; // 내용
  requester: string | null; // 요청자
  department: string; // 요청부서
  request_date: string; // 요청일
  status: string; // 처리상태
  process_date: string; // 처리일
};
