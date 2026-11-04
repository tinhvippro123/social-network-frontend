<script setup lang="ts">
import { useRouter } from 'vue-router'
import { Lock, Eye, EyeOff, Save, AlertTriangle, Trash2 } from '@lucide/vue'
import { useSettings } from '@/composables/ui/useSettings'
import { useConfirm } from '@/composables/ui/useConfirm'
import { useToast } from '@/composables/ui/useToast'
import { useAuthStore } from '@/stores/auth.store'
import http from '@/api/client'

const { accountForm, showCurrentPassword, showNewPassword, showConfirmPassword, changePassword, isSaving } = useSettings()
const { confirm } = useConfirm()
const toast = useToast()
const authStore = useAuthStore()
const router = useRouter()

async function handleDeactivateAccount() {
  const ok = await confirm({
    title: 'Vô hiệu hóa tài khoản?',
    message: 'Yêu cầu tạm khóa tài khoản của bạn sẽ được gửi đến Quản trị viên và phiên đăng nhập hiện tại sẽ kết thúc. Bạn có chắc chắn không?',
    confirmText: 'Vô hiệu hóa',
    cancelText: 'Hủy bỏ',
    variant: 'warning'
  })
  if (ok) {
    try {
      if (authStore.user?.id) {
        await http.post('/reports', {
          targetId: authStore.user.id,
          type: 'USER',
          reason: `Yêu cầu tự vô hiệu hóa tài khoản từ người dùng: ${authStore.user.email || authStore.user.name}`
        })
      }
    } catch {
      // ignore if report already exists
    }
    authStore.clearAuth()
    toast.info('Đã gửi yêu cầu vô hiệu hóa tài khoản và đăng xuất khỏi phiên làm việc.')
    router.push('/login')
  }
}

async function handleDeleteAccount() {
  const ok = await confirm({
    title: 'Xóa tài khoản vĩnh viễn?',
    message: 'Yêu cầu xóa vĩnh viễn tài khoản và dữ liệu cá nhân sẽ được gửi tới Quản trị viên hệ thống để phê duyệt. Bạn có chắc chắn muốn tiếp tục?',
    confirmText: 'Gửi yêu cầu xóa',
    cancelText: 'Giữ lại tài khoản',
    variant: 'danger'
  })
  if (ok) {
    try {
      if (authStore.user?.id) {
        await http.post('/reports', {
          targetId: authStore.user.id,
          type: 'USER',
          reason: `Yêu cầu xóa vĩnh viễn tài khoản từ chính chủ: ${authStore.user.email || authStore.user.name}`
        })
      }
      toast.success('Đã gửi yêu cầu xóa tài khoản tới Quản trị viên hệ thống.')
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Không thể gửi yêu cầu lúc này.')
    }
  }
}
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
          <button @click="showCurrentPassword = !showCurrentPassword" class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer">
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
          <button @click="showNewPassword = !showNewPassword" class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer">
            <EyeOff v-if="showNewPassword" :size="16" />
            <Eye v-else :size="16" />
          </button>
        </div>
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Xác nhận mật khẩu mới</label>
        <div class="relative">
          <input v-model="accountForm.confirmPassword" :type="showConfirmPassword ? 'text' : 'password'"
            class="w-full px-4 py-2.5 pr-10 bg-gray-50 dark:bg-surface-700 border border-gray-200 dark:border-surface-600 rounded-xl text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 outline-none transition-all" />
          <button @click="showConfirmPassword = !showConfirmPassword" class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer">
            <EyeOff v-if="showConfirmPassword" :size="16" />
            <Eye v-else :size="16" />
          </button>
        </div>
      </div>
    </div>

    <div class="mt-8 flex justify-end">
      <button 
        @click="changePassword"
        :disabled="isSaving"
        class="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-white gradient-primary hover:opacity-90 transition-all shadow-lg shadow-primary-500/25 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer">
        <Save :size="16" v-if="!isSaving" />
        <span v-else class="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></span>
        {{ isSaving ? 'Đang cập nhật...' : 'Cập nhật mật khẩu' }}
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
          <button
            @click="handleDeactivateAccount"
            class="px-4 py-2 rounded-xl text-sm font-medium text-amber-600 dark:text-amber-400 border border-amber-300 dark:border-amber-800/50 hover:bg-amber-50 dark:hover:bg-amber-900/10 transition-all shrink-0 cursor-pointer"
          >
            Vô hiệu hóa
          </button>
        </div>
        <div class="flex items-center justify-between p-4 rounded-xl border border-red-200 dark:border-red-900/30 bg-red-50/50 dark:bg-red-900/5">
          <div>
            <p class="text-sm font-medium text-gray-900 dark:text-white">Xóa tài khoản vĩnh viễn</p>
            <p class="text-xs text-gray-400 mt-0.5">Tất cả dữ liệu sẽ bị xóa vĩnh viễn và không thể khôi phục.</p>
          </div>
          <button
            @click="handleDeleteAccount"
            class="px-4 py-2 rounded-xl text-sm font-medium text-red-600 dark:text-red-400 border border-red-300 dark:border-red-800/50 hover:bg-red-50 dark:hover:bg-red-900/10 transition-all shrink-0 cursor-pointer"
          >
            <Trash2 :size="14" class="inline mr-1" /> Xóa tài khoản
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
