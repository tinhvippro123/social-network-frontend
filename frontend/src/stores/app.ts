// ==========================================
// Store — App (Backward Compatibility Wrapper)
// ==========================================
// File này giữ lại useAppStore cũ để các components hiện tại không bị lỗi.
// Bên trong nó delegate sang auth.store + ui.store.
//
// Khi refactor xong các view components, sẽ import trực tiếp:
//   import { useAuthStore } from '@/stores/auth.store'
//   import { useUiStore } from '@/stores/ui.store'
// ==========================================
import { defineStore } from 'pinia'
import { useAuthStore } from './auth.store'
import { useUiStore } from './ui.store'
import { computed } from 'vue'

export const useAppStore = defineStore('app', () => {
  const authStore = useAuthStore()
  const uiStore = useUiStore()

  return {
    // Auth (delegate)
    user: computed(() => authStore.user),
    isLoggedIn: computed(() => authStore.isLoggedIn),
    isAdmin: computed(() => authStore.isAdmin),

    // UI (delegate)
    isDark: computed(() => uiStore.isDark),
    isSidebarOpen: computed({
      get: () => uiStore.isSidebarOpen,
      set: (val: boolean) => { uiStore.isSidebarOpen = val },
    }),
    isMobileSidebarOpen: computed(() => uiStore.isMobileSidebarOpen),
    toggleTheme: () => uiStore.toggleTheme(),
    initTheme: () => uiStore.initTheme(),
    toggleSidebar: () => uiStore.toggleSidebar(),
    toggleMobileSidebar: () => uiStore.toggleMobileSidebar(),
    closeMobileSidebar: () => uiStore.closeMobileSidebar(),

    // Notifications (delegate)
    notifications: computed(() => uiStore.notifications),
    unreadNotifications: computed(() => uiStore.unreadCount),
    markNotificationRead: (id: string) => uiStore.markNotificationRead(id),
    markAllRead: () => uiStore.markAllRead(),

    // Search (delegate)
    searchQuery: computed(() => uiStore.searchQuery),
    isSearchOpen: computed(() => uiStore.isSearchOpen),
  }
})
