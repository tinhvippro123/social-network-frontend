<script setup lang="ts">
import { ref } from 'vue'
import { Settings, Globe, Bell, Shield, Database, Palette, Save } from '@lucide/vue'

const siteName = ref('VietBlog')
const siteDescription = ref('Nền tảng chia sẻ kiến thức cho cộng đồng')
const allowRegistration = ref(true)
const requireEmailVerification = ref(true)
const autoHideReportThreshold = ref(10)
const enableRealTimeChat = ref(true)
const enableLocationPosts = ref(true)
const enableSemanticSearch = ref(true)
const maintenanceMode = ref(false)
</script>

<template>
  <div class="p-6 max-w-4xl">
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
        <Settings :size="24" class="text-red-500" />
        Cài đặt hệ thống
      </h1>
      <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">Cấu hình các thiết lập chung của hệ thống</p>
    </div>

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

      <!-- Auth & Security -->
      <div class="bg-white dark:bg-surface-800 rounded-2xl border border-gray-200 dark:border-surface-700 p-6">
        <h3 class="font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-5">
          <Shield :size="18" class="text-green-500" /> Bảo mật & Xác thực
        </h3>
        <div class="space-y-4">
          <label class="flex items-center justify-between p-3 bg-gray-50 dark:bg-surface-700 rounded-xl cursor-pointer">
            <div>
              <p class="text-sm font-medium text-gray-700 dark:text-gray-300">Cho phép đăng ký</p>
              <p class="text-xs text-gray-400 mt-0.5">Người dùng mới có thể tạo tài khoản</p>
            </div>
            <input v-model="allowRegistration" type="checkbox" class="w-5 h-5 text-red-500 rounded focus:ring-red-500" />
          </label>
          <label class="flex items-center justify-between p-3 bg-gray-50 dark:bg-surface-700 rounded-xl cursor-pointer">
            <div>
              <p class="text-sm font-medium text-gray-700 dark:text-gray-300">Yêu cầu xác thực email</p>
              <p class="text-xs text-gray-400 mt-0.5">Người dùng phải xác nhận email trước khi sử dụng</p>
            </div>
            <input v-model="requireEmailVerification" type="checkbox" class="w-5 h-5 text-red-500 rounded focus:ring-red-500" />
          </label>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Ngưỡng tự động ẩn bài (số report)</label>
            <input v-model="autoHideReportThreshold" type="number" min="1" max="100" class="w-32 px-4 py-2.5 bg-gray-50 dark:bg-surface-700 border border-gray-200 dark:border-surface-600 rounded-xl text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500/50" />
            <p class="text-xs text-gray-400 mt-1">Bài viết bị {{ autoHideReportThreshold }} report sẽ tự động ẩn</p>
          </div>
        </div>
      </div>

      <!-- Features -->
      <div class="bg-white dark:bg-surface-800 rounded-2xl border border-gray-200 dark:border-surface-700 p-6">
        <h3 class="font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-5">
          <Database :size="18" class="text-purple-500" /> Tính năng
        </h3>
        <div class="space-y-4">
          <label class="flex items-center justify-between p-3 bg-gray-50 dark:bg-surface-700 rounded-xl cursor-pointer">
            <div>
              <p class="text-sm font-medium text-gray-700 dark:text-gray-300">Chat real-time (Redis + WebSocket)</p>
              <p class="text-xs text-gray-400 mt-0.5">Nhắn tin 1-1 và nhóm theo thời gian thực</p>
            </div>
            <input v-model="enableRealTimeChat" type="checkbox" class="w-5 h-5 text-red-500 rounded focus:ring-red-500" />
          </label>
          <label class="flex items-center justify-between p-3 bg-gray-50 dark:bg-surface-700 rounded-xl cursor-pointer">
            <div>
              <p class="text-sm font-medium text-gray-700 dark:text-gray-300">Bài viết theo vị trí (PostGIS)</p>
              <p class="text-xs text-gray-400 mt-0.5">Cho phép đính kèm tọa độ và tìm kiếm theo bản đồ</p>
            </div>
            <input v-model="enableLocationPosts" type="checkbox" class="w-5 h-5 text-red-500 rounded focus:ring-red-500" />
          </label>
          <label class="flex items-center justify-between p-3 bg-gray-50 dark:bg-surface-700 rounded-xl cursor-pointer">
            <div>
              <p class="text-sm font-medium text-gray-700 dark:text-gray-300">Tìm kiếm ngữ nghĩa (pgvector)</p>
              <p class="text-xs text-gray-400 mt-0.5">Tìm kiếm bài viết theo ý nghĩa với Cosine Similarity</p>
            </div>
            <input v-model="enableSemanticSearch" type="checkbox" class="w-5 h-5 text-red-500 rounded focus:ring-red-500" />
          </label>
        </div>
      </div>

      <!-- Maintenance -->
      <div class="bg-white dark:bg-surface-800 rounded-2xl border border-red-200 dark:border-red-900/30 p-6">
        <h3 class="font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-5">
          <Settings :size="18" class="text-red-500" /> Chế độ bảo trì
        </h3>
        <label class="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/10 rounded-xl cursor-pointer">
          <div>
            <p class="text-sm font-medium text-red-600 dark:text-red-400">Bật chế độ bảo trì</p>
            <p class="text-xs text-gray-400 mt-0.5">Chỉ admin mới có thể truy cập khi bật</p>
          </div>
          <input v-model="maintenanceMode" type="checkbox" class="w-5 h-5 text-red-500 rounded focus:ring-red-500" />
        </label>
      </div>

      <!-- Save -->
      <button class="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-medium text-white bg-red-500 hover:bg-red-600 transition-all shadow-lg shadow-red-500/25">
        <Save :size="16" /> Lưu cài đặt
      </button>
    </div>
  </div>
</template>
