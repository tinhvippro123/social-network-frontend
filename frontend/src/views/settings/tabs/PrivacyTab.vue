<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Shield, Globe, MessageCircle, Ban, UserX, Save } from '@lucide/vue'
import SettingToggle from '@/components/ui/SettingToggle.vue'
import UserAvatar from '@/components/UserAvatar.vue'
import { useSettings } from '@/composables/ui/useSettings'
import { useToast } from '@/composables/ui/useToast'
import chatApi from '@/api/chat.api'

const { privacySettings, saveSettings } = useSettings()
const toast = useToast()
const blockedUsers = ref<Array<{ id: string; name: string; avatar?: string }>>([])
const isLoadingBlocked = ref(false)

async function fetchBlockedUsers() {
  isLoadingBlocked.value = true
  try {
    const res = await chatApi.getBlockedUsers()
    blockedUsers.value = res.data?.data || []
  } catch {
    blockedUsers.value = []
  } finally {
    isLoadingBlocked.value = false
  }
}

async function handleUnblock(user: { id: string; name: string }) {
  try {
    await chatApi.unblockUser(user.id)
    blockedUsers.value = blockedUsers.value.filter(u => u.id !== user.id)
    window.dispatchEvent(new CustomEvent('chat-block-updated', { detail: { userId: user.id, blocked: false } }))
    toast.success(`Đã bỏ chặn ${user.name}`)
  } catch (err: any) {
    toast.error(err.response?.data?.message || 'Không thể bỏ chặn người dùng')
  }
}

onMounted(() => {
  fetchBlockedUsers()
})
</script>

<template>
  <div class="bg-white dark:bg-surface-800 rounded-2xl border border-gray-200 dark:border-surface-700 p-6 sm:p-8 animate-fade-in">
    <h2 class="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
      <Shield :size="20" class="text-primary-500" />
      Quyền riêng tư
    </h2>

    <div class="space-y-6">
      <!-- Profile Visibility -->
      <div>
        <label class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
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
        <label class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
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
      <SettingToggle
        v-model="privacySettings.showOnlineStatus"
        title="Hiển thị trạng thái online"
        description="Người khác có thể thấy bạn đang trực tuyến"
      />
      <SettingToggle
        v-model="privacySettings.showReadReceipts"
        title="Xác nhận đã đọc"
        description="Người gửi biết bạn đã đọc tin nhắn"
      />
    </div>

    <!-- Blocked Users -->
    <div class="mt-8 pt-8 border-t border-gray-200 dark:border-surface-700">
      <h3 class="text-sm font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
        <Ban :size="16" class="text-red-400" /> Người dùng đã chặn ({{ blockedUsers.length }})
      </h3>
      <div v-if="isLoadingBlocked" class="p-6 rounded-xl border border-gray-200 dark:border-surface-700 text-center">
        <div class="w-5 h-5 border-2 border-primary-500/30 border-t-primary-500 rounded-full animate-spin mx-auto mb-2"></div>
        <p class="text-xs text-gray-400">Đang tải danh sách người dùng đã chặn...</p>
      </div>
      <div v-else-if="blockedUsers.length > 0" class="space-y-2.5">
        <div
          v-for="u in blockedUsers"
          :key="u.id"
          class="flex items-center justify-between p-3 rounded-xl border border-gray-200 dark:border-surface-700 bg-gray-50/70 dark:bg-surface-700/40"
        >
          <div class="flex items-center gap-3 min-w-0">
            <UserAvatar :user="{ name: u.name, avatar: u.avatar || '' }" size="sm" />
            <span class="text-sm font-semibold text-gray-900 dark:text-white truncate">{{ u.name }}</span>
          </div>
          <button
            type="button"
            @click="handleUnblock(u)"
            class="px-3 py-1.5 rounded-lg text-xs font-semibold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors cursor-pointer shrink-0"
          >
            Bỏ chặn
          </button>
        </div>
      </div>
      <div v-else class="p-6 rounded-xl border border-dashed border-gray-200 dark:border-surface-600 text-center">
        <UserX :size="32" class="mx-auto text-gray-300 dark:text-surface-600 mb-2" />
        <p class="text-sm text-gray-400">Bạn chưa chặn người dùng nào.</p>
        <p class="text-xs text-gray-400 mt-1">Khi bạn chặn ai đó, họ sẽ không thể gửi tin nhắn trực tiếp cho bạn.</p>
      </div>
      <div class="mt-6 flex justify-end">
        <button @click="saveSettings" class="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-white gradient-primary hover:opacity-90 transition-all shadow-xs cursor-pointer">
          <Save :size="16" /> Lưu thay đổi
        </button>
      </div>
    </div>
  </div>
</template>
