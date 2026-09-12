import { ref } from 'vue'
import { useAuth } from './useAuth'
import authApi from '@/api/auth.api'
import { useAuthStore } from '@/stores/auth.store'
import { useToast } from './useToast'
import { useUiStore } from '@/stores/ui.store'
import { SETTINGS_TABS } from '@/constants/ui'

export function useSettings() {
  const uiStore = useUiStore()
  const { user } = useAuth()
  const authStore = useAuthStore()
  const toast = useToast()
  const isSaving = ref(false)

  const activeTab = ref('profile')
  const themeMode = ref<'light' | 'dark' | 'system'>('dark')
  const tabs = SETTINGS_TABS

  const profileForm = ref({
    name: user.value?.name || '',
    bio: user.value?.bio || '',
    email: user.value?.email || '',
  })

  const accountForm = ref({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const showCurrentPassword = ref(false)
  const showNewPassword = ref(false)

  const notificationSettings = ref({
    emailNewFollower: true,
    emailNewComment: true,
    emailNewMessage: false,
    pushNewFollower: true,
    pushNewComment: true,
    pushNewMessage: true,
    pushTrending: false,
  })

  const privacySettings = ref({
    profileVisibility: 'public',
    allowMessages: 'everyone',
    showOnlineStatus: true,
    showReadReceipts: true,
  })

  const setSystemTheme = () => {
    themeMode.value = 'system'
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    if (prefersDark !== uiStore.isDark) uiStore.toggleTheme()
  }

  const setTheme = (mode: 'light' | 'dark') => {
    themeMode.value = mode
    if (mode === 'light' && uiStore.isDark) uiStore.toggleTheme()
    if (mode === 'dark' && !uiStore.isDark) uiStore.toggleTheme()
  }

  const saveProfile = async () => {
    isSaving.value = true
    try {
      const { data } = await authApi.updateProfile({
        name: profileForm.value.name,
        bio: profileForm.value.bio
      })
      // Cập nhật lại store
      authStore.setUser(data.data)
      toast.success('Đã lưu thông tin hồ sơ!')
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Lỗi khi lưu hồ sơ!')
    } finally {
      isSaving.value = false
    }
  }

  const changePassword = async () => {
    if (accountForm.value.newPassword.length < 8) {
      toast.error('Mật khẩu mới phải có ít nhất 8 ký tự!')
      return
    }
    if (accountForm.value.newPassword !== accountForm.value.confirmPassword) {
      toast.error('Mật khẩu mới không khớp!')
      return
    }
    isSaving.value = true
    try {
      await authApi.changePassword({
        currentPassword: accountForm.value.currentPassword,
        newPassword: accountForm.value.newPassword
      })
      toast.success('Đã thay đổi mật khẩu!')
      accountForm.value = { currentPassword: '', newPassword: '', confirmPassword: '' }
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Lỗi khi đổi mật khẩu!')
    } finally {
      isSaving.value = false
    }
  }

  const saveSettings = async () => {
    isSaving.value = true
    try {
      // API call mock (Chưa có endpoint cho Settings)
      await new Promise(r => setTimeout(r, 500))
      toast.success('Đã lưu cấu hình cá nhân!')
    } finally {
      isSaving.value = false
    }
  }

  return {
    user,
    uiStore,
    activeTab,
    themeMode,
    tabs,
    profileForm,
    accountForm,
    showCurrentPassword,
    showNewPassword,
    isSaving,
    notificationSettings,
    privacySettings,
    setSystemTheme,
    setTheme,
    saveProfile,
    changePassword,
    saveSettings
  }
}
