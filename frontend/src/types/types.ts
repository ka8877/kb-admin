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
  approvalRequestId: string; // 아이디
  targetType: string; // 대상 타입
  targetId: string; // 대상 식별자
  itsvcNo: string | null; // ITSVC/JIRA 번호
  requestKind: string; // 결재양식
  approvalStatus: string; // 처리상태
  title: string | null; // 제목
  content: string | null; // 내용
  createdBy: string; // 요청자
  department: string; // 요청부서
  updatedBy: string | null; // 최근 처리자
  createdAt: string; // 요청일
  updatedAt: string; // 최근 변경 시각
  isRetracted: number; // 회수 여부
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

/**
 * 승인 요청 데이터 인터페이스 (Generic)
 */
export interface ApprovalRequestData<T> {
  requestKind: ApprovalFormType;
  title: string;
  content: string;
  createdAt: string;
  approvalStatus: ApprovalRequestType;
  targetType: string;
  targetId: string;
  isRetracted: number;
  list: T[];
}
