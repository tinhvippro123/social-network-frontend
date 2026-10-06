<script setup lang="ts">
import { Bell, Mail } from '@lucide/vue'
import SettingToggle from '@/components/ui/SettingToggle.vue'
import { useSettings } from '@/composables/ui/useSettings'

const { notificationSettings } = useSettings()
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

    <!-- Push Notifications -->
    <div>
      <h3 class="text-sm font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
        <Bell :size="16" class="text-gray-400" /> Thông báo đẩy (Push)
      </h3>
      <div class="space-y-4">
        <SettingToggle
          v-model="notificationSettings.pushNewFollower"
          title="Người theo dõi mới"
        />
        <SettingToggle
          v-model="notificationSettings.pushNewComment"
          title="Bình luận mới"
        />
        <SettingToggle
          v-model="notificationSettings.pushTrending"
          title="Bài viết thịnh hành"
          description="Thông báo khi có bài viết nổi bật trong cộng đồng"
        />
      </div>
    </div>
  </div>
</template>
