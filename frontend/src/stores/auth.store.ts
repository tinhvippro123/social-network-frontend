// ==========================================
// Store — Auth (User state + tokens)
// ==========================================
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User } from '@/types'
import { STORAGE_KEYS } from '@/constants'

// Tạm thời dùng mock data, sau thay bằng API
import { currentUser } from '@/data/mockData'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(currentUser) // TODO: thay bằng null khi có API
  const accessToken = ref<string | null>(localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN))

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

  return {
    user, accessToken,
    isLoggedIn, isAdmin, isModerator,
    setUser, setToken, clearAuth,
  }
})
