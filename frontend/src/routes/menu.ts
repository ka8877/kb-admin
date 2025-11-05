export type MenuItem = {
  label: string;
  path: string;
  icon?: string; // placeholder for icon id or name
  children?: MenuItem[];
};

// 경로 상수 (타입 안전 + 재사용)
export const ROUTES = {
  // === 기본 페이지 ===
  HOME: '/',
  DASHBOARD: '/dashboard',
  EXAMPLE: '/example',

  // === 데이터 등록/노출 ===
  DATA_REG: '/data-reg',
  RECOMMENDED_QUESTIONS: '/data-reg/recommended-questions',
  RECOMMENDED_QUESTIONS_DETAIL: (id: string | number) => `/data-reg/recommended-questions/${id}`,
  RECOMMENDED_QUESTIONS_EDIT: (id: string | number) => `/data-reg/recommended-questions/edit/${id}`,
  APP_SKIM: '/data-reg/app-skim',

  // === 관리 ===
  MANAGEMENT: '/management',
  MANAGEMENT_CATEGORY: '/management/category',
  SERVICE_NAME: '/management/category/service-name',
  QUESTIONS_CATEGORY: '/management/category/questions-category',
  AGE_GROUP: '/management/category/age-group',
  ADMIN_AUTH: '/admin-auth',
} as const;

export const frontMenus: MenuItem[] = [
  {
    label: '대시보드',
    path: ROUTES.DASHBOARD,
  },
  {
    label: '데이터 등록/노출',
    path: ROUTES.DATA_REG,
    children: [
      {
        label: '추천 질문',
        path: ROUTES.RECOMMENDED_QUESTIONS,
      },
      {
        label: '앱스킴',
        path: ROUTES.APP_SKIM,
      },
    ],
  },
  {
    label: '관리',
    path: ROUTES.MANAGEMENT,
    children: [
      {
        label: '카테고리 관리',
        path: ROUTES.MANAGEMENT_CATEGORY,
        children: [
          {
            label: '서비스명',
            path: ROUTES.SERVICE_NAME,
          },
          {
            label: '질문 카테고리',
            path: ROUTES.QUESTIONS_CATEGORY,
          },
          {
            label: '연령대',
            path: ROUTES.AGE_GROUP,
          },
        ],
      },
      {
        label: '어드민 권한관리',
        path: ROUTES.ADMIN_AUTH,
      },
    ],
  },
  {
    label: '예제',
    path: ROUTES.EXAMPLE,
  },
];
