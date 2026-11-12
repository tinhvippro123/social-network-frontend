// ==========================================
// Composable — useAuth
// Login/Logout/Session management (HttpOnly Cookie)
// ==========================================
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import authApi from '@/api/auth.api'
import type { LoginRequest, RegisterRequest, GoogleLoginPayload } from '@/api/auth.api'
import { useAuthStore } from '@/stores/auth.store'
import { useAsyncState } from '../core/useAsyncState'
import { useToast } from '../ui/useToast'

// Shared state (singleton across components)
const { isLoading, error, execute } = useAsyncState()

export function useAuth() {
  const router = useRouter()
  const route = useRoute()
  const authStore = useAuthStore()
  const toast = useToast()

  const user = computed(() => authStore.user)
  const isLoggedIn = computed(() => authStore.isLoggedIn)
  const isAdmin = computed(() => authStore.isAdmin)
  const isModerator = computed(() => authStore.isModerator)

  /** Đăng nhập (Backend tự cấp HttpOnly Access & Refresh Cookie) */
  async function login(credentials: LoginRequest) {
    error.value = null
    await execute(async () => {
      const { data } = await authApi.login(credentials)
      authStore.setUser(data.data.user)
      toast.success(`Chào mừng ${data.data.user.name || 'bạn'} quay trở lại!`)

      const redirectUrl = route.query.redirect as string
      const userRole = (data.data.user.role || '').toLowerCase()
      if (redirectUrl) {
        router.push(redirectUrl)
      } else if (userRole === 'admin') {
        router.push('/admin')
      } else if (userRole === 'moderator') {
        router.push('/admin/moderation')
      } else {
        router.push('/')
      }
    }, 'Đăng nhập thất bại')
  }

  /** Đăng nhập Google (Backend tự cấp HttpOnly Access & Refresh Cookie) */
  async function loginWithGoogle(payload: GoogleLoginPayload) {
    error.value = null
    await execute(async () => {
      const { data } = await authApi.loginWithGoogle(payload)
      authStore.setUser(data.data.user)

      const redirectUrl = route.query.redirect as string
      const userRole = (data.data.user.role || '').toLowerCase()
      const isAuthPage = Boolean(route.meta?.guestOnly) || ['/login', '/register', '/forgot-password'].includes(route.path)
      if (redirectUrl) {
        router.push(redirectUrl)
      } else if (isAuthPage) {
        if (userRole === 'admin') {
          router.push('/admin')
        } else if (userRole === 'moderator') {
          router.push('/admin/moderation')
        } else {
          router.push('/')
        }
      }
    }, 'Đăng nhập Google thất bại')
  }

  /** Đăng ký */
  async function register(data: RegisterRequest) {
    error.value = null
    await execute(async () => {
      await authApi.register(data)
      toast.success('Đăng ký tài khoản thành công! Vui lòng đăng nhập.')
      router.push('/login')
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
      router.push('/login')
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
    isLoggedIn,
    isAdmin,
    isModerator,
    login,
    loginWithGoogle,
    register,
    logout,
    initAuth,
    fetchProfile,
  }
}
