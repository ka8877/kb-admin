// Axios-based HTTP client with interceptors and typed helpers
import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, InternalAxiosRequestConfig } from 'axios'
import { env } from '../config'
import { getAccessToken } from './auth'

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

export interface ApiError extends Error {
  status: number
  url: string
  data?: unknown
  code?: string
}

export type ApiResponse<T> = T
export type Paginated<T> = { items: T[]; total: number; page: number; size: number }

const axiosClient: AxiosInstance = axios.create({
  baseURL: env.apiBaseURL, // e.g., '/api'
  timeout: env.requestTimeout,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
  withCredentials: false,
})

const toApiError = (err: unknown): ApiError => {
  if (axios.isAxiosError(err)) {
    const ae = err as AxiosError
    const status = ae.response?.status ?? 0
    const url = (ae.config?.baseURL || '') + (ae.config?.url || '')
    const data = ae.response?.data
    const apiErr: ApiError = Object.assign(new Error(ae.message), {
      name: 'ApiError',
      status,
      url,
      data,
      code: ae.code,
    })
    return apiErr
  }
  const apiErr: ApiError = Object.assign(new Error('Unknown error'), {
    name: 'ApiError',
    status: 0,
    url: '',
  })
  return apiErr
}

// Request interceptor: inject Authorization header if token exists
axiosClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = getAccessToken()
  if (token) {
    config.headers = config.headers || {}
    config.headers['Authorization'] = `Bearer ${token}`
  }
  // Example: attach a request id header if needed
  // config.headers['X-Request-Id'] = crypto.randomUUID?.() ?? ''
  return config
})

// Response interceptor: currently pass through; errors normalized by catch wrappers
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(toApiError(error))
)

export { axiosClient }
