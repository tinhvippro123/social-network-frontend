// ==========================================
// HTTP Client — Axios instance dùng chung toàn app
// ==========================================
import axios from 'axios'
import type { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse, AxiosError } from 'axios'
import { STORAGE_KEYS } from '@/constants'
import router from '@/router'

/** Response chuẩn từ Backend */
export interface ApiResponse<T = unknown> {
  success: boolean
  data: T
  message?: string
  meta?: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

/** Error response từ Backend */
export interface ApiError {
  success: false
  message: string
  errors?: Record<string, string[]>
}

// Tạo Axios instance 1 lần
const http: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 15_000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
})

// ── Request Interceptor ──────────────────────────────
// Tự động gắn Bearer token vào mọi request
http.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN)
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error: AxiosError) => Promise.reject(error)
)


// ── Response Interceptor ─────────────────────────────
// Xử lý lỗi tập trung: 401 → logout, 403 → redirect, 500 → toast
http.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError<ApiError>) => {
    const status = error.response?.status

    if (status === 401) {
      // Token hết hạn → xóa token, redirect login
      const { useAuthStore } = await import('@/stores/auth.store')
      useAuthStore().clearAuth()
      router.push('/login')
    }

    if (status === 403) {
      const { useToast } = await import('@/composables/useToast')
      useToast().error('Bạn không có quyền thực hiện hành động này!')
    }

    if (status && status >= 500) {
      const { useToast } = await import('@/composables/useToast')
      useToast().error(error.response?.data?.message || 'Lỗi kết nối máy chủ!')
    }

    return Promise.reject(error)
  }
)

export default http
