<script setup lang="ts">
import {
  Trash2 as TrashIcon,
  Smile as SmileIcon,
  Reply as ReplyIcon,
  MoreVertical as MoreVerticalIcon,
  Pin as PinIcon,
  CornerUpLeft as CornerUpLeftIcon,
  Flag as FlagIcon,
} from '@lucide/vue'
import type { ChatMessage } from '@/types'

defineProps<{
  msg: ChatMessage
  activeActionMenu: string | null
}>()

const emit = defineEmits<{
  (e: 'toggleActionMenu', id: string): void
  (e: 'addReaction', id: string, emoji: string): void
  (e: 'setReplyTo', msg: ChatMessage): void
  (e: 'pinMessage', id: string): void
  (e: 'revokeMessage', id: string): void
  (e: 'deleteMessage', id: string): void
}>()
</script>

<template>
  <div
    v-if="!msg.isRevoked"
    :class="[
      'absolute top-1/2 -translate-y-1/2 flex items-center gap-1 transition-opacity',
      msg.isOwn ? 'right-full mr-2' : 'left-full ml-2',
      activeActionMenu === msg.id || activeActionMenu === msg.id + '-react' ? 'opacity-100' : 'opacity-0 group-hover/bubble:opacity-100'
    ]"
  >
    <!-- React Dropdown -->
    <div class="relative">
      <button @click.stop="emit('toggleActionMenu', msg.id + '-react')" class="p-1.5 rounded-full bg-white dark:bg-surface-800 shadow-sm text-gray-400 hover:text-primary-500 hover:bg-gray-50 border border-gray-100 dark:border-surface-700 transition-all z-10">
        <SmileIcon :size="16" />
      </button>
      <div v-if="activeActionMenu === msg.id + '-react'" class="absolute bottom-full mb-2 bg-white dark:bg-surface-800 p-1.5 rounded-2xl shadow-xl border border-gray-200 dark:border-surface-700 flex gap-1 z-50" :class="msg.isOwn ? 'right-0' : 'left-0'">
        <button v-for="emoji in ['👍', '❤️', '😂', '😮', '😢', '🙏']" :key="emoji" @click.stop="emit('addReaction', msg.id, emoji)" class="w-8 h-8 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-surface-700 rounded-full text-lg transition-transform hover:scale-110">
          {{ emoji }}
        </button>
      </div>
    </div>

    <!-- Reply -->
    <button @click.stop="emit('setReplyTo', msg)" class="p-1.5 rounded-full bg-white dark:bg-surface-800 shadow-sm text-gray-400 hover:text-primary-500 hover:bg-gray-50 border border-gray-100 dark:border-surface-700 transition-all z-10">
      <ReplyIcon :size="16" />
    </button>

    <!-- More -->
    <div class="relative">
      <button @click.stop="emit('toggleActionMenu', msg.id)" class="p-1.5 rounded-full bg-white dark:bg-surface-800 shadow-sm text-gray-400 hover:text-primary-500 hover:bg-gray-50 border border-gray-100 dark:border-surface-700 transition-all z-10">
        <MoreVerticalIcon :size="16" />
      </button>
      <!-- More Dropdown -->
      <div v-if="activeActionMenu === msg.id" class="absolute bottom-full mb-2 w-48 bg-[#242526] text-white rounded-xl shadow-xl border border-gray-700 py-2 z-50" :class="msg.isOwn ? 'right-0' : 'left-0'">
        <button v-if="msg.isOwn" @click.stop="emit('revokeMessage', msg.id)" class="w-full flex items-center px-4 py-2 text-[15px] font-medium hover:bg-[#3A3B3C] text-left transition-colors">
          Gỡ
        </button>
        <button @click.stop="emit('toggleActionMenu', 'null')" class="w-full flex items-center px-4 py-2 text-[15px] font-medium hover:bg-[#3A3B3C] text-left transition-colors">
          Chuyển tiếp
        </button>
        <button @click.stop="emit('pinMessage', msg.id)" class="w-full flex items-center px-4 py-2 text-[15px] font-medium hover:bg-[#3A3B3C] text-left transition-colors">
          Ghim
        </button>
        <button v-if="!msg.isOwn" @click.stop="emit('toggleActionMenu', 'null')" class="w-full flex items-center px-4 py-2 text-[15px] font-medium hover:bg-[#3A3B3C] text-left transition-colors">
          Báo cáo
        </button>
      </div>
    </div>
  </div>
</template>
