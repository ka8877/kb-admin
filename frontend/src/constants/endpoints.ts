// API 엔드포인트 상수 관리
// 라우트 경로처럼 중앙에서 관리하여 타입 안전성과 재사용성 확보

export const API_ENDPOINTS = {
  // 추천질문 관련
  RECOMMENDED_QUESTIONS: {
    BASE: '/data-reg/qst',
    LIST: '/data-reg/qst.json',
    DETAIL: (id: string | number) => `/data-reg/qst/${id}`,
    CREATE: '/data-reg/qst.json',
    UPDATE: (id: string | number) => `/data-reg/qst/${id}`,
    DELETE: (id: string | number) => `/data-reg/qst/${id}`,
  },

  // 앱 스킴 관련
  APP_SCHEME: {
    BASE: '/data-reg/app-scheme',
    LIST: '/data-reg/app-scheme',
    DETAIL: (id: string | number) => `/data-reg/app-scheme/${id}`,
    CREATE: '/data-reg/app-scheme',
    UPDATE: (id: string | number) => `/data-reg/app-scheme/${id}`,
    DELETE: (id: string | number) => `/data-reg/app-scheme/${id}`,
  },

  // 공통코드 관련
  COMMON_CODE: {
    BASE: '/management/common-code',
    LIST: '/management/common-code',
    DETAIL: (id: string | number) => `/management/common-code/${id}`,
  },
} as const;

