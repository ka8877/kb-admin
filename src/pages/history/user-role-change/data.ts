import { UserRoleChangeItem } from './type';
import { TABLE_LABELS } from '@/constants/label';

export const {
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
} = TABLE_LABELS.USER_ROLE_CHANGE_HISTORY;

export const changeTypeOptions = [
  { label: '권한 부여', value: 'GRANT' },
  { label: '권한 회수', value: 'REVOKE' },
  { label: '권한 변경', value: 'MODIFY' },
];

export const mockRoleChanges: UserRoleChangeItem[] = [
  {
    [NO]: 560,
    [HISTORY_ID]: 1001,
    [KC_USER_ID]: 'taron.k',
    [ROLE_ID]: 'ROLE_ADMIN',
    [CHANGE_TYPE]: 'GRANT',
    [ITSVC_NO]: 'ITSVC-2025-001',
    [REASON]: '신규 프로젝트 리더 선임',
    [BEFORE_STATE]: '{}',
    [AFTER_STATE]: '{"role": "ROLE_ADMIN"}',
    [CHANGED_BY]: 'admin',
    [CHANGED_AT]: '2025-04-01 10:00:00',
  },
  {
    [NO]: 562,
    [HISTORY_ID]: 1002,
    [KC_USER_ID]: 'alex.c',
    [ROLE_ID]: 'ROLE_USER',
    [CHANGE_TYPE]: 'REVOKE',
    [ITSVC_NO]: 'ITSVC-2025-002',
    [REASON]: '부서 이동으로 인한 권한 회수',
    [BEFORE_STATE]: '{"role": "ROLE_USER"}',
    [AFTER_STATE]: '{}',
    [CHANGED_BY]: 'manager',
    [CHANGED_AT]: '2025-04-01 11:30:00',
  },
  {
    no: 563,
    historyId: 1003,
    kcUserId: 'jason.h',
    roleId: 'ROLE_VIEWER',
    changeType: 'MODIFY',
    itsvcNo: 'ITSVC-2025-003',
    reason: '임시 접근 권한 요청',
    beforeState: '{"role": "ROLE_GUEST"}',
    afterState: '{"role": "ROLE_VIEWER"}',
    changedBy: 'admin',
    changedAt: '2025-04-01 14:15:00',
  },
];
