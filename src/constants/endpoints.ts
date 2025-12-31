// API 엔드포인트 상수 관리
// 라우트 경로처럼 중앙에서 관리하여 타입 안전성과 재사용성 확보

export const API_ENDPOINTS = {
  // 추천질문 관련
  RECOMMENDED_QUESTIONS: {
    BASE: '/api/v1/recommended-questions',
    DETAIL: (id: string | number) => `/api/v1/recommended-questions/${id}`,
    CREATE: '/api/v1/recommended-questions',
    BULK_CREATE: '/api/v1/recommended-questions/bulk-create',
    UPDATE: (id: string | number) => `/api/v1/recommended-questions/${id}`,
    DELETE: (id: string | number) => `/api/v1/recommended-questions/${id}/remove`,
    DELETE_BATCH: '/api/v1/recommended-questions/bulk-remove',
    APPROVAL_LIST: '/api/v1/recommended-questions/approval-queue',
  },

  // 앱 스킴 관련
  APP_SCHEME: {
    BASE: '/api/v1/app-schemes',
    DETAIL: (id: string | number) => `/api/v1/app-schemes/${id}`,
    CREATE: '/api/v1/app-schemes',
    BULK_CREATE: '/api/v1/app-schemes/bulk-create',
    UPDATE: (id: string | number) => `/api/v1/app-schemes/${id}`,
    DELETE: (id: string | number) => `/api/v1/app-schemes/${id}/remove`,
    DELETE_BATCH: '/api/v1/app-schemes/bulk-remove',
    APPROVAL_LIST: '/api/v1/app-schemes/approval-queue',
  },

  // 공통코드 관련 (cm_code_group, cm_code_item, cm_code_mapping)
  COMMON_CODE: {
    BASE: '/management/common-code',
    // 질문 카테고리 조회 (서비스 코드별) - 새로운 API
    QUESTION_CATEGORIES: '/api/v1/common-codes/mappings/qst-categories',
    // 코드그룹 (cm_code_group)
    CODE_GROUPS: '/api/v1/common-codes/groups',
    CODE_GROUP_DETAIL: (groupCode: string) => `/api/v1/common-codes/groups/${groupCode}`,
    CODE_GROUP_CREATE: '/api/v1/common-codes/groups',
    CODE_GROUP_UPDATE: (groupCode: string) => `/api/v1/common-codes/groups/${groupCode}`,
    CODE_GROUP_DEACTIVATE: (groupCode: string) =>
      `/api/v1/common-codes/groups/${groupCode}/deactivate`,
    // 코드아이템 (cm_code_item)
    CODE_ITEMS_ALL: '/api/aia/v1/common-codes/items', // 모든 코드 아이템 조회
    CODE_ITEMS: (groupCode: string) => `/api/aia/v1/common-codes/groups/${groupCode}/items`,
    CODE_ITEM_DETAIL: (codeItemId: number) => `/api/aia/v1/common-codes/items/${codeItemId}`,
    CODE_ITEM_CREATE: (groupCode: string) => `/api/aia/v1/common-codes/groups/${groupCode}/items`,
    CODE_ITEM_UPDATE: (codeItemId: number) => `/api/aia/v1/common-codes/items/${codeItemId}`,
    CODE_ITEM_DEACTIVATE: (codeItemId: number) =>
      `/api/aia/v1/common-codes/items/${codeItemId}/deactivate`,
    CODE_ITEMS_BULK_DEACTIVATE: '/api/aia/v1/common-codes/items/bulk-deactivate',
    CODE_ITEMS_REORDER: (groupCode: string) =>
      `/api/aia/v1/common-codes/groups/${groupCode}/items/reorder`,
    // 코드 매핑 (서비스별 질문 카테고리)
    QST_CATEGORIES: '/api/v1/common-codes/mappings/qst-categories', // serviceCd query 필요
    QST_CATEGORIES_SERVICES: '/api/v1/common-codes/mappings/qst-categories/services',
    QST_CATEGORIES_SAVE: (serviceCd: string) =>
      `/api/v1/common-codes/mappings/qst-categories/${serviceCd}`,
  },

  // 사용자 역할 변경 이력
  USER_ROLE_CHANGE: {
    BASE: '/history/user-role-change',
    LIST: '/api/v1/histories/user-role-changes',
  },

  // 권한(Role)
  ROLES: {
    LIST: '/api/v1/roles',
  },

  // 로그인 이력
  USER_LOGIN: {
    BASE: '/history/login',
    LIST: '/api/v1/histories/logins',
  },

  // 결재 이력
  APPROVAL_HISTORY: {
    LIST: '/api/v1/histories/approvals',
  },

  // 데이터 변경 이력 (Audit Log)
  AUDIT_LOG: {
    LIST: '/api/v1/histories/data-changes',
  },

  // 결재 요청 취소
  APPROVAL_REQUEST: {
    RETRACT: (approvalRequestId: number) =>
      `/api/v1/approval-requests/${approvalRequestId}/retract`,
  },

  // 권한 관리 (auth_role)
  PERMISSION: {
    BASE: '/management/permission',
    LIST: '/api/v1/roles',
    DETAIL: (roleId: number) => `/api/v1/roles/${roleId}`,
    CREATE: '/api/v1/roles',
    UPDATE: (roleId: number) => `/api/v1/roles/${roleId}`,
    DEACTIVATE: (roleId: number) => `/api/v1/roles/${roleId}/deactivate`,
    DELETE: (roleId: number) => `/api/v1/roles/${roleId}/deactivate`, // DEACTIVATE 별칭
  },

  // 관리자 사용자 관리 (kc_user_account)
  ADMIN_AUTH: {
    BASE: '/management/admin-auth',
    LIST: '/api/v1/users',
    DETAIL: (id: string | number) => `/api/v1/users/${id}`,
    BULK_SAVE: '/api/v1/users/bulk-save',
    BULK_REMOVE: '/api/v1/users/bulk-remove',
  },

  // 화면 권한 관리 (role_menu_access)
  SCREEN_PERMISSION: {
    BASE: '/management/screen-permission',
    LIST: (roleCode: string) => `/api/v1/roles/${roleCode}/menu-access`,
    SAVE_BULK: (roleCode: string) => `/api/v1/roles/${roleCode}/menu-access`,
    // DELETE는 API spec에 없으므로 기존 유지
    DELETE: (permissionId: number, menuId: number) =>
      `/management/screen-permission/${permissionId}/${menuId}.json`,
  },

  // 메뉴 관리 (ui_menu)
  MENU: {
    BASE: '/management/menu',
    LIST: '/api/v1/menus',
    DETAIL: (menuId: number) => `/api/v1/menus/${menuId}`,
    CREATE: '/api/v1/menus',
    UPDATE: (menuId: number) => `/api/v1/menus/${menuId}`,
    DEACTIVATE: (menuId: number) => `/api/v1/menus/${menuId}/deactivate`,
    // 트리 구조 조회는 기존 유지 (API spec에 명시 안됨)
    TREE: '/management/menu/tree.json',
  },

  // 권한 확인
  AUTH: {
    LOGIN: '/api/v1/auth/login',
    PERMISSION: (role: string) => `/role/${role}.json`,
  },

  USER: {
    INFO: (userId: string) => `/user/${userId}.json`,
  },
} as const;
