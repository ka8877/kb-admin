export const env = {
  apiBaseURL: import.meta.env.VITE_API_BASE_URL ?? '/api',
  requestTimeout: Number(import.meta.env.VITE_API_TIMEOUT ?? '15000'),
  isDev: import.meta.env.DEV,
  isProd: import.meta.env.PROD,
};

export type Env = typeof env;
