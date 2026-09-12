<script setup lang="ts">
import { ChevronLeft, ChevronRight } from '@lucide/vue'
import { computed } from 'vue'

const props = defineProps<{
  currentPage: number
  totalItems: number
  itemsPerPage?: number
  itemName?: string
}>()

const emit = defineEmits<{
  (e: 'update:currentPage', value: number): void
}>()

import { useAdminPagination } from '@/composables/useAdminPagination'

const {
  totalPages,
  startItem,
  endItem,
  handlePrev,
  handleNext
} = useAdminPagination(props, emit)
</script>

<template>
  <div class="flex flex-col sm:flex-row items-center justify-between gap-4 px-5 py-3 border-t border-gray-200 dark:border-surface-700">
    <p class="text-xs text-gray-400">
      Hiển thị {{ totalItems === 0 ? 0 : startItem }}-{{ endItem }} / {{ totalItems }} {{ itemName || 'mục' }}
    </p>
    
    <div class="flex items-center gap-1">
      <button 
        @click="handlePrev" 
        :disabled="currentPage <= 1"
        :class="['p-1.5 rounded-lg transition-colors', currentPage <= 1 ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-surface-700']"
      >
        <ChevronLeft :size="16" />
      </button>
      
      <!-- Lược giản: Chỉ hiển thị page hiện tại vì đây là admin tĩnh -->
      <button class="px-3 py-1 rounded-lg text-xs font-medium bg-red-500 text-white">
        {{ currentPage }}
      </button>
      
      <button 
        @click="handleNext" 
        :disabled="currentPage >= totalPages"
        :class="['p-1.5 rounded-lg transition-colors', currentPage >= totalPages ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-surface-700']"
      >
        <ChevronRight :size="16" />
      </button>
    </div>
  </div>
</template>
