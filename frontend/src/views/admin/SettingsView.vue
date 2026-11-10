<script setup lang="ts">
import { ref } from 'vue'
import { Settings, Globe, Bell, Shield, Database, Palette, Save } from '@lucide/vue'
import { useAdminSettings } from '@/composables/admin/useAdminSettings'
import Skeleton from '@/components/ui/Skeleton.vue'
import SettingsSecurity from './components/SettingsSecurity.vue'
import AdminSettingCheckbox from './components/AdminSettingCheckbox.vue'

const {
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
  saveSettings
} = useAdminSettings()
</script>

<template>
  <div class="p-6">
    <div class="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Settings :size="24" class="text-red-500" />
          Cài đặt hệ thống
        </h1>
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">Cấu hình các thiết lập chung của hệ thống</p>
      </div>
      <button
        id="admin-settings-save"
        type="button"
        @click="saveSettings"
        :disabled="isSaving || isLoading"
        class="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-white bg-red-500 hover:bg-red-600 transition-all shadow-xs cursor-pointer disabled:opacity-50"
      >
        <Save :size="16" /> {{ isSaving ? 'Đang lưu...' : 'Lưu cài đặt' }}
      </button>
    </div>

    <div v-if="isLoading" class="grid grid-cols-1 xl:grid-cols-2 gap-6">
      <div v-for="i in 4" :key="i" class="bg-white dark:bg-surface-800 rounded-2xl border border-gray-200 dark:border-surface-700 p-6">
        <Skeleton class="h-6 w-48 mb-5 rounded" />
        <div class="space-y-4">
          <Skeleton class="h-10 w-full rounded-xl" />
          <Skeleton class="h-20 w-full rounded-xl" />
        </div>
      </div>
    </div>

    <div v-else class="grid grid-cols-1 xl:grid-cols-2 gap-6 items-start">
      <!-- Cột trái -->
      <div class="space-y-6">
        <!-- General -->
        <div class="bg-white dark:bg-surface-800 rounded-2xl border border-gray-200 dark:border-surface-700 p-6">
          <h3 class="font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-5">
            <Globe :size="18" class="text-blue-500" /> Thông tin chung
          </h3>
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Tên website</label>
              <input v-model="siteName" type="text" class="w-full px-4 py-2.5 bg-gray-50 dark:bg-surface-700 border border-gray-200 dark:border-surface-600 rounded-xl text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500/50" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Mô tả</label>
              <textarea v-model="siteDescription" rows="2" class="w-full px-4 py-2.5 bg-gray-50 dark:bg-surface-700 border border-gray-200 dark:border-surface-600 rounded-xl text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500/50 resize-none" />
            </div>
          </div>
        </div>

        <!-- Features -->
        <div class="bg-white dark:bg-surface-800 rounded-2xl border border-gray-200 dark:border-surface-700 p-6">
          <h3 class="font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-5">
            <Database :size="18" class="text-primary-600 dark:text-primary-300" /> Tính năng
          </h3>
          <div class="space-y-4">
            <AdminSettingCheckbox
              v-model="enableRealTimeChat"
              title="Chat real-time (Redis + WebSocket)"
              description="Nhắn tin 1-1 và nhóm theo thời gian thực"
            />
            <AdminSettingCheckbox
              v-model="enableLocationPosts"
              title="Bài viết theo vị trí (PostGIS)"
              description="Cho phép đính kèm tọa độ và tìm kiếm theo bản đồ"
            />
            <AdminSettingCheckbox
              v-model="enableSemanticSearch"
              title="Tìm kiếm ngữ nghĩa (pgvector)"
              description="Tìm kiếm bài viết theo ý nghĩa với Cosine Similarity"
            />
          </div>
        </div>
      </div>

      <!-- Cột phải -->
      <div class="space-y-6">
        <!-- Auth & Security -->
        <SettingsSecurity
          v-model:allow-registration="allowRegistration"
          v-model:require-email-verification="requireEmailVerification"
          v-model:auto-hide-report-threshold="autoHideReportThreshold"
        />

        <!-- Maintenance -->
        <div class="bg-white dark:bg-surface-800 rounded-2xl border border-red-200 dark:border-red-900/30 p-6">
          <h3 class="font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-5">
            <Settings :size="18" class="text-red-500" /> Chế độ bảo trì
          </h3>
          <AdminSettingCheckbox
            v-model="maintenanceMode"
            title="Bật chế độ bảo trì"
            description="Chỉ admin mới có thể truy cập khi bật"
            is-danger
          />
        </div>
      </div>
    </div>
  </div>
</template>
