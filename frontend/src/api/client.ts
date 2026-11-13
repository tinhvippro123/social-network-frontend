// ==========================================
// HTTP Client — Axios instance dùng chung toàn app (HttpOnly Cookie + Silent Refresh)
// ==========================================
import axios from 'axios'
import type { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse, AxiosError } from 'axios'
import type { User } from '@/types'
import { hasAuthSessionCookie } from '@/utils/cookies'
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

interface RetryableRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean
  skipErrorToast?: boolean
  skipAuthRedirect?: boolean
}

// Tạo Axios instance 1 lần — trình duyệt tự động gửi/nhận HttpOnly Cookie qua withCredentials
const http: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 15_000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  },
})

// Single-flight promise để tránh gọi trùng /auth/refresh khi nhiều API cùng nhận 401
let refreshPromise: Promise<User | null> | null = null

async function refreshSessionSingleFlight(): Promise<User | null> {
  if (refreshPromise) {
    return refreshPromise
  }
  refreshPromise = (async () => {
    try {
      const response = await http.post<ApiResponse<{ user: User }>>(
        '/auth/refresh',
        {},
        {
          skipErrorToast: true,
          skipAuthRedirect: true,
        } as any
      )
      return response.data?.data?.user ?? null
    } finally {
      refreshPromise = null
    }
  })()
  return refreshPromise
}

const ERROR_TRANSLATIONS: Record<string, string> = {
  'Email already in use': 'Email này đã được sử dụng',
  'Bad credentials': 'Email hoặc mật khẩu không chính xác',
  'User not found': 'Người dùng không tồn tại',
  'Post not found': 'Bài viết không tồn tại',
  'Comment not found': 'Bình luận không tồn tại',
  'Invalid input': 'Dữ liệu đầu vào không hợp lệ',
  'Invalid request': 'Dữ liệu yêu cầu không hợp lệ',
  'Uploaded file exceeds the size limit': 'Kích thước tệp tải lên vượt quá giới hạn cho phép (tối đa 5MB)',
  'Internal server error': 'Đã xảy ra lỗi hệ thống',
  'Unauthorized': 'Vui lòng đăng nhập để tiếp tục',
  'Authentication required': 'Vui lòng đăng nhập để tiếp tục',
  'Forbidden': 'Bạn không có quyền thực hiện hành động này',
  'Current password does not match': 'Mật khẩu hiện tại không chính xác',
  'Parent comment does not belong to this post': 'Bình luận cha không thuộc bài viết này',
  'Event end time must be after start time': 'Thời gian kết thúc sự kiện phải sau thời gian bắt đầu',
  'Latitude and longitude must be provided together': 'Vĩ độ và kinh độ phải được cung cấp cùng nhau'
}

export function translateErrorMessage(msg: string): string {
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
// Xử lý lỗi tập trung + Tự động gia hạn ngầm HttpOnly Cookie khi 401
http.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError<ApiError>) => {
    const status = error.response?.status
    const originalConfig = error.config as RetryableRequestConfig | undefined
    const url = originalConfig?.url || ''
    const rawMessage = error.response?.data?.message || 'Có lỗi kết nối đến máy chủ!'
    const errorMessage = translateErrorMessage(rawMessage)
    if (error.response?.data) {
      error.response.data.message = errorMessage
    }

    if (status === 401) {
      const isCredentialAuthEndpoint =
        url.includes('/auth/login') ||
        url.includes('/auth/register') ||
        url.includes('/auth/google')
      const isRefreshOrLogoutEndpoint =
        url.includes('/auth/refresh') ||
        url.includes('/auth/logout')

      // 1. Lỗi đăng nhập / đăng ký (sai mật khẩu...)
      if (isCredentialAuthEndpoint) {
        if (!originalConfig?.skipErrorToast) {
          const { useToast } = await import('@/composables/ui/useToast')
          useToast().error(errorMessage || 'Email hoặc mật khẩu không chính xác')
        }
        return Promise.reject(error)
      }

      // 2. Endpoint refresh hoặc logout tự trả lỗi về cho hàm gọi xử lý, tránh lặp vô hạn
      if (isRefreshOrLogoutEndpoint) {
        return Promise.reject(error)
      }

      const { useAuthStore } = await import('@/stores/auth.store')
      const authStore = useAuthStore()
      const hadSession = authStore.isLoggedIn || hasAuthSessionCookie()

      // 3. Tự động làm mới phiên ngầm bằng HttpOnly Refresh Cookie (1 lần duy nhất)
      if (originalConfig && !originalConfig._retry && hadSession) {
        originalConfig._retry = true
        try {
          const refreshedUser = await refreshSessionSingleFlight()
          if (refreshedUser) {
            authStore.setUser(refreshedUser)
            return http(originalConfig)
          }
        } catch {
          // Refresh Cookie đã hết hạn hoặc bị thu hồi -> dọn phiên bên dưới
        }
      }

      authStore.clearAuth()

      if (originalConfig?.skipAuthRedirect) {
        return Promise.reject(error)
      }

      // 4. Nếu trước đó đang có phiên mà cả Refresh Cookie cũng hết hạn -> báo hết phiên
      if (hadSession) {
        if (router.currentRoute.value.path !== '/login') {
          router.push('/login')
        }
        if (!originalConfig?.skipErrorToast) {
          const { useToast } = await import('@/composables/ui/useToast')
          useToast().error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.')
        }
        return Promise.reject(error)
      }

      // 5. Nếu là khách (chưa có phiên) và đang ở route yêu cầu đăng nhập
      if (
        router.currentRoute.value.meta?.requiresAuth ||
        router.currentRoute.value.meta?.requiresAdmin ||
        router.currentRoute.value.meta?.requiresModerator
      ) {
        if (router.currentRoute.value.path !== '/login') {
          router.push('/login')
        }
        if (!originalConfig?.skipErrorToast) {
          const { useToast } = await import('@/composables/ui/useToast')
          useToast().error('Vui lòng đăng nhập để tiếp tục')
        }
      }

      return Promise.reject(error)
    }

    if (originalConfig?.skipErrorToast) {
      return Promise.reject(error)
    }

    if (status === 403) {
      const { useToast } = await import('@/composables/ui/useToast')
      useToast().error(errorMessage || 'Bạn không có quyền thực hiện hành động này!')
    } else if (status) {
      if (error.response?.data?.data && typeof error.response.data.data === 'object') {
        console.error('Validation Errors:', error.response.data.data)
      }
      const { useToast } = await import('@/composables/ui/useToast')
      const fieldErrors = error.response?.data?.data as Record<string, string> | undefined
      const fieldMessages = fieldErrors && typeof fieldErrors === 'object'
        ? Object.values(fieldErrors)
            .filter((msg): msg is string => typeof msg === 'string' && msg.trim().length > 0)
            .map(translateErrorMessage)
        : []

      if (fieldMessages.length > 0) {
        useToast().error(fieldMessages.join(' • '))
      } else {
        useToast().error(errorMessage)
      }
    }

    return Promise.reject(error)
  }
)

export default http
