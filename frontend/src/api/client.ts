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
  errorCode?: string
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
  errorCode?: string
  errors?: Record<string, string[]>
  data?: Record<string, string>
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
// Xử lý lỗi tập trung
http.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError<ApiError>) => {
    const status = error.response?.status
    const errorMessage = error.response?.data?.message || 'Có lỗi kết nối đến máy chủ!'

    if (status === 401) {
      // Token hết hạn hoặc sai mật khẩu → xóa token, redirect login
      const { useAuthStore } = await import('@/stores/auth.store')
      useAuthStore().clearAuth()
      if (router.currentRoute.value.path !== '/login') {
        router.push('/login')
      }
    }

    if (status === 403) {
      const { useToast } = await import('@/composables/ui/useToast')
      useToast().error('Bạn không có quyền thực hiện hành động này!')
    } else if (status) {
      // Log errors to console if they exist in data
      if (error.response?.data?.data && typeof error.response.data.data === 'object') {
        console.error('Validation Errors:', error.response.data.data);
      }
      // Hiển thị toast cho tất cả các lỗi có status (400, 401, 404, 500...)
      const { useToast } = await import('@/composables/ui/useToast')
      
      // Hiển thị message tổng quát
      useToast().error(errorMessage)
      
      // Nếu có field errors, hiển thị thêm toast cho từng lỗi
      const fieldErrors = error.response?.data?.data as Record<string, string>;
      if (fieldErrors && typeof fieldErrors === 'object') {
        Object.values(fieldErrors).forEach(msg => {
          if (typeof msg === 'string') {
            useToast().error(msg);
          }
        });
      }
    }

    return Promise.reject(error)
  }
)

export default http
