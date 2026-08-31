<script setup lang="ts">
import { Loader2 } from '@lucide/vue'

defineProps<{
  size?: number
  text?: string
  fullScreen?: boolean
}>()
</script>

<template>
  <div
    :class="[
      'flex flex-col items-center justify-center gap-3 text-primary-500',
      fullScreen ? 'fixed inset-0 bg-white/80 dark:bg-gray-950/80 backdrop-blur-sm z-50' : 'p-8'
    ]"
  >
    <Loader2 :size="size || 32" class="animate-spin" />
    <span v-if="text" class="text-sm font-medium text-gray-500 dark:text-gray-400">
      {{ text }}
    </span>
  </div>
</template>
