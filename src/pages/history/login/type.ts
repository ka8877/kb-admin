import { IN_SERVICE, OUT_OF_SERVICE } from '@/constants/options';
import {
  NO,
  LOGIN_HISTORY_ID,
  KC_USER_ID,
  LOGIN_AT,
  LOGOUT_AT,
  LOGIN_IP,
  LOGOUT_IP,
  USER_AGENT,
  RESULT,
  FAIL_REASON,
} from './data';

export type UserLoginItem = {
  [NO]: number;
  [LOGIN_HISTORY_ID]: string; // 로그인이력 PK
  [KC_USER_ID]: string; // 사용자 FK IX(복합)
  [LOGIN_AT]: string; // 로그인 시각 IX(복합)
  [LOGOUT_AT]: string | null; // 로그아웃 시각
  [LOGIN_IP]: string; // 로그인 IP
  [LOGOUT_IP]: string | null; // 로그아웃 IP
  [USER_AGENT]: string | null; // 브라우저 정보
  [RESULT]: string; // 결과
  [FAIL_REASON]: string | null; // 실패 사유
};

export type statusType = typeof IN_SERVICE | typeof OUT_OF_SERVICE;
