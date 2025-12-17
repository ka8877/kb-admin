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
  LOGIN: '/login',

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
  MENU_MANAGEMENT: '/management/menu',
  PERMISSION_MANAGEMENT: '/management/permission',
  SCREEN_PERMISSION: '/management/screen-permission',

  // === 이력 ===
  HISTORY: '/history',
  USER_LOGIN: '/history/login',
  USER_ROLE_CHANGE: '/history/user-role-change',
} as const;

// Firebase management/menu.json에서 동적으로 로드
// useMenuPermissions 훅에서 fetchMenuTree API를 통해 메뉴 데이터를 가져옵니다.
// 하드코딩된 메뉴는 사용하지 않습니다.
export const frontMenus: MenuItem[] = [];
