<script setup lang="ts">
import {
  Bell, ArrowUp, MessageCircle, Reply, UserPlus, AtSign,
  Users, FileCheck, Info, Trash2
} from '@lucide/vue'
import { formatDate } from '@/utils/formatters'
import type { Notification } from '@/composables/core/useNotifications'

const props = defineProps<{
  notification: Notification
}>()

const emit = defineEmits<{
  (e: 'click', notification: Notification): void
  (e: 'delete', id: string): void
}>()

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
  <div
    @click="emit('click', notification)"
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
        @click.stop="emit('delete', notification.id)"
        class="absolute top-4 right-10 opacity-0 group-hover:opacity-100 w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all"
      >
        <Trash2 :size="14" />
      </button>
    </div>
  </div>
</template>
