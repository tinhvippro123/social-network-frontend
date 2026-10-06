// ==========================================
// Store — Auth (User state + tokens)
// ==========================================
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User } from '@/types'
import { STORAGE_KEYS } from '@/constants'
export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const accessToken = ref<string | null>(null)

  const isLoggedIn = computed(() => !!user.value)
  const isAdmin = computed(() => user.value?.role === 'admin')
  const isModerator = computed(() => user.value?.role === 'moderator' || isAdmin.value)

  function setUser(newUser: User | null) {
    user.value = newUser
    if (newUser) {
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(newUser))
    } else {
      localStorage.removeItem(STORAGE_KEYS.USER)
    }
  }

  function setToken(token: string | null) {
    accessToken.value = token
    if (token) {
      localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, token)
    } else {
      localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN)
    }
  }

  function clearAuth() {
    user.value = null
    accessToken.value = null
    localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN)
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN)
    localStorage.removeItem(STORAGE_KEYS.USER)
  }

  function initAuth() {
    accessToken.value = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN)
    const savedUser = localStorage.getItem(STORAGE_KEYS.USER)
    try {
      if (savedUser && savedUser !== 'null' && savedUser !== 'undefined') {
        user.value = JSON.parse(savedUser)
      }
    } catch (e) {
      console.error('Lỗi khi đọc dữ liệu User từ bộ nhớ tạm:', e)
      localStorage.removeItem(STORAGE_KEYS.USER)
    }
  }

  return {
    user, accessToken,
    isLoggedIn, isAdmin, isModerator,
    setUser, setToken, clearAuth, initAuth,
  }
})
