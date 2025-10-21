export const env = {
  apiBaseURL: (import.meta as any).env?.VITE_API_BASE_URL ?? '/api',
  requestTimeout: Number((import.meta as any).env?.VITE_API_TIMEOUT ?? 15000),
  isDev: (import.meta as any).env?.DEV ?? false,
  isProd: (import.meta as any).env?.PROD ?? false,
}

export type Env = typeof env
