<script setup lang="ts">
import { Bookmark } from '@lucide/vue'

defineProps<{
  itemCount: number
}>()
</script>

<template>
  <div class="relative overflow-hidden rounded-2xl bg-primary-600 dark:bg-primary-900/60 dark:border dark:border-primary-700/50 p-6 sm:p-8 mb-6 shadow-sm">
    <div class="relative z-10">
      <div class="flex items-center gap-2 mb-2.5">
        <Bookmark :size="18" class="text-primary-100" />
        <span class="text-primary-100 text-sm font-medium">Bộ sưu tập cá nhân</span>
      </div>
      <h1 class="text-2xl sm:text-3xl font-bold text-white mb-2">
        Đã lưu 📚
      </h1>
      <p class="text-primary-50 text-sm sm:text-base max-w-lg">
        Những bài viết bạn đã lưu lại để đọc sau. Hiện có {{ itemCount }} bài viết.
      </p>
    </div>
  </div>
</template>
