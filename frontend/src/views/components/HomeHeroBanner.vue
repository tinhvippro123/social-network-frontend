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
  <div class="relative overflow-hidden rounded-2xl bg-primary-600 p-6 sm:p-8 mb-6 shadow-sm">
    <div class="relative z-10">
      <div class="flex items-center gap-2 mb-2.5">
        <Flame :size="18" class="text-primary-100" />
        <span class="text-primary-100 text-sm font-medium">Chào mừng đến VietBlog</span>
      </div>
      <h1 class="text-2xl sm:text-3xl font-bold text-white mb-2">
        {{ greeting }}, {{ userName }}
      </h1>
      <p class="text-primary-50 text-sm sm:text-base max-w-lg">
        Hôm nay có gì mới để khám phá?
      </p>
    </div>
  </div>
</template>
