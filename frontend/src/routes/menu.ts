export type MenuItem = {
  label: string;
  path: string;
  icon?: string; // placeholder for icon id or name
  children?: MenuItem[];
};

export const frontMenus: MenuItem[] = [
  {
    label: '대시보드',
    path: '/dashboard',
  },
  {
    label: '데이터 등록/노출',
    path: '/data-reg',
    children: [
      {
        label: '추천 질문',
        path: '/data-reg/recommended-questions',
      },
      {
        label: '앱스킴',
        path: '/data-reg/app-skim',
      },
    ],
  },
  {
    label: '관리',
    path: '/management',
    children: [
      {
        label: '카테고리 관리',
        path: '/management/category',
        children: [
          { label: '추천 질문 전체 목록 조회', path: '/management/category/recommended-questions' },
          { label: '앱스킴', path: '/management/category/apps-kim' },
        ],
      },
      {
        label: '어드민 권한관리',
        path: '/admin-auth',
      },
    ],
  },
  { label: '예제', path: '/example' },
];
