// ==========================================
// Store — UI (Theme, Sidebar, Notifications, Search)
// ==========================================
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Notification } from '@/types'
import { STORAGE_KEYS } from '@/constants'
import { useAuthStore } from '@/stores/auth.store'
import { hasAuthSessionCookie } from '@/utils/cookies'

import notificationsApi from '@/api/notifications.api'

export const useUiStore = defineStore('ui', () => {
  // ── Theme (Locked to Light Mode) ───────────
  const isDark = ref(false)

  function toggleTheme() {
    isDark.value = false
    document.documentElement.classList.remove('dark')
    localStorage.setItem(STORAGE_KEYS.THEME, 'light')
  }

  function initTheme() {
    isDark.value = false
    document.documentElement.classList.remove('dark')
    localStorage.setItem(STORAGE_KEYS.THEME, 'light')
  }

  initTheme()

  // ── Sidebar ────────────────────────────────
  const isSidebarOpen = ref(true)
  const isMobileSidebarOpen = ref(false)

  function toggleSidebar() { isSidebarOpen.value = !isSidebarOpen.value }
  function toggleMobileSidebar() { isMobileSidebarOpen.value = !isMobileSidebarOpen.value }
  function closeMobileSidebar() { isMobileSidebarOpen.value = false }

  // ── Notifications ──────────────────────────
  const notifications = ref<Notification[]>([])
  
  async function fetchNotifications() {
    const authStore = useAuthStore()
    if (!authStore.isLoggedIn && !hasAuthSessionCookie()) return
    try {
      const { data } = await notificationsApi.getAll()
      notifications.value = (data.data || []).map((item: any) => ({ ...item, type: (item.type || 'system').toLowerCase(), isRead: Boolean(item.isRead) }))
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
    notificationsApi.markRead(id).catch(err => console.error('Lỗi đánh dấu đã đọc:', err))
    if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent('notification-marked-read', { detail: { id } }))
  }

  function markAllRead() {
    notifications.value.forEach(n => n.isRead = true)
    notificationsApi.markAllRead().catch(err => console.error('Lỗi đánh dấu tất cả đã đọc:', err))
    if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent('notifications-marked-all-read'))
  }

  // ── Search UI ──────────────────────────────
  const searchQuery = ref('')
  const isSearchOpen = ref(false)
  const pendingSearchFile = ref<{ file: File; type: 'image' | 'document' } | null>(null)

  function setPendingSearchFile(file: File, type: 'image' | 'document') {
    pendingSearchFile.value = { file, type }
  }

  function consumePendingSearchFile() {
    const item = pendingSearchFile.value
    pendingSearchFile.value = null
    return item
  }

  // ── Auth Modal ──────────────────────────────
  const showAuthModal = ref(false)
  const authModalTab = ref<'login' | 'register'>('login')
  const authRedirectPath = ref<string | null>(null)

  function openAuthModal(tab: 'login' | 'register' = 'login', redirectPath: string | null = null) {
    authModalTab.value = tab
    authRedirectPath.value = redirectPath
    showAuthModal.value = true
  }

  function consumeAuthRedirect(): string | null {
    const target = authRedirectPath.value
    authRedirectPath.value = null
    return target
  }

  function closeAuthModal() {
    showAuthModal.value = false
    authRedirectPath.value = null
  }

  return {
    // Theme
    isDark, toggleTheme, initTheme,
    // Sidebar
    isSidebarOpen, isMobileSidebarOpen, toggleSidebar, toggleMobileSidebar, closeMobileSidebar,
    // Notifications
    notifications, unreadCount, markNotificationRead, markAllRead,
    // Search
    searchQuery, isSearchOpen, pendingSearchFile, setPendingSearchFile, consumePendingSearchFile,
    fetchNotifications,
    // Auth Modal
    showAuthModal, authModalTab, authRedirectPath, openAuthModal, consumeAuthRedirect, closeAuthModal,
  }
})
