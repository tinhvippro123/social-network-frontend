import { ref, onMounted } from 'vue'
import { useAdmin } from './useAdmin'
import { useToast } from './useToast'

export function useAdminSettings() {
  const { isLoading, fetchStats } = useAdmin()
  const toast = useToast()

  const siteName = ref('VietBlog')
  const siteDescription = ref('Nền tảng chia sẻ kiến thức cho cộng đồng')
  const allowRegistration = ref(true)
  const requireEmailVerification = ref(true)
  const autoHideReportThreshold = ref(10)
  const enableRealTimeChat = ref(true)
  const enableLocationPosts = ref(true)
  const enableSemanticSearch = ref(true)
  const maintenanceMode = ref(false)

  const initData = () => {
    fetchStats()
  }

  const saveSettings = () => {
    // API Call Mock
    toast.success('Đã lưu cấu hình cài đặt hệ thống!')
  }

  onMounted(async () => {
    await initData()
  })

  return {
    isLoading,
    siteName,
    siteDescription,
    allowRegistration,
    requireEmailVerification,
    autoHideReportThreshold,
    enableRealTimeChat,
    enableLocationPosts,
    enableSemanticSearch,
    maintenanceMode,
    initData,
    saveSettings
  }
}
