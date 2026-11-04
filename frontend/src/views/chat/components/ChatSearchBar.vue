<script setup lang="ts">
import { ChevronLeft as ChevronLeftIcon, X as XIcon } from '@lucide/vue'

withDefaults(defineProps<{
  showSearchInChat: boolean
  searchQuery: string
  searchResults: any[]
  currentSearchIndex?: number
}>(), {
  currentSearchIndex: 0
})

const emit = defineEmits<{
  (e: 'update:searchQuery', value: string): void
  (e: 'performSearch'): void
  (e: 'closeSearch'): void
  (e: 'clearSearch'): void
  (e: 'prevResult'): void
  (e: 'nextResult'): void
}>()
</script>

<template>
  <!-- Search in Chat Bar -->
  <div v-if="showSearchInChat" class="px-4 py-2 bg-white dark:bg-surface-800 border-b border-gray-200 dark:border-surface-700">
    <div class="flex items-center gap-2">
      <div class="flex-1 flex items-center gap-2 bg-gray-100 dark:bg-surface-700 rounded-xl px-3 py-1.5 border border-gray-200 dark:border-surface-700 focus-within:border-primary-500 transition-colors">
        <input
          :value="searchQuery"
          @input="emit('update:searchQuery', ($event.target as HTMLInputElement).value)"
          @keydown.enter="emit('performSearch')"
          type="text"
          placeholder="Tìm kiếm trong cuộc trò chuyện..."
          class="flex-1 bg-transparent border-none outline-none text-sm text-gray-700 dark:text-gray-300"
          autofocus
        />
        <button v-if="searchQuery" @click="emit('clearSearch')" class="p-0.5 text-gray-400 hover:text-gray-600 cursor-pointer">
          <XIcon :size="14" />
        </button>
      </div>
      <button @click="emit('closeSearch')" class="text-sm font-medium text-primary-500 hover:text-primary-600 cursor-pointer">Xong</button>
    </div>
    <div v-if="searchResults.length > 0" class="mt-2 text-xs text-gray-500 flex justify-between items-center">
      <span>Tìm thấy {{ searchResults.length }} kết quả</span>
      <div class="flex items-center gap-2">
        <button
          type="button"
          class="p-1 rounded hover:bg-gray-100 dark:hover:bg-surface-700 hover:text-primary-500 cursor-pointer"
          title="Kết quả trước"
          @click="emit('prevResult')"
        >
          <ChevronLeftIcon :size="14" />
        </button>
        <span class="font-medium">{{ currentSearchIndex + 1 }} / {{ searchResults.length }}</span>
        <button
          type="button"
          class="p-1 rounded hover:bg-gray-100 dark:hover:bg-surface-700 hover:text-primary-500 cursor-pointer"
          title="Kết quả tiếp theo"
          @click="emit('nextResult')"
        >
          <ChevronLeftIcon :size="14" class="rotate-180" />
        </button>
      </div>
    </div>
  </div>
</template>
