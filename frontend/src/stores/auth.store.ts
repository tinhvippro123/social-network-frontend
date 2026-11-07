// ==========================================
// Store — Auth (In-memory User state + HttpOnly Cookie Session)
// ==========================================
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User } from '@/types'
import authApi from '@/api/auth.api'
import { hasAuthSessionCookie, clearAuthIndicatorCookie } from '@/utils/cookies'

const LEGACY_LOCAL_STORAGE_KEYS = [
  'vietblog_access_token',
  'vietblog_refresh_token',
  'vietblog_user',
] as const

function purgeLegacyLocalStorage() {
  if (typeof window === 'undefined') return
  for (const key of LEGACY_LOCAL_STORAGE_KEYS) {
    localStorage.removeItem(key)
  }
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const isInitialized = ref(false)
  let bootstrapPromise: Promise<void> | null = null

  const isLoggedIn = computed(() => !!user.value)
  const isAdmin = computed(() => {
    const role = (user.value?.role || '').toLowerCase()
    return role === 'admin'
  })
  const isModerator = computed(() => {
    const role = (user.value?.role || '').toLowerCase()
    return role === 'moderator' || isAdmin.value
  })

  function setUser(newUser: User | null) {
    user.value = newUser
    isInitialized.value = true
    purgeLegacyLocalStorage()
  }

  function clearAuth() {
    user.value = null
    isInitialized.value = true
    clearAuthIndicatorCookie()
    purgeLegacyLocalStorage()
  }

  /** Khôi phục phiên từ HttpOnly Cookie khi tải lại trang (single-flight) */
  async function bootstrapSession(): Promise<void> {
    purgeLegacyLocalStorage()
    if (user.value) {
      isInitialized.value = true
      return
    }
    if (!hasAuthSessionCookie()) {
      isInitialized.value = true
      return
    }
    if (bootstrapPromise) {
      return bootstrapPromise
    }

    bootstrapPromise = (async () => {
      try {
        const { data } = await authApi.getProfile({
          skipErrorToast: true,
          skipAuthRedirect: true,
        } as any)
        if (data?.data) {
          user.value = data.data
        } else {
          clearAuth()
        }
      } catch {
        clearAuth()
      } finally {
        isInitialized.value = true
        bootstrapPromise = null
      }
    })()

    return bootstrapPromise
  }

  function initAuth() {
    purgeLegacyLocalStorage()
    if (hasAuthSessionCookie() && !user.value) {
      void bootstrapSession()
    } else {
      isInitialized.value = true
    }
  }

  purgeLegacyLocalStorage()

  return {
    user,
    isInitialized,
    isLoggedIn,
    isAdmin,
    isModerator,
    setUser,
    clearAuth,
    bootstrapSession,
    initAuth,
  }
})
