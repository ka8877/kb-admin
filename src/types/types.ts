// 공통 API 응답 타입
export interface ApiResponse<T> {
  success: boolean;
  code: string;
  message: string | null;
  data: T;
  meta: null;
}

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
import {
  NO,
  APPROVAL_REQUEST_ID,
  TARGET_TYPE,
  TARGET_ID,
  ITSVC_NO,
  REQUEST_KIND,
  APPROVAL_STATUS,
  PAYLOAD_BEFORE,
  PAYLOAD_AFTER,
  REQUESTER_NAME,
  REQUESTER_DEPT_NAME,
  LAST_ACTOR_NAME,
  REQUESTED_AT,
  LAST_UPDATED_AT,
  IS_RETRACTED,
  IS_APPLIED,
  APPLIED_AT,
} from '@/constants/label';

// 결재 요청 관련 타입 정의
export type ApprovalRequestItem = {
  [NO]: number; // 번호
  [APPROVAL_REQUEST_ID]: string | number; // approvalRequestId
  [TARGET_TYPE]: string; // targetType
  [TARGET_ID]: number; // targetId
  [ITSVC_NO]: string | null; // itsvcNo
  [REQUEST_KIND]: string; // requestKind
  [APPROVAL_STATUS]: string; // approvalStatus
  [PAYLOAD_BEFORE]: string | null; // payloadBefore
  [PAYLOAD_AFTER]: string | null; // payloadAfter
  [REQUESTER_NAME]: string | null; // requesterName
  [REQUESTER_DEPT_NAME]: string | null; // requesterDeptName
  [LAST_ACTOR_NAME]: string | null; // lastActorName
  [REQUESTED_AT]: string; // requestedAt
  [LAST_UPDATED_AT]: string; // lastUpdatedAt
  [IS_RETRACTED]: boolean; // isRetracted
  [IS_APPLIED]: boolean; // isApplied
  [APPLIED_AT]: string | null; // appliedAt
};

export type SelectFieldOption = {
  label: string;
  value: string | number | boolean;
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
      helperText?: string;
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

/**
 * 목록 조회 공통 파라미터
 */
export interface FetchListParams {
  /** 페이지 번호 (1부터 시작) */
  page?: number;
  /** 페이지당 행 수 */
  size?: number;
  /** 검색 조건 (필드명: 값 형태의 객체) */
  searchParams?: Record<string, string | number>;
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
