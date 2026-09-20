<script setup lang="ts">
import { Bell, BellOff, CheckCheck } from '@lucide/vue'
import Skeleton from '@/components/ui/Skeleton.vue'
import NotificationItem from '@/components/notifications/NotificationItem.vue'
import { useNotifications } from '@/composables/core/useNotifications'

const {
  filteredNotifications,
  unreadCount,
  isLoading,
  activeFilter,
  markAllAsRead,
  deleteNotification,
  handleClick
} = useNotifications()
</script>

<template>
  <div class="mx-auto w-full max-w-4xl px-4 sm:px-6 lg:px-8 py-6">
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-primary-500/10 flex items-center justify-center">
          <Bell :size="20" class="text-primary-500" />
        </div>
        <div>
          <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Thông báo</h1>
          <p class="text-sm text-gray-500 dark:text-gray-400">
            <span v-if="unreadCount > 0">{{ unreadCount }} thông báo chưa đọc</span>
            <span v-else>Không có thông báo mới</span>
          </p>
        </div>
      </div>
      <button
        v-if="unreadCount > 0"
        @click="markAllAsRead"
        class="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-primary-500 hover:bg-primary-500/10 transition-all"
      >
        <CheckCheck :size="16" />
        Đánh dấu tất cả đã đọc
      </button>
    </div>

    <!-- Filter Tabs -->
    <div class="flex gap-2 mb-6">
      <button
        @click="activeFilter = 'all'"
        :class="[
          'px-4 py-2 rounded-xl text-sm font-medium transition-all',
          activeFilter === 'all'
            ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/25'
            : 'bg-white dark:bg-surface-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-surface-700 hover:bg-gray-50 dark:hover:bg-surface-700'
        ]"
      >
        Tất cả
      </button>
      <button
        @click="activeFilter = 'unread'"
        :class="[
          'px-4 py-2 rounded-xl text-sm font-medium transition-all',
          activeFilter === 'unread'
            ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/25'
            : 'bg-white dark:bg-surface-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-surface-700 hover:bg-gray-50 dark:hover:bg-surface-700'
        ]"
      >
        <span class="flex items-center gap-1.5">
          Chưa đọc
          <span v-if="unreadCount > 0" class="w-5 h-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
            {{ unreadCount }}
          </span>
        </span>
      </button>
    </div>

    <!-- Loading Skeleton -->
    <div v-if="isLoading" class="space-y-3">
      <div v-for="i in 6" :key="i" class="bg-white dark:bg-surface-800 rounded-2xl border border-gray-200 dark:border-surface-700 p-4">
        <div class="flex items-start gap-4">
          <Skeleton type="avatar" class="w-12 h-12 shrink-0" />
          <div class="flex-1 space-y-2">
            <Skeleton type="text" class="w-3/4" />
            <Skeleton type="text" class="w-1/2" />
          </div>
        </div>
      </div>
    </div>

    <!-- Notification List -->
    <div v-else-if="filteredNotifications.length > 0" class="space-y-3">
      <NotificationItem
        v-for="notification in filteredNotifications"
        :key="notification.id"
        :notification="notification"
        @click="handleClick"
        @delete="deleteNotification"
      />
    </div>

    <!-- Empty State -->
    <div v-else class="flex flex-col items-center justify-center py-20">
      <div class="w-20 h-20 rounded-2xl bg-gray-100 dark:bg-surface-800 flex items-center justify-center mb-4">
        <BellOff :size="32" class="text-gray-400" />
      </div>
      <h3 class="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-1">
        {{ activeFilter === 'unread' ? 'Không có thông báo chưa đọc' : 'Chưa có thông báo nào' }}
      </h3>
      <p class="text-sm text-gray-500 dark:text-gray-400">
        {{ activeFilter === 'unread' ? 'Tất cả thông báo đã được đọc!' : 'Khi có hoạt động mới, bạn sẽ thấy ở đây.' }}
      </p>
    </div>
  </div>
</template>
