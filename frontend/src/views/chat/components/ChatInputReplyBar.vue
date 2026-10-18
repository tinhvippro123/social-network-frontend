<script setup lang="ts">
import { X as XIcon } from '@lucide/vue'
import type { ChatMessage } from '@/types'

defineProps<{
  replyingTo: ChatMessage | null
}>()

defineEmits<{
  (e: 'close'): void
}>()
</script>

<template>
  <div v-if="replyingTo" class="flex items-center gap-3 px-4 py-2 border-t border-gray-200 dark:border-surface-700 bg-gray-50 dark:bg-surface-800">
    <div class="w-1 h-8 bg-primary-500 rounded-full shrink-0" />
    <div class="flex-1 min-w-0">
      <p class="text-xs font-medium text-primary-500">Đang trả lời {{ replyingTo.sender.name }}</p>
      <p class="text-xs text-gray-500 truncate">{{ replyingTo.content || (replyingTo.type === 'image' ? 'Hình ảnh' : 'Tệp đính kèm ' + replyingTo.fileName) }}</p>
    </div>
    <button @click="$emit('close')" class="p-1 rounded-lg text-gray-400 hover:text-gray-600 transition-colors">
      <XIcon :size="16" />
    </button>
  </div>
</template>
