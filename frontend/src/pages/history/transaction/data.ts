import { TransactionItem } from "./type";

export const division1Options = [
    { label: '사용자 행동', value: 'user_action' },
    { label: '시스템 행동', value: 'system_action' },
];


export const division2Options = [
    { label: '화면이동', value: 'screen_move' },
    { label: '트리거 주기', value: 'trigger_period' },
    { label: '트리거 수정', value: 'trigger_update' },
    { label: '트리거 삭제',  value: 'trigger_delete' },
];

export const mockTransactions: TransactionItem[] = [
    {
      no: 560,
      user_id: 'taron.k',
      control_date: '2025-04-01 10:00:00',
      lookup_key: '192.168.1.1',
      division1: 'user_action',
      division2: 'screen_move',
      detail_content: 'useractionhistory',
    },
      {
        no: 562,
        user_id: 'alex.c',
        control_date: '2025-04-01 10:00:00',
        lookup_key: '192.168.1.1',
        division1: 'user_action',
        division2: 'screen_move',
        detail_content: 'triggermanagement',
      },
      {
        no: 563,
        user_id: 'jason.h',
        control_date: '2025-04-01 10:00:00',
        lookup_key: '192.168.1.1',
        division1: 'user_action',
        division2: 'screen_move',
        detail_content: 'triggerperiodmanagement',
      },
  
  ];
  