import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUiStore } from '@/stores/ui.store'
import { useAuth } from './useAuth'

export function useMainLayout() {
  const router = useRouter()
  const uiStore = useUiStore()
  const { logout: authLogout, user } = useAuth()

  const showNotifications = ref(false)
  const showUserMenu = ref(false)
  const isMobile = ref(false)

  const checkMobile = () => {
    isMobile.value = window.innerWidth < 1024
    if (isMobile.value) {
      uiStore.isSidebarOpen = false
    }
  }

  const handleClickOutside = (e: Event) => {
    const target = e.target as HTMLElement
    if (!target.closest('.notification-panel') && !target.closest('.notification-trigger')) {
      showNotifications.value = false
    }
    if (!target.closest('.user-menu') && !target.closest('.user-trigger')) {
      showUserMenu.value = false
    }
  }

  const initEvents = () => {
    checkMobile()
    uiStore.fetchNotifications()
    window.addEventListener('resize', checkMobile)
    document.addEventListener('click', handleClickOutside)
  }

  const cleanupEvents = () => {
    window.removeEventListener('resize', checkMobile)
    document.removeEventListener('click', handleClickOutside)
  }

  onMounted(() => {
    initEvents()
  })

  onUnmounted(() => {
    cleanupEvents()
  })

  const navigateTo = (path: string) => {
    router.push(path)
    if (isMobile.value) uiStore.closeMobileSidebar()
  }

  const logout = async () => {
    await authLogout()
  }

  return {
    uiStore,
    user,
    showNotifications,
    showUserMenu,
    isMobile,
    initEvents,
    cleanupEvents,
    navigateTo,
    logout
  }
}
