// Axios-based HTTP client with interceptors and typed helpers
import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { env } from '@/config/env';
import { getAccessToken } from './auth';
import { useLoadingStore } from '../store/loading';

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export interface ApiError extends Error {
  status: number;
  url: string;
  data?: unknown;
  code?: string;
}

export type ApiResponse<T> = T;
export type Paginated<T> = { items: T[]; total: number; page: number; size: number };

const axiosClient: AxiosInstance = axios.create({
  baseURL: env.apiBaseURL, // e.g., '/api'
  timeout: env.requestTimeout,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
  withCredentials: false,
});

const toApiError = (err: unknown): ApiError => {
  if (axios.isAxiosError(err)) {
    const ae = err as AxiosError;
    const status = ae.response?.status ?? 0;
    const url = (ae.config?.baseURL || '') + (ae.config?.url || '');
    const data = ae.response?.data;

    return Object.assign(new Error(ae.message), {
      name: 'ApiError',
      status,
      url,
      data,
      code: ae.code,
    });
  }

  return Object.assign(new Error('Unknown error'), {
    name: 'ApiError',
    status: 0,
    url: '',
  });
};

// Request interceptor: inject Authorization header if token exists
axiosClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  // global loading start
  try {
    useLoadingStore.getState().start();
  } catch {
    /* no-op */
  }
  const token = getAccessToken();
  if (token) {
    config.headers = config.headers || {};
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  // Example: attach a request id header if needed
  // config.headers['X-Request-Id'] = crypto.randomUUID?.() ?? ''
  return config;
});

// Response interceptor: currently pass through; errors normalized by catch wrappers
axiosClient.interceptors.response.use(
  (response) => {
    // global loading stop
    try {
      useLoadingStore.getState().stop();
    } catch {
      /* no-op */
    }
    return response;
  },
  (error) => {
    // global loading stop on error too
    try {
      useLoadingStore.getState().stop();
    } catch {
      /* no-op */
    }
    return Promise.reject(toApiError(error));
  },
);

export { axiosClient };
