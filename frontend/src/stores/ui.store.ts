// ==========================================
// Store — UI (Theme, Sidebar, Notifications, Search)
// ==========================================
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Notification } from '@/types'
import { STORAGE_KEYS } from '@/constants'

import notificationsApi from '@/api/notifications.api'

export const useUiStore = defineStore('ui', () => {
  // ── Theme ──────────────────────────────────
  const isDark = ref(true)

  function toggleTheme() {
    isDark.value = !isDark.value
    document.documentElement.classList.toggle('dark', isDark.value)
    localStorage.setItem(STORAGE_KEYS.THEME, isDark.value ? 'dark' : 'light')
  }

  function initTheme() {
    const saved = localStorage.getItem(STORAGE_KEYS.THEME)
    isDark.value = saved ? saved === 'dark' : true
    document.documentElement.classList.toggle('dark', isDark.value)
  }

  // ── Sidebar ────────────────────────────────
  const isSidebarOpen = ref(true)
  const isMobileSidebarOpen = ref(false)

  function toggleSidebar() { isSidebarOpen.value = !isSidebarOpen.value }
  function toggleMobileSidebar() { isMobileSidebarOpen.value = !isMobileSidebarOpen.value }
  function closeMobileSidebar() { isMobileSidebarOpen.value = false }

  // ── Notifications ──────────────────────────
  const notifications = ref<Notification[]>([])
  
  async function fetchNotifications() {
    try {
      const { data } = await notificationsApi.getAll()
      notifications.value = data.data
    } catch (e) {
      console.error('Lỗi lấy thông báo:', e)
    }
  }

  const unreadCount = computed(() =>
    notifications.value.filter(n => !n.isRead).length
  )

  function markNotificationRead(id: string) {
    const n = notifications.value.find(n => n.id === id)
    if (n) n.isRead = true
  }

  function markAllRead() {
    notifications.value.forEach(n => n.isRead = true)
  }

  // ── Search UI ──────────────────────────────
  const searchQuery = ref('')
  const isSearchOpen = ref(false)

  // ── Auth Modal ──────────────────────────────
  const showAuthModal = ref(false)
  const authModalTab = ref<'login' | 'register'>('login')

  function openAuthModal(tab: 'login' | 'register' = 'login') {
    authModalTab.value = tab
    showAuthModal.value = true
  }

  function closeAuthModal() {
    showAuthModal.value = false
  }

  return {
    // Theme
    isDark, toggleTheme, initTheme,
    // Sidebar
    isSidebarOpen, isMobileSidebarOpen, toggleSidebar, toggleMobileSidebar, closeMobileSidebar,
    // Notifications
    notifications, unreadCount, markNotificationRead, markAllRead,
    // Search
    searchQuery, isSearchOpen,
    fetchNotifications,
    // Auth Modal
    showAuthModal, authModalTab, openAuthModal, closeAuthModal,
  }
})
