<script setup lang="ts">
import { ref } from 'vue'
import {
  User, Mail, Lock, Bell, BellOff, Shield, Palette, Moon, Sun,
  Camera, Save, ChevronRight, Eye, EyeOff, Globe, MessageCircle, Monitor
} from '@lucide/vue'
import { SETTINGS_TABS } from '@/constants/ui'
import { useAuth } from '@/composables/useAuth'
import UserAvatar from '@/components/UserAvatar.vue'
import { useAppStore } from '@/stores/app'

const appStore = useAppStore()
const { user } = useAuth()

// Active tab
const activeTab = ref('profile')
const themeMode = ref<'light' | 'dark' | 'system'>('dark')

function setSystemTheme() {
  themeMode.value = 'system'
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
  if (prefersDark !== appStore.isDark) appStore.toggleTheme()
}

const tabs = SETTINGS_TABS

// Profile form
const profileForm = ref({
  name: user.value?.name || '',
  bio: user.value?.bio || '',
  email: user.value?.email || '',
})

// Account form
const accountForm = ref({
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
})
const showCurrentPassword = ref(false)
const showNewPassword = ref(false)

// Notification settings
const notificationSettings = ref({
  emailNewFollower: true,
  emailNewComment: true,
  emailNewMessage: false,
  pushNewFollower: true,
  pushNewComment: true,
  pushNewMessage: true,
  pushTrending: false,
})

// Privacy settings
const privacySettings = ref({
  profileVisibility: 'public',
  allowMessages: 'everyone',
  showOnlineStatus: true,
  showReadReceipts: true,
})
</script>

<template>
  <div class="mx-auto px-4 sm:px-6 lg:px-8 py-6">
    <!-- Header -->
    <div class="mb-8">
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Cài đặt</h1>
      <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">Quản lý tài khoản và tuỳ chỉnh trải nghiệm của bạn</p>
    </div>

    <div class="flex flex-col md:flex-row gap-6">
      <!-- Sidebar Tabs -->
      <nav class="w-full md:w-56 shrink-0">
        <div class="bg-white dark:bg-surface-800 rounded-2xl border border-gray-200 dark:border-surface-700 p-2 space-y-1">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            @click="activeTab = tab.id"
            :class="[
              'w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all',
              activeTab === tab.id
                ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-surface-700'
            ]"
          >
            <component :is="tab.icon" :size="18" />
            {{ tab.label }}
          </button>
        </div>
      </nav>

      <!-- Content Area -->
      <div class="flex-1 min-w-0">

        <!-- Profile Tab -->
        <div v-if="activeTab === 'profile'" class="bg-white dark:bg-surface-800 rounded-2xl border border-gray-200 dark:border-surface-700 p-6 sm:p-8">
          <h2 class="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <User :size="20" class="text-primary-500" />
            Thông tin cá nhân
          </h2>

          <!-- Avatar -->
          <div class="flex items-center gap-5 mb-8">
            <div class="relative group">
              <UserAvatar v-if="user" :user="user" size="xl" />
              <div class="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                <Camera :size="20" class="text-white" />
              </div>
            </div>
            <div>
              <p class="text-sm font-medium text-gray-900 dark:text-white">Ảnh đại diện</p>
              <p class="text-xs text-gray-400 mt-0.5">JPG, PNG hoặc GIF. Tối đa 2MB.</p>
              <button class="mt-2 px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-200 dark:border-surface-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-surface-700 transition-colors">
                Thay đổi
              </button>
            </div>
          </div>

          <!-- Form Fields -->
          <div class="space-y-5">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Tên hiển thị</label>
              <input v-model="profileForm.name" type="text"
                class="w-full px-4 py-2.5 bg-gray-50 dark:bg-surface-700 border border-gray-200 dark:border-surface-600 rounded-xl text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 outline-none transition-all" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Giới thiệu bản thân</label>
              <textarea v-model="profileForm.bio" rows="3"
                class="w-full px-4 py-2.5 bg-gray-50 dark:bg-surface-700 border border-gray-200 dark:border-surface-600 rounded-xl text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 outline-none resize-none transition-all"
                placeholder="Viết gì đó về bạn..." />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Email</label>
              <input v-model="profileForm.email" type="email"
                class="w-full px-4 py-2.5 bg-gray-50 dark:bg-surface-700 border border-gray-200 dark:border-surface-600 rounded-xl text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 outline-none transition-all" />
            </div>
          </div>

          <div class="mt-8 flex justify-end">
            <button class="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-white gradient-primary hover:opacity-90 transition-all shadow-lg shadow-primary-500/25">
              <Save :size="16" /> Lưu thay đổi
            </button>
          </div>
        </div>

        <!-- Account Tab -->
        <div v-if="activeTab === 'account'" class="bg-white dark:bg-surface-800 rounded-2xl border border-gray-200 dark:border-surface-700 p-6 sm:p-8">
          <h2 class="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <Lock :size="20" class="text-primary-500" />
            Đổi mật khẩu
          </h2>

          <div class="space-y-5 max-w-md">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Mật khẩu hiện tại</label>
              <div class="relative">
                <input v-model="accountForm.currentPassword" :type="showCurrentPassword ? 'text' : 'password'"
                  class="w-full px-4 py-2.5 pr-10 bg-gray-50 dark:bg-surface-700 border border-gray-200 dark:border-surface-600 rounded-xl text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 outline-none transition-all" />
                <button @click="showCurrentPassword = !showCurrentPassword" class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  <EyeOff v-if="showCurrentPassword" :size="16" />
                  <Eye v-else :size="16" />
                </button>
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Mật khẩu mới</label>
              <div class="relative">
                <input v-model="accountForm.newPassword" :type="showNewPassword ? 'text' : 'password'"
                  class="w-full px-4 py-2.5 pr-10 bg-gray-50 dark:bg-surface-700 border border-gray-200 dark:border-surface-600 rounded-xl text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 outline-none transition-all" />
                <button @click="showNewPassword = !showNewPassword" class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  <EyeOff v-if="showNewPassword" :size="16" />
                  <Eye v-else :size="16" />
                </button>
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Xác nhận mật khẩu mới</label>
              <input v-model="accountForm.confirmPassword" type="password"
                class="w-full px-4 py-2.5 bg-gray-50 dark:bg-surface-700 border border-gray-200 dark:border-surface-600 rounded-xl text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 outline-none transition-all" />
            </div>
          </div>

          <div class="mt-8 flex justify-end">
            <button class="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-white gradient-primary hover:opacity-90 transition-all shadow-lg shadow-primary-500/25">
              <Save :size="16" /> Cập nhật mật khẩu
            </button>
          </div>
        </div>

        <!-- Appearance Tab -->
        <div v-if="activeTab === 'appearance'" class="bg-white dark:bg-surface-800 rounded-2xl border border-gray-200 dark:border-surface-700 p-6 sm:p-8">
          <h2 class="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <Palette :size="20" class="text-primary-500" />
            Giao diện
          </h2>

          <div class="space-y-4">
            <p class="text-sm text-gray-500 dark:text-gray-400">Chọn chế độ hiển thị phù hợp với bạn</p>
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <!-- Light Mode -->
              <button
                @click="themeMode = 'light'; appStore.isDark && appStore.toggleTheme()"
                :class="[
                  'relative p-5 rounded-2xl border-2 transition-all text-left',
                  themeMode === 'light'
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                    : 'border-gray-200 dark:border-surface-700 hover:border-gray-300 dark:hover:border-surface-600'
                ]"
              >
                <div class="flex items-center gap-3 mb-3">
                  <div class="w-10 h-10 rounded-xl bg-yellow-100 flex items-center justify-center">
                    <Sun :size="20" class="text-yellow-600" />
                  </div>
                  <div>
                    <p class="font-semibold text-gray-900 dark:text-white text-sm">Chế độ sáng</p>
                    <p class="text-xs text-gray-400">Nền trắng, chữ tối</p>
                  </div>
                </div>
                <div v-if="themeMode === 'light'" class="absolute top-3 right-3 w-5 h-5 rounded-full bg-primary-500 flex items-center justify-center">
                  <svg class="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/></svg>
                </div>
              </button>

              <!-- Dark Mode -->
              <button
                @click="themeMode = 'dark'; !appStore.isDark && appStore.toggleTheme()"
                :class="[
                  'relative p-5 rounded-2xl border-2 transition-all text-left',
                  themeMode === 'dark'
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                    : 'border-gray-200 dark:border-surface-700 hover:border-gray-300 dark:hover:border-surface-600'
                ]"
              >
                <div class="flex items-center gap-3 mb-3">
                  <div class="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                    <Moon :size="20" class="text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div>
                    <p class="font-semibold text-gray-900 dark:text-white text-sm">Chế độ tối</p>
                    <p class="text-xs text-gray-400">Nền tối, dễ nhìn ban đêm</p>
                  </div>
                </div>
                <div v-if="themeMode === 'dark'" class="absolute top-3 right-3 w-5 h-5 rounded-full bg-primary-500 flex items-center justify-center">
                  <svg class="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/></svg>
                </div>
              </button>

              <!-- System Mode -->
              <button
                @click="setSystemTheme()"
                :class="[
                  'relative p-5 rounded-2xl border-2 transition-all text-left',
                  themeMode === 'system'
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                    : 'border-gray-200 dark:border-surface-700 hover:border-gray-300 dark:hover:border-surface-600'
                ]"
              >
                <div class="flex items-center gap-3 mb-3">
                  <div class="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                    <Monitor :size="20" class="text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <p class="font-semibold text-gray-900 dark:text-white text-sm">Theo hệ thống</p>
                    <p class="text-xs text-gray-400">Tự động theo OS</p>
                  </div>
                </div>
                <div v-if="themeMode === 'system'" class="absolute top-3 right-3 w-5 h-5 rounded-full bg-primary-500 flex items-center justify-center">
                  <svg class="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/></svg>
                </div>
              </button>
            </div>
          </div>
        </div>

        <!-- Notifications Tab -->
        <div v-if="activeTab === 'notifications'" class="bg-white dark:bg-surface-800 rounded-2xl border border-gray-200 dark:border-surface-700 p-6 sm:p-8">
          <h2 class="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <Bell :size="20" class="text-primary-500" />
            Thông báo
          </h2>

          <!-- Email Notifications -->
          <div class="mb-8">
            <h3 class="text-sm font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Mail :size="16" class="text-gray-400" /> Thông báo qua Email
            </h3>
            <div class="space-y-4">
              <label class="flex items-center justify-between cursor-pointer group">
                <div>
                  <p class="text-sm font-medium text-gray-700 dark:text-gray-300">Người theo dõi mới</p>
                  <p class="text-xs text-gray-400">Nhận email khi có người theo dõi bạn</p>
                </div>
                <div class="relative">
                  <input type="checkbox" v-model="notificationSettings.emailNewFollower" class="sr-only peer" />
                  <div class="w-11 h-6 bg-gray-200 dark:bg-surface-600 peer-checked:bg-primary-500 rounded-full transition-colors"></div>
                  <div class="absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform peer-checked:translate-x-5"></div>
                </div>
              </label>
              <label class="flex items-center justify-between cursor-pointer group">
                <div>
                  <p class="text-sm font-medium text-gray-700 dark:text-gray-300">Bình luận mới</p>
                  <p class="text-xs text-gray-400">Nhận email khi có người bình luận bài viết của bạn</p>
                </div>
                <div class="relative">
                  <input type="checkbox" v-model="notificationSettings.emailNewComment" class="sr-only peer" />
                  <div class="w-11 h-6 bg-gray-200 dark:bg-surface-600 peer-checked:bg-primary-500 rounded-full transition-colors"></div>
                  <div class="absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform peer-checked:translate-x-5"></div>
                </div>
              </label>
              <label class="flex items-center justify-between cursor-pointer group">
                <div>
                  <p class="text-sm font-medium text-gray-700 dark:text-gray-300">Tin nhắn mới</p>
                  <p class="text-xs text-gray-400">Nhận email khi có tin nhắn mới</p>
                </div>
                <div class="relative">
                  <input type="checkbox" v-model="notificationSettings.emailNewMessage" class="sr-only peer" />
                  <div class="w-11 h-6 bg-gray-200 dark:bg-surface-600 peer-checked:bg-primary-500 rounded-full transition-colors"></div>
                  <div class="absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform peer-checked:translate-x-5"></div>
                </div>
              </label>
            </div>
          </div>

          <!-- Push Notifications -->
          <div>
            <h3 class="text-sm font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Bell :size="16" class="text-gray-400" /> Thông báo đẩy (Push)
            </h3>
            <div class="space-y-4">
              <label class="flex items-center justify-between cursor-pointer group">
                <div>
                  <p class="text-sm font-medium text-gray-700 dark:text-gray-300">Người theo dõi mới</p>
                </div>
                <div class="relative">
                  <input type="checkbox" v-model="notificationSettings.pushNewFollower" class="sr-only peer" />
                  <div class="w-11 h-6 bg-gray-200 dark:bg-surface-600 peer-checked:bg-primary-500 rounded-full transition-colors"></div>
                  <div class="absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform peer-checked:translate-x-5"></div>
                </div>
              </label>
              <label class="flex items-center justify-between cursor-pointer group">
                <div>
                  <p class="text-sm font-medium text-gray-700 dark:text-gray-300">Bình luận mới</p>
                </div>
                <div class="relative">
                  <input type="checkbox" v-model="notificationSettings.pushNewComment" class="sr-only peer" />
                  <div class="w-11 h-6 bg-gray-200 dark:bg-surface-600 peer-checked:bg-primary-500 rounded-full transition-colors"></div>
                  <div class="absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform peer-checked:translate-x-5"></div>
                </div>
              </label>
              <label class="flex items-center justify-between cursor-pointer group">
                <div>
                  <p class="text-sm font-medium text-gray-700 dark:text-gray-300">Bài viết thịnh hành</p>
                  <p class="text-xs text-gray-400">Thông báo khi có bài viết nổi bật trong cộng đồng</p>
                </div>
                <div class="relative">
                  <input type="checkbox" v-model="notificationSettings.pushTrending" class="sr-only peer" />
                  <div class="w-11 h-6 bg-gray-200 dark:bg-surface-600 peer-checked:bg-primary-500 rounded-full transition-colors"></div>
                  <div class="absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform peer-checked:translate-x-5"></div>
                </div>
              </label>
            </div>
          </div>
        </div>

        <!-- Privacy Tab -->
        <div v-if="activeTab === 'privacy'" class="bg-white dark:bg-surface-800 rounded-2xl border border-gray-200 dark:border-surface-700 p-6 sm:p-8">
          <h2 class="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <Shield :size="20" class="text-primary-500" />
            Quyền riêng tư
          </h2>

          <div class="space-y-6">
            <!-- Profile Visibility -->
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                <Globe :size="16" class="text-gray-400" /> Ai xem được trang cá nhân?
              </label>
              <select v-model="privacySettings.profileVisibility"
                class="w-full sm:w-72 px-4 py-2.5 bg-gray-50 dark:bg-surface-700 border border-gray-200 dark:border-surface-600 rounded-xl text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 outline-none transition-all">
                <option value="public">Tất cả mọi người</option>
                <option value="followers">Chỉ người theo dõi</option>
                <option value="private">Chỉ mình tôi</option>
              </select>
            </div>

            <!-- Allow Messages -->
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                <MessageCircle :size="16" class="text-gray-400" /> Ai được gửi tin nhắn cho bạn?
              </label>
              <select v-model="privacySettings.allowMessages"
                class="w-full sm:w-72 px-4 py-2.5 bg-gray-50 dark:bg-surface-700 border border-gray-200 dark:border-surface-600 rounded-xl text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 outline-none transition-all">
                <option value="everyone">Tất cả mọi người</option>
                <option value="followers">Chỉ người theo dõi</option>
                <option value="nobody">Không ai cả</option>
              </select>
            </div>

            <!-- Toggle Options -->
            <label class="flex items-center justify-between cursor-pointer">
              <div>
                <p class="text-sm font-medium text-gray-700 dark:text-gray-300">Hiển thị trạng thái online</p>
                <p class="text-xs text-gray-400">Người khác có thể thấy bạn đang trực tuyến</p>
              </div>
              <div class="relative">
                <input type="checkbox" v-model="privacySettings.showOnlineStatus" class="sr-only peer" />
                <div class="w-11 h-6 bg-gray-200 dark:bg-surface-600 peer-checked:bg-primary-500 rounded-full transition-colors"></div>
                <div class="absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform peer-checked:translate-x-5"></div>
              </div>
            </label>
            <label class="flex items-center justify-between cursor-pointer">
              <div>
                <p class="text-sm font-medium text-gray-700 dark:text-gray-300">Xác nhận đã đọc</p>
                <p class="text-xs text-gray-400">Người gửi biết bạn đã đọc tin nhắn</p>
              </div>
              <div class="relative">
                <input type="checkbox" v-model="privacySettings.showReadReceipts" class="sr-only peer" />
                <div class="w-11 h-6 bg-gray-200 dark:bg-surface-600 peer-checked:bg-primary-500 rounded-full transition-colors"></div>
                <div class="absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform peer-checked:translate-x-5"></div>
              </div>
            </label>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>
