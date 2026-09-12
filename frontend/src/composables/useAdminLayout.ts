import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuth } from './useAuth'
import { useUiStore } from '@/stores/ui.store'

export function useAdminLayout() {
  const router = useRouter()
  const route = useRoute()
  const uiStore = useUiStore()
  const { logout: authLogout, user } = useAuth()

  const isMobile = ref(false)
  const sidebarOpen = ref(true)
  const mobileSidebarOpen = ref(false)
  const showUserMenu = ref(false)

  const checkMobile = () => {
    isMobile.value = window.innerWidth < 1024
    if (isMobile.value) sidebarOpen.value = false
  }

  const handleClickOutside = (e: Event) => {
    const target = e.target as HTMLElement
    if (!target.closest('.user-menu') && !target.closest('.user-trigger')) {
      showUserMenu.value = false
    }
  }

  const initEvents = () => {
    checkMobile()
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
    if (isMobile.value) mobileSidebarOpen.value = false
  }

  const logout = async () => {
    await authLogout()
  }

  const isActive = (path: string) => {
    if (path === '/admin') return route.path === '/admin'
    return route.path.startsWith(path)
  }

  return {
    uiStore,
    user,
    isMobile,
    sidebarOpen,
    mobileSidebarOpen,
    showUserMenu,
    initEvents,
    cleanupEvents,
    navigateTo,
    logout,
    isActive
  }
}
