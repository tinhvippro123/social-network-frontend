<script setup lang="ts">
import { Bookmark } from '@lucide/vue'

defineProps<{
  itemCount: number
}>()
</script>

<template>
  <div class="relative overflow-hidden rounded-2xl bg-primary-50/80 dark:bg-surface-800 border border-primary-200/80 dark:border-surface-700 p-6 sm:p-8 mb-6 shadow-2xs">
    <div class="relative z-10">
      <div class="flex items-center gap-2 mb-2.5">
        <Bookmark :size="18" class="text-primary-600 dark:text-primary-400" />
        <span class="text-primary-700 dark:text-primary-400 text-sm font-semibold">Bộ sưu tập cá nhân</span>
      </div>
      <h1 class="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
        Đã lưu 📚
      </h1>
      <p class="text-gray-600 dark:text-gray-300 text-sm sm:text-base max-w-lg">
        Những bài viết bạn đã lưu lại để đọc sau. Hiện có {{ itemCount }} bài viết.
      </p>
    </div>
  </div>
</template>
