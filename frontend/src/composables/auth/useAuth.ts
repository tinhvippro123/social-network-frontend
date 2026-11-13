// ==========================================
// Composable — useAuth
// Login/Logout/Session management (HttpOnly Cookie)
// ==========================================
import { computed, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import authApi from '@/api/auth.api'
import type { LoginRequest, RegisterRequest, RegisterResponse, GoogleLoginPayload } from '@/api/auth.api'
import { useAuthStore } from '@/stores/auth.store'
import { useAsyncState } from '../core/useAsyncState'
import { useToast } from '../ui/useToast'

export interface AuthActionResult {
  ok: boolean
  errorCode?: string | null
  message?: string | null
}

// Shared state (singleton across components)
const { isLoading, error, execute } = useAsyncState()
const errorCode = ref<string | null>(null)

export function useAuth() {
  const router = useRouter()
  const route = useRoute()
  const authStore = useAuthStore()
  const toast = useToast()

  const user = computed(() => authStore.user)
  const isLoggedIn = computed(() => authStore.isLoggedIn)
  const isAdmin = computed(() => authStore.isAdmin)
  const isModerator = computed(() => authStore.isModerator)

  function redirectByRole(userRole?: string, fallbackRoute: string | null = '/') {
    const redirectUrl = route.query.redirect as string
    const normalized = (userRole || '').toLowerCase()
    if (redirectUrl) {
      router.push(redirectUrl)
    } else if (normalized === 'admin') {
      router.push('/admin')
    } else if (normalized === 'moderator') {
      router.push('/admin/moderation')
    } else if (fallbackRoute) {
      router.push(fallbackRoute)
    }
  }

  /** Đăng nhập (Backend tự cấp HttpOnly Access & Refresh Cookie) */
  async function login(credentials: LoginRequest): Promise<AuthActionResult> {
    error.value = null
    errorCode.value = null
    isLoading.value = true
    try {
      const { data } = await authApi.login(credentials)
      authStore.setUser(data.data.user)
      toast.success(`Chào mừng ${data.data.user.name || 'bạn'} quay trở lại!`)
      redirectByRole(data.data.user.role)
      return { ok: true }
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Đăng nhập thất bại'
      const code = err.response?.data?.errorCode || null
      error.value = msg
      errorCode.value = code
      return { ok: false, errorCode: code, message: msg }
    } finally {
      isLoading.value = false
    }
  }

  /** Đăng nhập Google (Backend tự cấp HttpOnly Access & Refresh Cookie) */
  async function loginWithGoogle(payload: GoogleLoginPayload) {
    error.value = null
    errorCode.value = null
    await execute(async () => {
      const { data } = await authApi.loginWithGoogle(payload)
      authStore.setUser(data.data.user)

      const isAuthPage = Boolean(route.meta?.guestOnly) || ['/login', '/register', '/forgot-password'].includes(route.path)
      if (isAuthPage || route.query.redirect) {
        redirectByRole(data.data.user.role)
      }
    }, 'Đăng nhập Google thất bại')
  }

  /** Đăng ký */
  async function register(data: RegisterRequest): Promise<RegisterResponse | undefined> {
    error.value = null
    errorCode.value = null
    return await execute(async () => {
      const res = await authApi.register(data)
      const result = res.data.data
      if (result?.requiresVerification) {
        toast.success(result.message || 'Mã xác thực đã được gửi tới email của bạn!')
      } else {
        toast.success('Đăng ký tài khoản thành công! Vui lòng đăng nhập.')
        router.push('/login')
      }
      return result
    }, 'Đăng ký thất bại')
  }

  /** Đăng xuất (gọi Backend xóa HttpOnly Cookie rồi xóa state RAM) */
  async function logout() {
    try {
      await authApi.logout()
    } catch (e) {
      console.warn('Lỗi khi gọi API đăng xuất:', e)
    } finally {
      authStore.clearAuth()
      router.push('/')
    }
  }

  /** Khôi phục session từ HttpOnly Cookie khi app khởi tạo */
  async function initAuth() {
    await authStore.bootstrapSession()
  }

  /** Lấy profile mới nhất từ server */
  async function fetchProfile() {
    try {
      const { data } = await authApi.getProfile()
      authStore.setUser(data.data)
    } catch {
      await logout()
    }
  }

  return {
    user,
    isLoading,
    error,
    errorCode,
    isLoggedIn,
    isAdmin,
    isModerator,
    redirectByRole,
    login,
    loginWithGoogle,
    register,
    logout,
    initAuth,
    fetchProfile,
  }
}
