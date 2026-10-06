<script setup lang="ts">
import { Shield, Globe, MessageCircle, Ban, UserX } from '@lucide/vue'
import SettingToggle from '@/components/ui/SettingToggle.vue'
import { useSettings } from '@/composables/ui/useSettings'

const { privacySettings } = useSettings()
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
        <Ban :size="16" class="text-red-400" /> Người dùng đã chặn
      </h3>
      <div class="p-6 rounded-xl border border-dashed border-gray-200 dark:border-surface-600 text-center">
        <UserX :size="32" class="mx-auto text-gray-300 dark:text-surface-600 mb-2" />
        <p class="text-sm text-gray-400">Bạn chưa chặn người dùng nào.</p>
        <p class="text-xs text-gray-400 mt-1">Khi bạn chặn ai đó, họ sẽ không thể xem trang cá nhân, gửi tin nhắn hoặc bình luận bài viết của bạn.</p>
      </div>
    </div>
  </div>
</template>
