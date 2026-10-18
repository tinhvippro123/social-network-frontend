<script setup lang="ts">
import { TrendingUp, Eye, ArrowUpRight } from '@lucide/vue'

defineProps<{
  totalViews: number
  totalUpvotes: number
}>()
</script>

<template>
  <div class="relative overflow-hidden rounded-2xl bg-linear-to-r from-orange-500 via-red-500 to-pink-500 p-6 sm:p-8 mb-6 shadow-xl">
    <div class="relative z-10">
      <div class="flex items-center gap-2 mb-3">
        <TrendingUp :size="20" class="text-orange-200" />
        <span class="text-orange-100 text-sm font-medium">Nội dung nổi bật</span>
      </div>
      <h1 class="text-2xl sm:text-3xl font-bold text-white mb-2">
        Thịnh hành 🔥
      </h1>
      <p class="text-orange-100 text-sm sm:text-base max-w-lg mb-4">
        Những bài viết được cộng đồng yêu thích và tương tác nhiều nhất
      </p>
      <!-- Stats -->
      <div class="flex items-center gap-6">
        <div class="flex items-center gap-2">
          <Eye :size="16" class="text-orange-200" />
          <span class="text-white text-sm font-medium">{{ totalViews.toLocaleString() }} lượt xem</span>
        </div>
        <div class="flex items-center gap-2">
          <ArrowUpRight :size="16" class="text-orange-200" />
          <span class="text-white text-sm font-medium">{{ totalUpvotes.toLocaleString() }} lượt vote</span>
        </div>
      </div>
    </div>
    <!-- Decorative shapes -->
    <div class="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
    <div class="absolute bottom-0 right-20 w-24 h-24 bg-white/5 rounded-full translate-y-1/2" />
    <div class="absolute top-1/2 right-10 w-16 h-16 bg-white/5 rounded-full" />
  </div>
</template>
