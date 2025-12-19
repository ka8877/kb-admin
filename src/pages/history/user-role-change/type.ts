import {
  NO,
  HISTORY_ID,
  KC_USER_ID,
  ROLE_ID,
  CHANGE_TYPE,
  ITSVC_NO,
  REASON,
  BEFORE_STATE,
  AFTER_STATE,
  CHANGED_BY,
  CHANGED_AT,
} from './data';

export type UserRoleChangeItem = {
  [NO]: number;
  [HISTORY_ID]: number | string; // 권한 변경 이력 PK
  [KC_USER_ID]: string; // 사용자 FK, IX(복합)
  [ROLE_ID]: string; // 역할 FK, IX(복합)
  [CHANGE_TYPE]: string; // 변경 유형
  [ITSVC_NO]: string; // ITSVC 번호
  [REASON]: string; // 변경 사유
  [BEFORE_STATE]: string; // 변경전 스냅샷
  [AFTER_STATE]: string; // 변경후 스냅샷
  [CHANGED_BY]: string; // 작업자 ID
  [CHANGED_AT]: string; // 변경일시
};
