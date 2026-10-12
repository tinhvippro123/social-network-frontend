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


const ERROR_TRANSLATIONS: Record<string, string> = {
  'Email already in use': 'Email này đã được sử dụng',
  'Bad credentials': 'Email hoặc mật khẩu không chính xác',
  'User not found': 'Người dùng không tồn tại',
  'Post not found': 'Bài viết không tồn tại',
  'Comment not found': 'Bình luận không tồn tại',
  'Invalid input': 'Dữ liệu đầu vào không hợp lệ',
  'Internal server error': 'Đã xảy ra lỗi hệ thống',
  'Unauthorized': 'Vui lòng đăng nhập để tiếp tục',
  'Forbidden': 'Bạn không có quyền thực hiện hành động này',
  'Current password does not match': 'Mật khẩu hiện tại không chính xác',
  'Parent comment does not belong to this post': 'Bình luận cha không thuộc bài viết này'
}

function translateErrorMessage(msg: string): string {
  if (!msg) return 'Có lỗi kết nối đến máy chủ!'
  const trimmed = msg.trim()
  for (const [key, val] of Object.entries(ERROR_TRANSLATIONS)) {
    if (trimmed.toLowerCase() === key.toLowerCase()) {
      return val
    }
  }
  return msg
}

// ── Response Interceptor ─────────────────────────────
// Xử lý lỗi tập trung
http.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError<ApiError>) => {
    const status = error.response?.status
    const rawMessage = error.response?.data?.message || 'Có lỗi kết nối đến máy chủ!'
    const errorMessage = translateErrorMessage(rawMessage)

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
            useToast().error(translateErrorMessage(msg));
          }
        });
      }
    }

    return Promise.reject(error)
  }
)

export default http
