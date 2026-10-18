<script setup lang="ts">
import { Bookmark } from '@lucide/vue'

defineProps<{
  itemCount: number
}>()
</script>

<template>
  <div class="relative overflow-hidden rounded-2xl bg-linear-to-r from-emerald-500 via-teal-500 to-cyan-500 p-6 sm:p-8 mb-6 shadow-xl">
    <div class="relative z-10">
      <div class="flex items-center gap-2 mb-3">
        <Bookmark :size="20" class="text-emerald-200" />
        <span class="text-emerald-100 text-sm font-medium">Bộ sưu tập cá nhân</span>
      </div>
      <h1 class="text-2xl sm:text-3xl font-bold text-white mb-2">
        Đã lưu 📚
      </h1>
      <p class="text-emerald-100 text-sm sm:text-base max-w-lg">
        Những bài viết bạn đã lưu lại để đọc sau. Hiện có {{ itemCount }} bài viết.
      </p>
    </div>
    <!-- Decorative shapes -->
    <div class="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
    <div class="absolute bottom-0 right-20 w-24 h-24 bg-white/5 rounded-full translate-y-1/2" />
  </div>
</template>
