<script setup lang="ts">
import { Bell, Mail } from '@lucide/vue'
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
</template>
