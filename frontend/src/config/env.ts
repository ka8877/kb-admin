import Keycloak from 'keycloak-js';

export const env = {
  apiBaseURL: import.meta.env.VITE_API_BASE_URL ?? '/api',
  requestTimeout: Number(import.meta.env.VITE_API_TIMEOUT ?? '15000'),
  isDev: import.meta.env.DEV,
  isProd: import.meta.env.PROD,
  testURL: import.meta.env.VITE_TEST_URL ?? '',
  keycloak: {
    url: import.meta.env.VITE_KEYCLOAK_URL ?? '',
    realm: import.meta.env.VITE_KEYCLOAK_REALM ?? '',
    clientId: import.meta.env.VITE_KEYCLOAK_CLIENT_ID ?? '',
  },
  auth: {
    // 인증 기능 사용 여부 (true: Keycloak 로그인 사용, false: 로그인 없이 접근)
    enabled: import.meta.env.VITE_AUTH_ENABLED === 'true',
  },
};

export const keycloak = new Keycloak({
  url: env.keycloak.url,
  realm: env.keycloak.realm,
  clientId: env.keycloak.clientId,
});

export type Env = typeof env;
