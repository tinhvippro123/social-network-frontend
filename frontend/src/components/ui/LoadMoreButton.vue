<script setup lang="ts">
import { Loader2, CheckCircle } from '@lucide/vue'

defineProps<{
  hasMore: boolean
  isLoading: boolean
  loadingMore: boolean
  itemCount: number
}>()

defineEmits<{
  (e: 'loadMore'): void
}>()
</script>

<template>
  <div class="flex justify-center mt-8">
    <button
      v-if="hasMore"
      @click="$emit('loadMore')"
      :disabled="loadingMore"
      class="px-6 py-3 rounded-xl text-sm font-medium text-primary-500 border border-primary-500/30 hover:bg-primary-500/10 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
    >
      <Loader2 v-if="loadingMore" :size="16" class="animate-spin" />
      {{ loadingMore ? 'Đang tải...' : 'Xem thêm bài viết' }}
    </button>
    <div v-else-if="!isLoading && itemCount > 0" class="flex items-center gap-2 text-sm text-gray-400 dark:text-gray-500">
      <CheckCircle :size="16" />
      Đã hiển thị tất cả bài viết
    </div>
  </div>
</template>
