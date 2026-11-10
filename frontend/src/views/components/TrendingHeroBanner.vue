<script setup lang="ts">
import { TrendingUp, Eye, ArrowUpRight } from '@lucide/vue'

defineProps<{
  totalViews: number
  totalUpvotes: number
}>()
</script>

<template>
  <div class="relative overflow-hidden rounded-2xl bg-primary-600 p-6 sm:p-8 mb-6 shadow-sm">
    <div class="relative z-10">
      <div class="flex items-center gap-2 mb-2.5">
        <TrendingUp :size="18" class="text-primary-100" />
        <span class="text-primary-100 text-sm font-medium">Nội dung nổi bật</span>
      </div>
      <h1 class="text-2xl sm:text-3xl font-bold text-white mb-2">
        Thịnh hành
      </h1>
      <p class="text-primary-50 text-sm sm:text-base max-w-lg mb-4">
        Những bài viết được cộng đồng yêu thích và tương tác nhiều nhất
      </p>
      <!-- Stats -->
      <div class="flex items-center gap-6">
        <div class="flex items-center gap-2">
          <Eye :size="16" class="text-primary-100" />
          <span class="text-white text-sm font-semibold">{{ totalViews.toLocaleString() }} lượt xem</span>
        </div>
        <div class="flex items-center gap-2">
          <ArrowUpRight :size="16" class="text-primary-100" />
          <span class="text-white text-sm font-semibold">{{ totalUpvotes.toLocaleString() }} lượt vote</span>
        </div>
      </div>
    </div>
  </div>
</template>
