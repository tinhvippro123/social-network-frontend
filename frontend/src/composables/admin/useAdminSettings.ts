import { ref, onMounted } from 'vue'
import adminApi from '@/api/admin.api'
import { useToast } from '../ui/useToast'

export function useAdminSettings() {
  const toast = useToast()
  const isLoading = ref(false)
  const isSaving = ref(false)

  const siteName = ref('VietBlog')
  const siteDescription = ref('Nền tảng chia sẻ kiến thức cho cộng đồng')
  const allowRegistration = ref(true)
  const requireEmailVerification = ref(true)
  const autoHideReportThreshold = ref(10)
  const enableRealTimeChat = ref(true)
  const enableLocationPosts = ref(true)
  const enableSemanticSearch = ref(true)
  const maintenanceMode = ref(false)

  const initData = async () => {
    isLoading.value = true
    try {
      const res = await adminApi.getSettings()
      if (res.data?.data) {
        const s = res.data.data
        if (s.siteName !== undefined) siteName.value = String(s.siteName)
        if (s.siteDescription !== undefined) siteDescription.value = String(s.siteDescription)
        if (s.allowRegistration !== undefined) allowRegistration.value = Boolean(s.allowRegistration)
        if (s.requireEmailVerification !== undefined) requireEmailVerification.value = Boolean(s.requireEmailVerification)
        if (s.autoHideReportThreshold !== undefined) autoHideReportThreshold.value = Number(s.autoHideReportThreshold)
        if (s.enableRealTimeChat !== undefined) enableRealTimeChat.value = Boolean(s.enableRealTimeChat)
        if (s.enableLocationPosts !== undefined) enableLocationPosts.value = Boolean(s.enableLocationPosts)
        if (s.enableSemanticSearch !== undefined) enableSemanticSearch.value = Boolean(s.enableSemanticSearch)
        if (s.maintenanceMode !== undefined) maintenanceMode.value = Boolean(s.maintenanceMode)
      }
    } catch (err: any) {
      console.error('Lỗi tải cài đặt hệ thống:', err)
    } finally {
      isLoading.value = false
    }
  }

  const saveSettings = async () => {
    if (!siteName.value.trim()) {
      toast.error('Tên trang web không được để trống')
      return
    }
    const clampedThreshold = Math.min(100, Math.max(1, Number(autoHideReportThreshold.value) || 10))
    autoHideReportThreshold.value = clampedThreshold
    isSaving.value = true
    try {
      const payload = {
        siteName: siteName.value.trim(),
        siteDescription: siteDescription.value.trim(),
        allowRegistration: allowRegistration.value,
        requireEmailVerification: requireEmailVerification.value,
        autoHideReportThreshold: clampedThreshold,
        enableRealTimeChat: enableRealTimeChat.value,
        enableLocationPosts: enableLocationPosts.value,
        enableSemanticSearch: enableSemanticSearch.value,
        maintenanceMode: maintenanceMode.value
      }
      await adminApi.updateSettings(payload)
      toast.success('Đã lưu cấu hình cài đặt hệ thống vào máy chủ!')
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Lưu cài đặt thất bại')
    } finally {
      isSaving.value = false
    }
  }

  onMounted(async () => {
    await initData()
  })

  return {
    isLoading,
    isSaving,
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
