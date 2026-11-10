<script setup lang="ts">
import { Bookmark } from '@lucide/vue'

defineProps<{
  itemCount: number
}>()
</script>

<template>
  <div class="relative overflow-hidden rounded-2xl bg-slate-800 dark:bg-surface-800 border border-slate-700 p-6 sm:p-8 mb-6 shadow-sm">
    <div class="relative z-10">
      <div class="flex items-center gap-2 mb-3">
        <Bookmark :size="20" class="text-primary-400" />
        <span class="text-slate-300 text-sm font-medium">Bộ sưu tập cá nhân</span>
      </div>
      <h1 class="text-2xl sm:text-3xl font-bold text-white mb-2">
        Đã lưu 📚
      </h1>
      <p class="text-slate-300 text-sm sm:text-base max-w-lg">
        Những bài viết bạn đã lưu lại để đọc sau. Hiện có {{ itemCount }} bài viết.
      </p>
    </div>
  </div>
</template>
