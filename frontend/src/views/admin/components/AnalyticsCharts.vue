<script setup lang="ts">
import Skeleton from '@/components/ui/Skeleton.vue'

defineProps<{
  stats: any
  isLoading: boolean
}>()
</script>

<template>
  <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
    <template v-if="isLoading">
      <div class="bg-white dark:bg-surface-800 rounded-2xl border border-gray-200 dark:border-surface-700 p-5">
        <Skeleton class="h-6 w-48 mb-6 rounded" />
        <Skeleton class="h-48 w-full rounded-lg" />
      </div>
      <div class="bg-white dark:bg-surface-800 rounded-2xl border border-gray-200 dark:border-surface-700 p-5">
        <Skeleton class="h-6 w-48 mb-6 rounded" />
        <Skeleton class="h-48 w-full rounded-lg" />
      </div>
    </template>
    <template v-else-if="stats">
      <!-- User Growth Chart -->
      <div class="bg-white dark:bg-surface-800 rounded-2xl border border-gray-200 dark:border-surface-700 p-5">
        <h3 class="font-bold text-gray-900 dark:text-white mb-6">Tăng trưởng người dùng</h3>
        <div class="flex items-end justify-between gap-2 h-48">
          <div v-for="(val, i) in stats.userGrowth" :key="i" class="flex-1 flex flex-col items-center gap-2">
            <span class="text-xs text-gray-400 font-medium">{{ val }}</span>
            <div class="w-full bg-linear-to-t from-red-500 to-orange-400 rounded-t-lg transition-all duration-700" :style="{ height: `${(val / Math.max(...stats.userGrowth)) * 140}px` }" />
            <span class="text-xs text-gray-400">{{ ['T2','T3','T4','T5','T6','T7','CN'][Number(i)] }}</span>
          </div>
        </div>
      </div>

      <!-- Post Growth Chart -->
      <div class="bg-white dark:bg-surface-800 rounded-2xl border border-gray-200 dark:border-surface-700 p-5">
        <h3 class="font-bold text-gray-900 dark:text-white mb-6">Bài viết mới theo ngày</h3>
        <div class="flex items-end justify-between gap-2 h-48">
          <div v-for="(val, i) in stats.postGrowth" :key="i" class="flex-1 flex flex-col items-center gap-2">
            <span class="text-xs text-gray-400 font-medium">{{ val }}</span>
            <div class="w-full bg-linear-to-t from-blue-500 to-cyan-400 rounded-t-lg transition-all duration-700" :style="{ height: `${(val / Math.max(...stats.postGrowth)) * 140}px` }" />
            <span class="text-xs text-gray-400">{{ ['T2','T3','T4','T5','T6','T7','CN'][Number(i)] }}</span>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>
