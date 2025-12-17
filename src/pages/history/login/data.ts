import { UserLoginItem } from './type';

export const resultOptions = [
  { label: '성공', value: 'SUCCESS' },
  { label: '실패', value: 'FAILURE' },
];

export const mockUserLogins: UserLoginItem[] = [
  {
    no: 560,
    loginHistoryId: 'HIST_001',
    kcUserId: 'user_001',
    loginAt: '2025-04-01 10:00:00',
    logoutAt: '2025-04-01 11:00:00',
    loginIp: '192.168.1.1',
    logoutIp: '192.168.1.1',
    userAgent:
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    result: 'SUCCESS',
    failReason: null,
  },
  {
    no: 561,
    loginHistoryId: 'HIST_002',
    kcUserId: 'user_002',
    loginAt: '2025-04-01 12:00:00',
    logoutAt: null,
    loginIp: '192.168.1.2',
    logoutIp: null,
    userAgent:
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    result: 'FAILURE',
    failReason: '비밀번호 불일치',
  },
  {
    no: 562,
    loginHistoryId: 'HIST_003',
    kcUserId: 'user_003',
    loginAt: '2025-04-01 14:00:00',
    logoutAt: '2025-04-01 14:30:00',
    loginIp: '192.168.1.3',
    logoutIp: '192.168.1.3',
    userAgent:
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Edge/120.0.0.0',
    result: 'SUCCESS',
    failReason: null,
  },
  {
    no: 563,
    loginHistoryId: 'HIST_004',
    kcUserId: 'user_001',
    loginAt: '2025-04-02 09:00:00',
    logoutAt: null,
    loginIp: '192.168.1.1',
    logoutIp: null,
    userAgent:
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    result: 'SUCCESS',
    failReason: null,
  },
];
