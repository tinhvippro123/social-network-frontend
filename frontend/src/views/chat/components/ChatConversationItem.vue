<script setup lang="ts">
import {
  Pin as PinIcon, BellOff as BellOffIcon, Trash2 as TrashIcon, Ban as BanIcon
} from '@lucide/vue'
import UserAvatar from '@/components/UserAvatar.vue'
import type { ChatConversation } from '@/types'

defineProps<{
  conv: ChatConversation
  isSelected: boolean
  formatMessageTime: (time: string) => string
}>()

const emit = defineEmits<{
  (e: 'select'): void
  (e: 'pin'): void
  (e: 'mute'): void
  (e: 'delete'): void
  (e: 'block'): void
}>()
</script>

<template>
  <div
    @click="emit('select')"
    :class="[
      'flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all group relative',
      isSelected
        ? 'bg-primary-50 dark:bg-primary-500/10'
        : 'hover:bg-gray-50 dark:hover:bg-surface-700/50'
    ]"
  >
    <!-- Avatar -->
    <div class="relative shrink-0">
      <UserAvatar :user="{ avatar: conv.avatar, name: conv.name }" size="md" />
      <div
        v-if="conv.isOnline"
        class="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full ring-2 ring-white dark:ring-surface-800"
      />
      <div
        v-if="conv.isPinned"
        class="absolute -top-1 -right-1 w-4 h-4 bg-gray-600 rounded-full flex items-center justify-center ring-2 ring-white dark:ring-surface-800"
      >
        <PinIcon :size="10" class="text-white" />
      </div>
    </div>

    <!-- Info -->
    <div class="flex-1 min-w-0">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-1.5">
          <h3 :class="[
            'font-medium truncate',
            conv.unreadCount > 0 ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'
          ]">
            {{ conv.name }}
          </h3>
          <BellOffIcon v-if="conv.isMuted" :size="12" class="text-gray-400 shrink-0" />
        </div>
        <span class="text-xs text-gray-500 shrink-0 ml-2">
          {{ formatMessageTime(conv.lastMessageTime) }}
        </span>
      </div>
      <div class="flex items-center justify-between mt-0.5">
        <div class="flex items-center gap-1 min-w-0">
          <p :class="[
            'text-sm truncate',
            conv.unreadCount > 0 ? 'font-semibold text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'
          ]">
            {{ conv.lastMessage }}
          </p>
        </div>
        <span
          v-if="conv.unreadCount > 0"
          class="ml-2 w-5 h-5 bg-primary-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full shrink-0"
        >
          {{ conv.unreadCount > 99 ? '99+' : conv.unreadCount }}
        </span>
      </div>
    </div>

    <!-- Hover Actions -->
    <div class="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-white dark:bg-surface-800 p-1 rounded-lg shadow-sm border border-gray-200 dark:border-surface-700">
      <button @click.stop="emit('pin')" class="p-1.5 hover:bg-gray-100 dark:hover:bg-surface-700 rounded-md text-gray-500 tooltip" :data-tip="conv.isPinned ? 'Bỏ ghim' : 'Ghim'">
        <PinIcon :size="14" />
      </button>
      <button @click.stop="emit('mute')" class="p-1.5 hover:bg-gray-100 dark:hover:bg-surface-700 rounded-md text-gray-500 tooltip" :data-tip="conv.isMuted ? 'Bật thông báo' : 'Tắt thông báo'">
        <BellOffIcon :size="14" />
      </button>
      <div class="w-px h-4 bg-gray-200 dark:bg-surface-700 mx-1"></div>
      <button @click.stop="emit('delete')" class="p-1.5 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-md text-red-500 tooltip" data-tip="Xóa đoạn chat">
        <TrashIcon :size="14" />
      </button>
      <button @click.stop="emit('block')" class="p-1.5 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-md text-red-500 tooltip" data-tip="Chặn">
        <BanIcon :size="14" />
      </button>
    </div>
  </div>
</template>
