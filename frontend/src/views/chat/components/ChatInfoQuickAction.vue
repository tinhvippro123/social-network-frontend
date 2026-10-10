<script setup lang="ts">
import type { Component } from 'vue'

defineProps<{
  label: string
  icon: Component
}>()

defineEmits<{
  (e: 'click'): void
}>()
</script>

<template>
  <button
    @click="$emit('click')"
    class="flex flex-col items-center gap-2 p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
  >
    <div class="w-10 h-10 rounded-full bg-gray-100 dark:bg-white/10 flex items-center justify-center text-gray-700 dark:text-gray-300">
      <component :is="icon" :size="20" />
    </div>
    <span class="text-xs font-medium text-gray-600 dark:text-gray-400">{{ label }}</span>
  </button>
</template>
