// ==========================================
// Composable — useAuth
// Login/Logout/Token management
// ==========================================
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import authApi from '@/api/auth.api'
import type { LoginRequest, RegisterRequest } from '@/api/auth.api'
import { STORAGE_KEYS } from '@/constants'
import { useAuthStore } from '@/stores/auth.store'
import { useAsyncState } from './useAsyncState'

// Shared state (singleton across components)
const { isLoading, error, execute } = useAsyncState()

export function useAuth() {
  const router = useRouter()
  const route = useRoute()
  const authStore = useAuthStore()

  const user = computed(() => authStore.user)
  const isLoggedIn = computed(() => authStore.isLoggedIn)
  const isAdmin = computed(() => authStore.isAdmin)
  const isModerator = computed(() => authStore.isModerator)

  /** Đăng nhập */
  async function login(credentials: LoginRequest) {
    await execute(async () => {
      const { data } = await authApi.login(credentials)
      authStore.setToken(data.data.accessToken)
      localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, data.data.refreshToken)
      authStore.setUser(data.data.user)

      const redirectUrl = route.query.redirect as string
      if (redirectUrl) {
        router.push(redirectUrl)
      } else if (data.data.user.role === 'admin') {
        router.push('/admin')
      } else {
        router.push('/')
      }
    }, 'Đăng nhập thất bại')
  }

  /** Đăng ký */
  async function register(data: RegisterRequest) {
    await execute(async () => {
      await authApi.register(data)
      router.push('/login')
    }, 'Đăng ký thất bại')
  }

  /** Đăng xuất */
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

  /** Khôi phục session từ localStorage (gọi khi app mount) */
  function initAuth() {
    // AuthStore already handles this inside its definition!
  }

  /** Lấy profile mới nhất từ server */
  async function fetchProfile() {
    try {
      const { data } = await authApi.getProfile()
      authStore.setUser(data.data)
    } catch {
      logout()
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
    register,
    logout,
    initAuth,
    fetchProfile,
  }
}
