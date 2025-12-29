import { SearchField } from '@/types/types';
import { UserLoginItem } from './type';
import { TABLE_LABELS } from '@/constants/label';

export const resultOptions = [
  { label: '성공', value: 'SUCCESS' },
  { label: '실패', value: 'FAIL' },
];

export const {
  NO,
  LOGIN_HISTORY_ID,
  KC_USER_ID,
  USERNAME,
  EMP_NO,
  EMP_NAME,
  LOGIN_AT,
  LOGOUT_AT,
  LOGIN_IP,
  LOGOUT_IP,
  USER_AGENT,
  RESULT,
  FAIL_REASON,
} = TABLE_LABELS.LOGIN_HISTORY;

export const mockUserLogins: UserLoginItem[] = [
  {
    [NO]: 560,
    [LOGIN_HISTORY_ID]: 3001,
    [KC_USER_ID]: 1001,
    [USERNAME]: 'honggildong',
    [EMP_NO]: '123456',
    [EMP_NAME]: '홍길동',
    [LOGIN_AT]: '2025-04-01 10:00:00',
    [LOGOUT_AT]: '2025-04-01 11:00:00',
    [LOGIN_IP]: '192.168.1.1',
    [LOGOUT_IP]: '192.168.1.1',
    [USER_AGENT]:
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    [RESULT]: 'SUCCESS',
    [FAIL_REASON]: null,
  },
  {
    [NO]: 561,
    [LOGIN_HISTORY_ID]: 3002,
    [KC_USER_ID]: 1002,
    [USERNAME]: 'kimyounghi',
    [EMP_NO]: '123457',
    [EMP_NAME]: '김영희',
    [LOGIN_AT]: '2025-04-01 12:00:00',
    [LOGOUT_AT]: null,
    [LOGIN_IP]: '192.168.1.2',
    [LOGOUT_IP]: null,
    [USER_AGENT]:
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    [RESULT]: 'FAIL',
    [FAIL_REASON]: '비밀번호 불일치',
  },
  {
    [NO]: 562,
    [LOGIN_HISTORY_ID]: 3003,
    [KC_USER_ID]: 1003,
    [USERNAME]: 'parkchulsoo',
    [EMP_NO]: '123458',
    [EMP_NAME]: '박철수',
    [LOGIN_AT]: '2025-04-01 14:00:00',
    [LOGOUT_AT]: '2025-04-01 14:30:00',
    [LOGIN_IP]: '192.168.1.3',
    [LOGOUT_IP]: '192.168.1.3',
    [USER_AGENT]:
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Edge/120.0.0.0',
    [RESULT]: 'SUCCESS',
    [FAIL_REASON]: null,
  },
  {
    [NO]: 563,
    [LOGIN_HISTORY_ID]: 3004,
    [KC_USER_ID]: 1001,
    [USERNAME]: 'honggildong',
    [EMP_NO]: '123456',
    [EMP_NAME]: '홍길동',
    [LOGIN_AT]: '2025-04-02 09:00:00',
    [LOGOUT_AT]: null,
    [LOGIN_IP]: '192.168.1.1',
    [LOGOUT_IP]: null,
    [USER_AGENT]:
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    [RESULT]: 'SUCCESS',
    [FAIL_REASON]: null,
  },
];

// **************결재 검색 페이지**************
export const USER_LOGIN_HISTORY_SEARCH_FIELDS: SearchField[] = [
  {
    type: 'textGroup',
    fields: [
      { field: 'username', label: '사용자 이름' },
      { field: 'empNo', label: '사원 번호' },
    ],
  },

  {
    field: RESULT,
    label: '결과',
    type: 'select',
    options: [...resultOptions],
  },

  {
    field: 'fromAt',
    dataField: 'fromAt',
    label: '기간 시작',
    type: 'dateRange',
    position: 'start',
  },
  {
    field: 'toAt',
    dataField: 'toAt',
    label: '기간 종료',
    type: 'dateRange',
    position: 'end',
  },
];
