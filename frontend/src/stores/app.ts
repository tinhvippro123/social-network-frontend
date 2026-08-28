import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User, Notification } from '@/types'
import { currentUser, mockNotifications } from '@/data/mockData'

export const useAppStore = defineStore('app', () => {
  // ---- Theme ----
  const isDark = ref(true)
  const toggleTheme = () => {
    isDark.value = !isDark.value
    document.documentElement.classList.toggle('dark', isDark.value)
    localStorage.setItem('theme', isDark.value ? 'dark' : 'light')
  }
  const initTheme = () => {
    const saved = localStorage.getItem('theme')
    isDark.value = saved ? saved === 'dark' : true
    document.documentElement.classList.toggle('dark', isDark.value)
  }

  // ---- Sidebar ----
  const isSidebarOpen = ref(true)
  const isMobileSidebarOpen = ref(false)
  const toggleSidebar = () => { isSidebarOpen.value = !isSidebarOpen.value }
  const toggleMobileSidebar = () => { isMobileSidebarOpen.value = !isMobileSidebarOpen.value }
  const closeMobileSidebar = () => { isMobileSidebarOpen.value = false }

  // ---- Auth (mock) ----
  const user = ref<User | null>(currentUser)
  const isLoggedIn = computed(() => !!user.value)
  const isAdmin = computed(() => user.value?.role === 'admin')

  // ---- Notifications ----
  const notifications = ref<Notification[]>(mockNotifications)
  const unreadNotifications = computed(() => notifications.value.filter(n => !n.isRead).length)
  const markNotificationRead = (id: string) => {
    const n = notifications.value.find(n => n.id === id)
    if (n) n.isRead = true
  }
  const markAllRead = () => {
    notifications.value.forEach(n => n.isRead = true)
  }

  // ---- Search ----
  const searchQuery = ref('')
  const isSearchOpen = ref(false)

  return {
    isDark, toggleTheme, initTheme,
    isSidebarOpen, isMobileSidebarOpen, toggleSidebar, toggleMobileSidebar, closeMobileSidebar,
    user, isLoggedIn, isAdmin,
    notifications, unreadNotifications, markNotificationRead, markAllRead,
    searchQuery, isSearchOpen
  }
})
