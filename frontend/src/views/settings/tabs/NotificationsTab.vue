<script setup lang="ts">
import { Bell, Mail, Save } from '@lucide/vue'
import SettingToggle from '@/components/ui/SettingToggle.vue'
import { useSettings } from '@/composables/ui/useSettings'

const { notificationSettings, isSaving, saveSettings } = useSettings()
</script>

<template>
  <div class="bg-white dark:bg-surface-800 rounded-2xl border border-gray-200 dark:border-surface-700 p-6 sm:p-8 animate-fade-in">
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
        <SettingToggle
          v-model="notificationSettings.emailNewFollower"
          title="Người theo dõi mới"
          description="Nhận email khi có người theo dõi bạn"
        />
        <SettingToggle
          v-model="notificationSettings.emailNewComment"
          title="Bình luận mới"
          description="Nhận email khi có người bình luận bài viết của bạn"
        />
        <SettingToggle
          v-model="notificationSettings.emailNewMessage"
          title="Tin nhắn mới"
          description="Nhận email khi có tin nhắn mới"
        />
      </div>
    </div>

    <!-- In-app Notifications -->
    <div>
      <div class="mb-4">
        <h3 class="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <Bell :size="16" class="text-gray-400" /> Thông báo trực tiếp trên web (Trong ứng dụng)
        </h3>
        <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Hiển thị ở biểu tượng chuông thông báo hoặc thông báo nổi khi bạn đang sử dụng VietBlog
        </p>
      </div>
      <div class="space-y-4">
        <SettingToggle
          v-model="notificationSettings.pushNewFollower"
          title="Người theo dõi mới"
          description="Hiển thị trên chuông thông báo khi có người theo dõi bạn"
        />
        <SettingToggle
          v-model="notificationSettings.pushNewComment"
          title="Bình luận mới"
          description="Hiển thị trên chuông thông báo khi có người bình luận hoặc phản hồi bài viết"
        />
        <SettingToggle
          v-model="notificationSettings.pushNewMessage"
          title="Tin nhắn mới"
          description="Hiển thị thông báo trực tiếp trên màn hình khi có tin nhắn mới"
        />
        <SettingToggle
          v-model="notificationSettings.pushTrending"
          title="Bài viết thịnh hành"
          description="Hiển thị trên chuông thông báo khi bài viết của bạn đạt mức nổi bật trong cộng đồng"
        />
      </div>
    </div>

    <div class="mt-6 pt-6 border-t border-gray-200 dark:border-surface-700 flex justify-end">
      <button
        @click="saveSettings"
        :disabled="isSaving"
        class="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-white gradient-primary hover:opacity-90 transition-all shadow-xs disabled:opacity-50 cursor-pointer"
      >
        <span v-if="isSaving" class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        <Save v-else :size="16" />
        {{ isSaving ? 'Đang lưu...' : 'Lưu thay đổi' }}
      </button>
    </div>
  </div>
</template>
