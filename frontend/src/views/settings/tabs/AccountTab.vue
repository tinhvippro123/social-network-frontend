<script setup lang="ts">
import { Lock, Eye, EyeOff, Save, AlertTriangle, Trash2 } from '@lucide/vue'
import { useSettings } from '@/composables/ui/useSettings'

const { accountForm, showCurrentPassword, showNewPassword } = useSettings()
</script>

<template>
  <div class="bg-white dark:bg-surface-800 rounded-2xl border border-gray-200 dark:border-surface-700 p-6 sm:p-8 animate-fade-in">
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

    <!-- Danger Zone -->
    <div class="mt-10 pt-8 border-t border-red-200 dark:border-red-900/30">
      <h3 class="text-sm font-semibold text-red-600 dark:text-red-400 mb-4 flex items-center gap-2">
        <AlertTriangle :size="16" /> Vùng nguy hiểm
      </h3>
      <div class="space-y-4">
        <div class="flex items-center justify-between p-4 rounded-xl border border-red-200 dark:border-red-900/30 bg-red-50/50 dark:bg-red-900/5">
          <div>
            <p class="text-sm font-medium text-gray-900 dark:text-white">Vô hiệu hóa tài khoản</p>
            <p class="text-xs text-gray-400 mt-0.5">Tài khoản sẽ bị ẩn và không thể đăng nhập. Bạn có thể kích hoạt lại sau.</p>
          </div>
          <button class="px-4 py-2 rounded-xl text-sm font-medium text-amber-600 dark:text-amber-400 border border-amber-300 dark:border-amber-800/50 hover:bg-amber-50 dark:hover:bg-amber-900/10 transition-all shrink-0">
            Vô hiệu hóa
          </button>
        </div>
        <div class="flex items-center justify-between p-4 rounded-xl border border-red-200 dark:border-red-900/30 bg-red-50/50 dark:bg-red-900/5">
          <div>
            <p class="text-sm font-medium text-gray-900 dark:text-white">Xóa tài khoản vĩnh viễn</p>
            <p class="text-xs text-gray-400 mt-0.5">Tất cả dữ liệu sẽ bị xóa vĩnh viễn và không thể khôi phục.</p>
          </div>
          <button class="px-4 py-2 rounded-xl text-sm font-medium text-red-600 dark:text-red-400 border border-red-300 dark:border-red-800/50 hover:bg-red-50 dark:hover:bg-red-900/10 transition-all shrink-0">
            <Trash2 :size="14" class="inline mr-1" /> Xóa tài khoản
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
