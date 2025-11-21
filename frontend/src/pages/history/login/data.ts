import { UserLoginItem } from "./type";

export const typeOptions = [
    { label: '로그인', value: 'login' },
    { label: '로그아웃', value: 'logout' },
    { label: '로그인 실패', value: 'login_failure' },
    { label: '로그인 성공', value: 'login_success' },
];


export const mockUserLogins: UserLoginItem[] = [
    {
      no: 560,
      kor_name: '홍길동',
      eng_name: 'Hong Gil Dong',
      ip_address: '192.168.1.1',
      type: 'login',
      last_login_date: '2025-04-01 10:00:00',
    },
    {
        no: 561,
        kor_name: '홍길동',
        eng_name: 'Hong Gil Dong',
        ip_address: '192.168.1.1',
        type: 'login',
        last_login_date: '2025-04-01 10:00:00',
      },
      {
        no: 562,
        kor_name: '홍길동',
        eng_name: 'Hong Gil Dong',
        ip_address: '192.168.1.1',
        type: 'login',
        last_login_date: '2025-04-01 10:00:00',
      },
      {
        no: 563,
        kor_name: '홍길동',
        eng_name: 'Hong Gil Dong',
        ip_address: '192.168.1.1',
        type: 'login',
        last_login_date: '2025-04-01 10:00:00',
      },
  
  ];
  