import { ref, watch } from 'vue'
import { useAuth } from '../auth/useAuth'
import authApi from '@/api/auth.api'
import { useAuthStore } from '@/stores/auth.store'
import { useToast } from './useToast'
import { useUiStore } from '@/stores/ui.store'
import { SETTINGS_TABS } from '@/constants/ui'

import filesApi from '@/api/files.api'
import usersApi from '@/api/users.api'
import type { UserPreferences } from '@/types'

const DEFAULT_NOTIFICATION_SETTINGS = {
  emailNewFollower: true,
  emailNewComment: true,
  emailNewMessage: false,
  pushNewFollower: true,
  pushNewComment: true,
  pushNewMessage: true,
  pushTrending: false,
}

const DEFAULT_PRIVACY_SETTINGS = {
  profileVisibility: 'public' as 'public' | 'followers' | 'private',
  allowMessages: 'everyone' as 'everyone' | 'followers' | 'nobody',
  showOnlineStatus: true,
  showReadReceipts: true,
}

const notificationSettings = ref({ ...DEFAULT_NOTIFICATION_SETTINGS })
const privacySettings = ref({ ...DEFAULT_PRIVACY_SETTINGS })
let syncedUserId: string | null = null

function applyPreferences(prefs?: Partial<UserPreferences> | null) {
  if (!prefs) {
    notificationSettings.value = { ...DEFAULT_NOTIFICATION_SETTINGS }
    privacySettings.value = { ...DEFAULT_PRIVACY_SETTINGS }
    return
  }
  notificationSettings.value = {
    emailNewFollower: prefs.emailNewFollower ?? DEFAULT_NOTIFICATION_SETTINGS.emailNewFollower,
    emailNewComment: prefs.emailNewComment ?? DEFAULT_NOTIFICATION_SETTINGS.emailNewComment,
    emailNewMessage: prefs.emailNewMessage ?? DEFAULT_NOTIFICATION_SETTINGS.emailNewMessage,
    pushNewFollower: prefs.pushNewFollower ?? DEFAULT_NOTIFICATION_SETTINGS.pushNewFollower,
    pushNewComment: prefs.pushNewComment ?? DEFAULT_NOTIFICATION_SETTINGS.pushNewComment,
    pushNewMessage: prefs.pushNewMessage ?? DEFAULT_NOTIFICATION_SETTINGS.pushNewMessage,
    pushTrending: prefs.pushTrending ?? DEFAULT_NOTIFICATION_SETTINGS.pushTrending,
  }
  privacySettings.value = {
    profileVisibility: prefs.profileVisibility ?? DEFAULT_PRIVACY_SETTINGS.profileVisibility,
    allowMessages: prefs.allowMessages ?? DEFAULT_PRIVACY_SETTINGS.allowMessages,
    showOnlineStatus: prefs.showOnlineStatus ?? DEFAULT_PRIVACY_SETTINGS.showOnlineStatus,
    showReadReceipts: prefs.showReadReceipts ?? DEFAULT_PRIVACY_SETTINGS.showReadReceipts,
  }
}

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

  if (authStore.user?.id && syncedUserId !== authStore.user.id) {
    syncedUserId = authStore.user.id
    if (authStore.user.preferences) {
      applyPreferences(authStore.user.preferences)
    }
  }

  async function loadPreferences(force = false) {
    if (!authStore.isLoggedIn || !authStore.user?.id) {
      syncedUserId = null
      applyPreferences(null)
      return
    }
    if (!force && syncedUserId === authStore.user.id && authStore.user.preferences) {
      applyPreferences(authStore.user.preferences)
      return
    }
    try {
      const { data } = await usersApi.getPreferences()
      if (data?.data) {
        syncedUserId = authStore.user.id
        applyPreferences(data.data)
        authStore.setUser({ ...authStore.user, preferences: data.data })
      }
    } catch {
      if (authStore.user.preferences) {
        applyPreferences(authStore.user.preferences)
      }
    }
  }

  watch(user, (newUser) => {
    if (newUser) {
      profileForm.value = {
        name: newUser.name || '',
        bio: newUser.bio || '',
        email: newUser.email || '',
        avatar: newUser.avatar || '',
      }
      if (syncedUserId !== newUser.id || newUser.preferences) {
        syncedUserId = newUser.id
        applyPreferences(newUser.preferences)
      }
    } else {
      syncedUserId = null
      applyPreferences(null)
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
    if (!authStore.isLoggedIn || !authStore.user) {
      toast.error('Vui lòng đăng nhập để lưu cấu hình!')
      return
    }
    isSaving.value = true
    try {
      const { data } = await usersApi.updatePreferences({
        ...privacySettings.value,
        ...notificationSettings.value,
      })
      if (data?.data) {
        applyPreferences(data.data)
        authStore.setUser({ ...authStore.user, preferences: data.data })
      }
      toast.success('Đã lưu cấu hình cá nhân!')
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Không thể lưu cấu hình cá nhân!')
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
    loadPreferences,
    setSystemTheme,
    setTheme,
    saveProfile,
    changePassword,
    saveSettings
  }
}
