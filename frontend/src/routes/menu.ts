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

  // === 데이터 등록/노출 ===
  DATA_REG: '/data-reg',
  RECOMMENDED_QUESTIONS: '/data-reg/recommended-questions',
  RECOMMENDED_QUESTIONS_CREATE: '/data-reg/recommended-questions/create',
  RECOMMENDED_QUESTIONS_APPROVAL: '/data-reg/recommended-questions/approval',
  RECOMMENDED_QUESTIONS_APPROVAL_DETAIL: (id: string | number) =>
    `/data-reg/recommended-questions/approval/${id}`,
  RECOMMENDED_QUESTIONS_DETAIL: (id: string | number) => `/data-reg/recommended-questions/${id}`,
  RECOMMENDED_QUESTIONS_EDIT: (id: string | number) => `/data-reg/recommended-questions/edit/${id}`,
  APP_SCHEME: '/data-reg/app-scheme',
  APP_SCHEME_CREATE: '/data-reg/app-scheme/create',
  APP_SCHEME_DETAIL: (id: string | number) => `/data-reg/app-scheme/${id}`,
  APP_SCHEME_APPROVAL: '/data-reg/app-scheme/approval',
  APP_SCHEME_APPROVAL_DETAIL: (id: string | number) => `/data-reg/app-scheme/approval/${id}`,

  // === 관리 ===
  MANAGEMENT: '/management',
  MANAGEMENT_CATEGORY: '/management/category',
  COMMON_CODE: '/management/common-code',
  COMMON_CODE_EDIT: '/management/common-code/edit',
  CODE_HIERARCHY: '/management/code-hierarchy',
  CODE_HIERARCHY_EDIT: '/management/code-hierarchy/edit',
  SERVICE_NAME: '/management/service-name',
  SERVICE_NAME_EDIT: '/management/service-name/edit',
  QUESTIONS_CATEGORY: '/management/questions-category',
  AGE_GROUP: '/management/age-group',
  ADMIN_AUTH: '/management/admin-auth',
  PERMISSION_MANAGEMENT: '/management/permission',

  // === 이력 ===
  HISTORY: '/history',
  USER_LOGIN: '/history/login',
  TRANSACTION: '/history/transaction',
} as const;

export const frontMenus: MenuItem[] = [
  {
    label: '데이터 등록/노출',
    path: ROUTES.DATA_REG,
    children: [
      {
        label: '데이터 등록',
        path: ROUTES.DATA_REG,
        children: [
          {
            label: '추천 질문',
            path: ROUTES.RECOMMENDED_QUESTIONS,
          },
          {
            label: '앱스킴',
            path: ROUTES.APP_SCHEME,
          },
        ],
      },
    ],
  },
  {
    label: '관리',
    path: ROUTES.MANAGEMENT,
    children: [
      {
        label: '공통 코드 관리',
        path: ROUTES.COMMON_CODE,
      },
      //2차때 적용??
      // {
      //   label: '코드 계층 관리',
      //   path: ROUTES.CODE_HIERARCHY,
      // },
      {
        label: '사용자 관리',
        path: ROUTES.ADMIN_AUTH,
      },
      {
        label: '권한 관리',
        path: ROUTES.PERMISSION_MANAGEMENT,
      },
    ],
  },
  {
    label: '이력',
    path: ROUTES.HISTORY,
    children: [
      {
        label: '로그인 이력',
        path: ROUTES.USER_LOGIN,
      },
      {
        label: '사용자 사용 이력',
        path: ROUTES.TRANSACTION,
      },
    ],
  },
];
