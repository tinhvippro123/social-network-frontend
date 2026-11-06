import { ref, watch } from 'vue'
import { useAuth } from '../auth/useAuth'
import authApi from '@/api/auth.api'
import { useAuthStore } from '@/stores/auth.store'
import { useToast } from './useToast'
import { useUiStore } from '@/stores/ui.store'
import { SETTINGS_TABS } from '@/constants/ui'

import filesApi from '@/api/files.api'
import usersApi from '@/api/users.api'

export function useSettings() {
  const uiStore = useUiStore()
  const { user } = useAuth()
  const authStore = useAuthStore()
  const toast = useToast()
  const isSaving = ref(false)
  const isUploadingAvatar = ref(false)

  const activeTab = ref('profile')
  const savedThemeMode = typeof window !== 'undefined' ? localStorage.getItem('vb_theme_mode') as 'light' | 'dark' | 'system' | null : null
  const themeMode = ref<'light' | 'dark' | 'system'>(savedThemeMode || (uiStore.isDark ? 'dark' : 'light'))

  watch(() => uiStore.isDark, (isDark) => {
    if (themeMode.value !== 'system') {
      themeMode.value = isDark ? 'dark' : 'light'
      if (typeof window !== 'undefined') localStorage.setItem('vb_theme_mode', themeMode.value)
    }
  })
  const tabs = SETTINGS_TABS

  const profileForm = ref({
    name: user.value?.name || '',
    bio: user.value?.bio || '',
    email: user.value?.email || '',
    avatar: user.value?.avatar || '',
  })

  watch(user, (newUser) => {
    if (newUser) {
      profileForm.value = {
        name: newUser.name || '',
        bio: newUser.bio || '',
        email: newUser.email || '',
        avatar: newUser.avatar || '',
      }
      loadPersistedPrefs(newUser.id)
    }
  })

  const accountForm = ref({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const showCurrentPassword = ref(false)
  const showNewPassword = ref(false)
  const showConfirmPassword = ref(false)

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

  function getPrefsKey(userId?: string) {
    return `vb_user_prefs_${userId || user.value?.id || 'default'}`
  }

  function loadPersistedPrefs(userId?: string) {
    if (typeof window === 'undefined') return
    try {
      const raw = localStorage.getItem(getPrefsKey(userId))
      if (!raw) return
      const parsed = JSON.parse(raw)
      if (parsed?.notificationSettings) {
        notificationSettings.value = { ...notificationSettings.value, ...parsed.notificationSettings }
      }
      if (parsed?.privacySettings) {
        privacySettings.value = { ...privacySettings.value, ...parsed.privacySettings }
      }
    } catch {
      // ignore invalid JSON
    }
  }

  loadPersistedPrefs()

  watch(
    [notificationSettings, privacySettings],
    () => {
      if (typeof window !== 'undefined') {
        localStorage.setItem(
          getPrefsKey(),
          JSON.stringify({
            notificationSettings: notificationSettings.value,
            privacySettings: privacySettings.value,
          })
        )
      }
    },
    { deep: true }
  )

  const setSystemTheme = () => {
    themeMode.value = 'system'
    if (typeof window !== 'undefined') localStorage.setItem('vb_theme_mode', 'system')
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    if (prefersDark !== uiStore.isDark) uiStore.toggleTheme()
  }

  const setTheme = (mode: 'light' | 'dark') => {
    themeMode.value = mode
    if (typeof window !== 'undefined') localStorage.setItem('vb_theme_mode', mode)
    if (mode === 'light' && uiStore.isDark) uiStore.toggleTheme()
    if (mode === 'dark' && !uiStore.isDark) uiStore.toggleTheme()
  }

  const uploadAvatar = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Vui lòng chọn tệp hình ảnh hợp lệ!')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Kích thước ảnh tối đa là 5MB')
      return
    }
    isUploadingAvatar.value = true
    try {
      const res = await filesApi.uploadFile(file)
      const url = res.data?.data?.fileUrl || res.data?.fileUrl
      if (url) {
        profileForm.value.avatar = url
        const trimmedName = profileForm.value.name.trim() || user.value?.name || ''
        if (trimmedName) {
          const { data } = await usersApi.updateProfile({
            name: trimmedName,
            bio: profileForm.value.bio,
            avatar: url
          })
          if (data?.data) {
            authStore.setUser(data.data)
          }
        }
        toast.success('Đã cập nhật ảnh đại diện thành công!')
      }
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Không thể tải ảnh đại diện lên!')
    } finally {
      isUploadingAvatar.value = false
    }
  }

  const saveProfile = async () => {
    const trimmedName = profileForm.value.name.trim()
    if (!trimmedName) {
      toast.error('Tên hiển thị không được để trống!')
      return
    }
    if (trimmedName.length < 2 || trimmedName.length > 50) {
      toast.error('Tên hiển thị phải từ 2 đến 50 ký tự!')
      return
    }
    if (profileForm.value.bio && profileForm.value.bio.length > 250) {
      toast.error('Giới thiệu bản thân không được vượt quá 250 ký tự!')
      return
    }
    isSaving.value = true
    try {
      const { data } = await usersApi.updateProfile({
        name: trimmedName,
        bio: profileForm.value.bio,
        avatar: profileForm.value.avatar
      })
      authStore.setUser(data.data)
      toast.success('Đã lưu thông tin hồ sơ!')
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Lỗi khi lưu hồ sơ!')
    } finally {
      isSaving.value = false
    }
  }

  const changePassword = async () => {
    if (!accountForm.value.currentPassword) {
      toast.error('Vui lòng nhập mật khẩu hiện tại!')
      return
    }
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
      if (typeof window !== 'undefined') {
        localStorage.setItem(
          getPrefsKey(),
          JSON.stringify({
            notificationSettings: notificationSettings.value,
            privacySettings: privacySettings.value,
          })
        )
      }
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
    showConfirmPassword,
    isSaving,
    isUploadingAvatar,
    uploadAvatar,
    notificationSettings,
    privacySettings,
    setSystemTheme,
    setTheme,
    saveProfile,
    changePassword,
    saveSettings
  }
}
