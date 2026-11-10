<script setup lang="ts">
import { computed } from 'vue'
import { Flame } from '@lucide/vue'

defineProps<{
  userName: string
}>()

const greeting = computed(() => {
  const hour = new Date().getHours()
  if (hour < 12) return 'Chào buổi sáng'
  if (hour < 18) return 'Chào buổi chiều'
  return 'Chào buổi tối'
})
</script>

<template>
  <div class="relative overflow-hidden rounded-2xl bg-white dark:bg-surface-800 border border-gray-200 dark:border-surface-700 p-6 sm:p-8 mb-6 shadow-xs">
    <div class="relative z-10">
      <div class="flex items-center gap-2 mb-2">
        <Flame :size="18" class="text-primary-500" />
        <span class="text-primary-600 dark:text-primary-400 text-sm font-semibold">Chào mừng đến VietBlog</span>
      </div>
      <h1 class="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-1.5">
        {{ greeting }}, {{ userName }}
      </h1>
      <p class="text-gray-500 dark:text-gray-400 text-sm sm:text-base max-w-lg">
        Hôm nay có gì mới để khám phá?
      </p>
    </div>
  </div>
</template>
