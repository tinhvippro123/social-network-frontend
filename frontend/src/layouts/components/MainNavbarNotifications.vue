<script setup lang="ts">
import { Bell } from '@lucide/vue'
import { formatRelativeTime } from '@/utils/formatters'

defineProps<{
  uiStore: any
  showNotifications: boolean
}>()

const emit = defineEmits<{
  (e: 'update:showNotifications', value: boolean): void
}>()
</script>

<template>
  <div class="relative">
    <button
      class="notification-trigger relative p-2 rounded-xl text-gray-500 hover:bg-gray-100 dark:hover:bg-surface-700 transition-colors"
      @click.stop="emit('update:showNotifications', !showNotifications)"
    >
      <Bell :size="20" />
      <span
        v-if="uiStore.unreadCount > 0"
        class="absolute -top-0.5 -right-0.5 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium animate-pulse"
      >
        {{ uiStore.unreadCount }}
      </span>
    </button>

    <!-- Notification Dropdown -->
    <transition name="slide-up">
      <div
        v-if="showNotifications"
        class="notification-panel absolute right-0 top-12 w-80 bg-white dark:bg-surface-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-surface-700 overflow-hidden z-50"
      >
        <div class="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-surface-700">
          <h3 class="font-semibold text-sm">Thông báo</h3>
          <button
            @click="uiStore.markAllRead"
            class="text-xs text-primary-500 hover:text-primary-600 font-medium"
          >
            Đánh dấu tất cả đã đọc
          </button>
        </div>
        <div class="max-h-80 overflow-y-auto">
          <div v-if="uiStore.notifications.length === 0" class="py-8 text-center text-gray-500 dark:text-gray-400">
            <Bell class="w-8 h-8 mx-auto mb-2 opacity-30" />
            <p class="text-sm">Không có thông báo nào</p>
          </div>
          <div
            v-else
            v-for="notif in uiStore.notifications"
            :key="notif.id"
            @click="uiStore.markNotificationRead(notif.id); emit('update:showNotifications', false)"
            :class="[
              'flex items-start gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-surface-700 cursor-pointer transition-colors border-b border-gray-100 dark:border-surface-700 last:border-0',
              !notif.isRead ? 'bg-primary-50/50 dark:bg-primary-900/10' : ''
            ]"
          >
            <img
              v-if="notif.avatar"
              :src="notif.avatar"
              class="w-9 h-9 rounded-full shrink-0"
            />
            <div v-else class="w-9 h-9 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center shrink-0">
              <Bell :size="16" class="text-primary-500" />
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">{{ notif.message }}</p>
              <p class="text-xs text-gray-400 mt-1">{{ formatRelativeTime(notif.createdAt) }}</p>
            </div>
            <div v-if="!notif.isRead" class="w-2 h-2 rounded-full bg-primary-500 shrink-0 mt-2" />
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<style scoped>
.slide-up-enter-active, .slide-up-leave-active {
  transition: all 0.2s ease;
}
.slide-up-enter-from, .slide-up-leave-to {
  opacity: 0;
  transform: translateY(8px);
}
</style>
