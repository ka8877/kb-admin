import {
  NO,
  HISTORY_ID,
  KC_USER_ID,
  USERNAME,
  EMP_NO,
  EMP_NAME,
  ROLE_ID,
  ROLE_CODE,
  ROLE_NAME,
  CHANGE_TYPE,
  ITSVC_NO,
  REASON,
  BEFORE_STATE,
  AFTER_STATE,
  CHANGED_BY,
  CHANGED_BY_USERNAME,
  CHANGED_AT,
} from './data';

export type UserRoleChangeItem = {
  [NO]: number;
  [HISTORY_ID]: number; // 권한 변경 이력 PK
  [KC_USER_ID]: number; // 사용자 FK, IX(복합)
  [USERNAME]: string; // 사용자명
  [EMP_NO]: string; // 사번
  [EMP_NAME]: string; // 직원명
  [ROLE_ID]: number; // 역할 FK, IX(복합)
  [ROLE_CODE]: string; // 역할 코드
  [ROLE_NAME]: string; // 역할명
  [CHANGE_TYPE]: string; // 변경 유형
  [ITSVC_NO]: string; // ITSVC 번호
  [REASON]: string; // 변경 사유
  [BEFORE_STATE]: string; // 변경전 스냅샷
  [AFTER_STATE]: string; // 변경후 스냅샷
  [CHANGED_BY]: number; // 작업자 ID
  [CHANGED_BY_USERNAME]: string; // 작업자 사용자명
  [CHANGED_AT]: string; // 변경일시
};
