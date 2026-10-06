<script setup lang="ts">
import { FileText as FileTextIcon } from '@lucide/vue'
import { inject } from 'vue'

const chatState = inject<any>('chatState')
if (!chatState) {
  throw new Error('ChatState is not provided')
}

const { sharedFiles, openMediaView } = chatState
</script>

<template>
  <div class="p-4 border-b border-gray-100 dark:border-surface-700">
    <div class="flex items-center justify-between mb-3">
      <h3 class="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
        <FileTextIcon :size="16" /> Tệp đính kèm
      </h3>
    </div>
    <div class="space-y-2">
      <template v-if="sharedFiles.length === 0">
        <div class="text-center text-xs text-gray-400 py-4">Chưa có tệp nào</div>
      </template>
      <template v-else>
        <div
          v-for="file in sharedFiles.slice(0, 2)"
          :key="file.id"
          class="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-surface-700/50 transition-colors cursor-pointer group"
        >
          <div class="w-10 h-10 rounded-lg bg-gray-100 dark:bg-surface-700 flex items-center justify-center shrink-0">
            <FileTextIcon :size="18" class="text-gray-500" />
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-[13px] font-medium text-gray-900 dark:text-gray-100 truncate">{{ file.fileName }}</p>
            <p class="text-[11px] text-gray-500 mt-0.5">{{ file.fileSize }}</p>
          </div>
        </div>
        <button
          v-if="sharedFiles.length > 2"
          @click="openMediaView('files')"
          class="w-full mt-1 py-1.5 text-xs text-primary-500 hover:text-primary-600 font-medium transition-colors"
        >
          Xem tất cả ({{ sharedFiles.length }})
        </button>
      </template>
    </div>
  </div>
</template>
