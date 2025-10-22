// Centralized environment/config values for frontend
// These can be overridden via Vite envs if needed

export const env = {
  // Use relative API base so dev server proxy or same-origin can work
  apiBaseURL: '/api',
  // Default request timeout in ms
  requestTimeout: 15000,
} as const;
