<script setup lang="ts">
import Skeleton from '@/components/ui/Skeleton.vue'

defineProps<{
  stats: any
  isLoading: boolean
}>()

/** Chiều cao cột (px), tránh chia cho 0 khi cả khoảng không có dữ liệu */
const barHeight = (val: number, list: number[]) => {
  const max = Math.max(0, ...(list || []))
  return max === 0 ? 4 : Math.max(4, (val / max) * 140)
}
</script>

<template>
  <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
    <template v-if="isLoading">
      <div v-for="i in 2" :key="i" class="bg-white dark:bg-surface-800 rounded-2xl border border-gray-200 dark:border-surface-700 p-5">
        <Skeleton class="h-6 w-48 mb-6 rounded" />
        <Skeleton class="h-48 w-full rounded-lg" />
      </div>
    </template>
    <template v-else-if="stats">
      <!-- User Growth Chart -->
      <div class="bg-white dark:bg-surface-800 rounded-2xl border border-gray-200 dark:border-surface-700 p-5">
        <div class="flex items-center justify-between mb-6">
          <h3 class="font-bold text-gray-900 dark:text-white">Người dùng mới</h3>
          <span class="text-xs font-semibold text-red-500">+{{ stats.newUsersInRange }} trong kỳ</span>
        </div>
        <div class="flex items-end justify-between gap-1.5 h-48">
          <div v-for="(val, i) in stats.userGrowth" :key="i" class="flex-1 min-w-0 flex flex-col items-center gap-2" :title="`${stats.growthLabels[i]}: ${val}`">
            <span v-if="stats.userGrowth.length <= 14" class="text-xs text-gray-400 font-medium">{{ val }}</span>
            <div class="w-full bg-linear-to-t from-red-500 to-orange-400 rounded-t-lg transition-all duration-700" :style="{ height: `${barHeight(val, stats.userGrowth)}px` }" />
            <span v-if="stats.userGrowth.length <= 14 || Number(i) % 5 === 0" class="text-[10px] text-gray-400 truncate">{{ stats.growthLabels[i] }}</span>
          </div>
        </div>
      </div>

      <!-- Post Growth Chart -->
      <div class="bg-white dark:bg-surface-800 rounded-2xl border border-gray-200 dark:border-surface-700 p-5">
        <div class="flex items-center justify-between mb-6">
          <h3 class="font-bold text-gray-900 dark:text-white">Bài viết mới</h3>
          <span class="text-xs font-semibold text-blue-500">+{{ stats.newPostsInRange }} trong kỳ</span>
        </div>
        <div class="flex items-end justify-between gap-1.5 h-48">
          <div v-for="(val, i) in stats.postGrowth" :key="i" class="flex-1 min-w-0 flex flex-col items-center gap-2" :title="`${stats.growthLabels[i]}: ${val}`">
            <span v-if="stats.postGrowth.length <= 14" class="text-xs text-gray-400 font-medium">{{ val }}</span>
            <div class="w-full bg-primary-600 dark:bg-slate-600 rounded-t-lg transition-all duration-700" :style="{ height: `${barHeight(val, stats.postGrowth)}px` }" />
            <span v-if="stats.postGrowth.length <= 14 || Number(i) % 5 === 0" class="text-[10px] text-gray-400 truncate">{{ stats.growthLabels[i] }}</span>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>
