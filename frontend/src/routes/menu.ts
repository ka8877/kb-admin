export type MenuItem = {
  label: string;
  path: string;
  icon?: string; // placeholder for icon id or name
  children?: MenuItem[];
};

export const frontMenus: MenuItem[] = [
  { label: '홈', path: '/' },
  { label: '대시보드', path: '/dashboard' },
  { label: '예제', path: '/example' },
   { label: '추천 질문 전체 목록 조회', path: '/data-reg/recommended-questions' },
];
