// API 엔드포인트 상수 관리
// 라우트 경로처럼 중앙에서 관리하여 타입 안전성과 재사용성 확보

export const API_ENDPOINTS = {
  // 추천질문 관련
  RECOMMENDED_QUESTIONS: {
    BASE: '/data-reg/qst',
    LIST: '/data-reg/qst.json',
    DETAIL: (id: string | number) => `/data-reg/qst/${id}.json`,
    CREATE: '/data-reg/qst.json',
    UPDATE: (id: string | number) => `/data-reg/qst/${id}.json`,
    DELETE: (id: string | number) => `/data-reg/qst/${id}.json`,
    APPROVAL: '/approval/recommended-questions.json',
    APPROVAL_LIST: '/approval/recommended-questions.json',
    APPROVAL_DETAIL: (id: string | number) => `/approval/recommended-questions/${id}.json`,
    APPROVAL_DETAIL_LIST: (id: string | number) =>
      `/approval/recommended-questions/${id}/list.json`,
  },

  // 앱 스킴 관련
  APP_SCHEME: {
    BASE: '/data-reg/app-scheme',
    LIST: '/data-reg/app-scheme.json',
    DETAIL: (id: string | number) => `/data-reg/app-scheme/${id}.json`,
    CREATE: '/data-reg/app-scheme.json',
    UPDATE: (id: string | number) => `/data-reg/app-scheme/${id}.json`,
    DELETE: (id: string | number) => `/data-reg/app-scheme/${id}.json`,
    APPROVAL_LIST: '/approval/app-scheme.json',
    APPROVAL_DETAIL: (id: string | number) => `/approval/app-scheme/${id}.json`,
    APPROVAL_DETAIL_LIST: (id: string | number) => `/approval/app-scheme/${id}/list.json`,
  },

  // 공통코드 관련 (cm_code_group, cm_code_item, cm_code_mapping)
  COMMON_CODE: {
    BASE: '/management/common-code',
    // 코드그룹 (cm_code_group)
    CODE_GROUPS: '/management/common-code/code-groups.json',
    CODE_GROUP_DETAIL: (id: number) => `/management/common-code/code-groups/${id}.json`,
    CODE_GROUP_CREATE: '/management/common-code/code-groups.json',
    CODE_GROUP_UPDATE: (id: number | string) => `/management/common-code/code-groups/${id}.json`,
    CODE_GROUP_DELETE: (id: number | string) => `/management/common-code/code-groups/${id}.json`,
    // 코드아이템 (cm_code_item)
    CODE_ITEMS: '/management/common-code/code-items.json',
    CODE_ITEM_DETAIL: (id: number | string) => `/management/common-code/code-items/${id}.json`,
    CODE_ITEM_CREATE: '/management/common-code/code-items.json',
    CODE_ITEM_UPDATE: (id: number | string) => `/management/common-code/code-items/${id}.json`,
    CODE_ITEM_DELETE: (id: number | string) => `/management/common-code/code-items/${id}.json`,
    // 코드 매핑 (cm_code_mapping)
    CODE_MAPPINGS: '/management/common-code/code-mappings.json',
    CODE_MAPPING_CREATE: '/management/common-code/code-mappings.json',
    CODE_MAPPING_UPDATE: (id: number) => `/management/common-code/code-mappings/${id}.json`,
    CODE_MAPPING_DELETE: (id: number) => `/management/common-code/code-mappings/${id}.json`,
  },

  // 사용자 역할 변경 이력
  USER_ROLE_CHANGE: {
    BASE: '/history/user-role-change',
    LIST: '/history/user-role-change.json',
  },

  // 로그인 이력
  USER_LOGIN: {
    BASE: '/history/login',
    LIST: '/history/login.json',
  },

  // 권한 관리
  PERMISSION: {
    BASE: '/management/permission',
    LIST: '/management/permission.json',
    DETAIL: (id: number) => `/management/permission/${id}.json`,
    CREATE: '/management/permission.json',
    UPDATE: (id: number) => `/management/permission/${id}.json`,
    DELETE: (id: number) => `/management/permission/${id}.json`,
  },

  // 화면 권한 관리
  SCREEN_PERMISSION: {
    BASE: '/management/screen-permission',
    LIST: (permissionId: number) => `/management/screen-permission/${permissionId}.json`,
    SAVE_BULK: (permissionId: number) => `/management/screen-permission/${permissionId}/bulk.json`,
    DELETE: (permissionId: number, menuId: number) =>
      `/management/screen-permission/${permissionId}/${menuId}.json`,
  },

  // 메뉴 관리
  MENU: {
    BASE: '/management/menu',
    LIST: '/management/menu.json',
    TREE: '/management/menu/tree.json',
    DETAIL: (id: string | number) => `/management/menu/${id}.json`,
    CREATE: '/management/menu.json',
    UPDATE: (id: string | number) => `/management/menu/${id}.json`,
    DELETE: (id: string | number) => `/management/menu/${id}.json`,
  },

  // 권한 확인
  AUTH: {
    PERMISSION: (role: string) => `/role/${role}.json`,
  },
} as const;
