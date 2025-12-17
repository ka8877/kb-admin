import {
  DATA_DELETION,
  DATA_MODIFICATION,
  DATA_REGISTRATION,
  CREATE_REQUESTED,
  UPDATE_REQUESTED,
  DELETE_REQUESTED,
  ROLE_VIEWER,
  ROLE_ADMIN,
  ROLE_CRUD,
  ROLE_NONE,
} from '@/constants/options';

// 결재 요청 관련 타입 정의
export type ApprovalRequestItem = {
  no: number; // 번호
  approvalRequestId: string; // approval_request_id
  targetType: string; // target_type
  targetId: string; // target_id
  itsvcNo: string | null; // itsvc_no
  requestKind: string; // request_kind
  approvalStatus: string; // approval_status
  payloadAfter: string | null; // payload_after
  createdBy: string; // created_by
  createdAt: string; // created_at
  updatedBy: string | null; // updated_by
  updatedAt: string; // updated_at
  isRetracted: number; // is_retracted
  isApplied: number; // is_applied
  appliedAt: string | null; // applied_at
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

// 사용자 역할 타입
/**
 * 사용자 액션 유형
 * c: 등록
 * d: 삭제
 * u: 수정
 * etc: 기타
 * manage: 관리
 */
export type UserAction = 'c' | 'd' | 'u' | 'etc';

export type UserRole = typeof ROLE_ADMIN | typeof ROLE_VIEWER | typeof ROLE_CRUD | typeof ROLE_NONE;
