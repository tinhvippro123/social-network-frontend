<script setup lang="ts">
import {
  Bell, BellOff, Check, CheckCheck, Trash2,
  ArrowUp, MessageCircle, Reply, UserPlus, AtSign,
  Users, FileCheck, Info, X
} from '@lucide/vue'
import UserAvatar from '@/components/UserAvatar.vue'
import Skeleton from '@/components/ui/Skeleton.vue'
import { formatDate } from '@/utils/formatters'
import { useNotifications } from '@/composables/useNotifications'
import type { Notification } from '@/composables/useNotifications'

const {
  filteredNotifications,
  unreadCount,
  isLoading,
  activeFilter,
  markAllAsRead,
  deleteNotification,
  handleClick
} = useNotifications()

const getNotificationIcon = (type: Notification['type']) => {
  const icons: Record<string, any> = {
    upvote: ArrowUp,
    comment: MessageCircle,
    reply: Reply,
    follow: UserPlus,
    mention: AtSign,
    group_invite: Users,
    post_approved: FileCheck,
    system: Info
  }
  return icons[type] || Bell
}

const getNotificationColor = (type: Notification['type']) => {
  const colors: Record<string, string> = {
    upvote: 'text-primary-500 bg-primary-500/10',
    comment: 'text-blue-500 bg-blue-500/10',
    reply: 'text-green-500 bg-green-500/10',
    follow: 'text-purple-500 bg-purple-500/10',
    mention: 'text-amber-500 bg-amber-500/10',
    group_invite: 'text-teal-500 bg-teal-500/10',
    post_approved: 'text-emerald-500 bg-emerald-500/10',
    system: 'text-gray-500 bg-gray-500/10'
  }
  return colors[type] || 'text-gray-500 bg-gray-500/10'
}
</script>

<template>
  <div class="mx-auto w-full max-w-3xl px-4 sm:px-6 lg:px-8 py-6">
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
      <div
        v-for="notification in filteredNotifications"
        :key="notification.id"
        @click="handleClick(notification)"
        :class="[
          'group relative bg-white dark:bg-surface-800 rounded-2xl border p-4 cursor-pointer transition-all duration-200 hover:shadow-lg hover:shadow-black/5 dark:hover:shadow-black/20 hover:-translate-y-0.5',
          notification.isRead
            ? 'border-gray-200 dark:border-surface-700'
            : 'border-primary-200 dark:border-primary-800/50 bg-primary-50/30 dark:bg-primary-900/10'
        ]"
      >
        <!-- Unread indicator dot -->
        <div
          v-if="!notification.isRead"
          class="absolute top-4 right-4 w-2.5 h-2.5 rounded-full bg-primary-500 animate-pulse"
        />

        <div class="flex items-start gap-4">
          <!-- Avatar / Icon -->
          <div class="relative shrink-0">
            <img
              v-if="notification.avatar"
              :src="notification.avatar"
              :alt="notification.title"
              class="w-12 h-12 rounded-full object-cover ring-2 ring-white dark:ring-surface-800"
            />
            <div
              v-else
              :class="['w-12 h-12 rounded-full flex items-center justify-center', getNotificationColor(notification.type)]"
            >
              <component :is="getNotificationIcon(notification.type)" :size="20" />
            </div>
            <!-- Type badge -->
            <div
              :class="['absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center ring-2 ring-white dark:ring-surface-800', getNotificationColor(notification.type)]"
            >
              <component :is="getNotificationIcon(notification.type)" :size="12" />
            </div>
          </div>

          <!-- Content -->
          <div class="flex-1 min-w-0 pr-8">
            <p class="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
              <span class="font-semibold text-gray-900 dark:text-white">{{ notification.title }}</span>
              {{ ' ' }}{{ notification.message }}
            </p>
            <p class="text-xs text-gray-400 dark:text-gray-500 mt-1.5">
              {{ formatDate(notification.createdAt) }}
            </p>
          </div>

          <!-- Delete button -->
          <button
            @click.stop="deleteNotification(notification.id)"
            class="absolute top-4 right-10 opacity-0 group-hover:opacity-100 w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all"
          >
            <Trash2 :size="14" />
          </button>
        </div>
      </div>
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
