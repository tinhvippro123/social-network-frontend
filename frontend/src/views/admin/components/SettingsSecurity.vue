<script setup lang="ts">
import { Shield } from '@lucide/vue'

const props = defineProps<{
  allowRegistration: boolean
  requireEmailVerification: boolean
  autoHideReportThreshold: number
}>()

const emit = defineEmits<{
  (e: 'update:allowRegistration', value: boolean): void
  (e: 'update:requireEmailVerification', value: boolean): void
  (e: 'update:autoHideReportThreshold', value: number): void
}>()
</script>

<template>
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
        <input 
          :checked="allowRegistration"
          @change="emit('update:allowRegistration', ($event.target as HTMLInputElement).checked)"
          type="checkbox" class="w-5 h-5 text-red-500 rounded focus:ring-red-500" />
      </label>
      <label class="flex items-center justify-between p-3 bg-gray-50 dark:bg-surface-700 rounded-xl cursor-pointer">
        <div>
          <p class="text-sm font-medium text-gray-700 dark:text-gray-300">Yêu cầu xác thực email</p>
          <p class="text-xs text-gray-400 mt-0.5">Người dùng phải xác nhận email trước khi sử dụng</p>
        </div>
        <input 
          :checked="requireEmailVerification"
          @change="emit('update:requireEmailVerification', ($event.target as HTMLInputElement).checked)"
          type="checkbox" class="w-5 h-5 text-red-500 rounded focus:ring-red-500" />
      </label>
      <div>
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Ngưỡng tự động ẩn bài (số report)</label>
        <input 
          :value="autoHideReportThreshold"
          @input="emit('update:autoHideReportThreshold', Number(($event.target as HTMLInputElement).value))"
          type="number" min="1" max="100" class="w-32 px-4 py-2.5 bg-gray-50 dark:bg-surface-700 border border-gray-200 dark:border-surface-600 rounded-xl text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500/50" />
        <p class="text-xs text-gray-400 mt-1">Bài viết bị {{ autoHideReportThreshold }} report sẽ tự động ẩn</p>
      </div>
    </div>
  </div>
</template>
