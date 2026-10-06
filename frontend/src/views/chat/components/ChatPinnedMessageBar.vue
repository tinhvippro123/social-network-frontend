<script setup lang="ts">
import { Pin as PinIcon, X as XIcon } from '@lucide/vue'
import type { ChatMessage } from '@/types'

defineProps<{
  pinnedMessage: ChatMessage
}>()

defineEmits<{
  (e: 'unpin', id: string): void
}>()
</script>

<template>
  <div class="flex items-center justify-between px-4 py-2 bg-primary-50 dark:bg-primary-900/20 border-b border-primary-100 dark:border-primary-900/30 cursor-pointer hover:bg-primary-100 dark:hover:bg-primary-900/30 transition-colors">
    <div class="flex items-center gap-3 overflow-hidden">
      <PinIcon :size="16" class="text-primary-600 dark:text-primary-400 shrink-0" />
      <div class="flex-1 min-w-0">
        <p class="text-xs font-semibold text-primary-700 dark:text-primary-300">Tin nhắn đã ghim</p>
        <p class="text-sm text-gray-600 dark:text-gray-400 truncate">{{ pinnedMessage.content }}</p>
      </div>
    </div>
    <button @click.stop="$emit('unpin', pinnedMessage.id)" class="p-1 rounded-lg text-primary-600 hover:bg-primary-100 dark:hover:bg-primary-900/50 transition-colors shrink-0">
      <XIcon :size="16" />
    </button>
  </div>
</template>
