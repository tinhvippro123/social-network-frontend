// ==========================================
// Composable — useAuth
// Login/Logout/Token management
// ==========================================
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import authApi from '@/api/auth.api'
import type { UserProfile, LoginRequest, RegisterRequest } from '@/api/auth.api'
import { STORAGE_KEYS } from '@/constants'

// Shared state (singleton across components)
const user = ref<UserProfile | null>(null)
const isLoading = ref(false)
const error = ref<string | null>(null)

export function useAuth() {
  const router = useRouter()

  const isLoggedIn = computed(() => !!user.value)
  const isAdmin = computed(() => user.value?.role === 'admin')
  const isModerator = computed(() => user.value?.role === 'moderator' || isAdmin.value)

  /** Đăng nhập */
  async function login(credentials: LoginRequest) {
    isLoading.value = true
    error.value = null
    try {
      const { data } = await authApi.login(credentials)
      localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, data.data.accessToken)
      localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, data.data.refreshToken)
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(data.data.user))
      user.value = data.data.user
      router.push('/')
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Đăng nhập thất bại'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /** Đăng ký */
  async function register(data: RegisterRequest) {
    isLoading.value = true
    error.value = null
    try {
      await authApi.register(data)
      router.push('/login')
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Đăng ký thất bại'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /** Đăng xuất */
  function logout() {
    localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN)
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN)
    localStorage.removeItem(STORAGE_KEYS.USER)
    user.value = null
    router.push('/login')
  }

  /** Khôi phục session từ localStorage (gọi khi app mount) */
  function initAuth() {
    const savedUser = localStorage.getItem(STORAGE_KEYS.USER)
    if (savedUser) {
      try {
        user.value = JSON.parse(savedUser)
      } catch {
        localStorage.removeItem(STORAGE_KEYS.USER)
      }
    }
  }

  /** Lấy profile mới nhất từ server */
  async function fetchProfile() {
    try {
      const { data } = await authApi.getProfile()
      user.value = data.data
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(data.data))
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
