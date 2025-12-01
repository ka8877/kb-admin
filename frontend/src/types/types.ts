import {
  DATA_DELETION,
  DATA_MODIFICATION,
  DATA_REGISTRATION,
  CREATE_REQUESTED,
  UPDATE_REQUESTED,
  DELETE_REQUESTED,
} from '@/constants/options';

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

export type SelectFieldOption = {
  label: string;
  value: string;
};

export type SearchFieldOption = {
  label: string;
  value: string | number;
};

export type ValidationResult = {
  isValid: boolean;
  message?: string;
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

/**
 * 승인 요청 데이터 타입
 */
export type ApprovalFormType =
  | typeof DATA_REGISTRATION
  | typeof DATA_MODIFICATION
  | typeof DATA_DELETION;
export type ApprovalRequestType =
  | typeof CREATE_REQUESTED
  | typeof UPDATE_REQUESTED
  | typeof DELETE_REQUESTED;
