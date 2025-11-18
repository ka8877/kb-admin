// 결재 요청 관련 타입 정의
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

export type SearchFieldOption = {
  label: string;
  value: string | number;
};

export type SearchField =
  | {
      field: string;
      label: string;
      type: 'select';
      options: SearchFieldOption[];
    }
  | {
      field: string;
      label: string;
      type: 'radio';
      options: SearchFieldOption[];
    }
  | {
      field: string;
      label: string;
      type: 'text';
    }
  | {
      type: 'textGroup';
      fields: Array<{ field: string; label: string }>;
    }
  | {
      field: string;
      label: string;
      type: 'dateRange';
      position: 'start' | 'end';
      dataField?: string;
    };