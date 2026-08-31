<script setup lang="ts">
import type { Component } from 'vue'
import { Inbox } from '@lucide/vue'

withDefaults(defineProps<{
  icon?: Component
  title?: string
  description?: string
  actionText?: string
}>(), {
  icon: Inbox as any,
  title: 'Không có dữ liệu',
  description: 'Chưa có thông tin nào để hiển thị tại đây.'
})

const emit = defineEmits<{
  (e: 'action'): void
}>()
</script>

<template>
  <div class="flex flex-col items-center justify-center p-12 text-center bg-white dark:bg-surface-800 rounded-2xl border border-gray-200 dark:border-surface-700 border-dashed">
    <div class="w-16 h-16 rounded-full bg-gray-50 dark:bg-surface-700 flex items-center justify-center mb-4 text-gray-400">
      <component :is="icon" :size="32" stroke-width="1.5" />
    </div>
    <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-2">{{ title }}</h3>
    <p class="text-sm text-gray-500 dark:text-gray-400 max-w-sm mb-6">{{ description }}</p>
    
    <button 
      v-if="actionText"
      @click="emit('action')"
      class="px-6 py-2.5 rounded-xl text-sm font-medium bg-primary-500 text-white hover:bg-primary-600 transition-colors shadow-lg shadow-primary-500/25"
    >
      {{ actionText }}
    </button>
  </div>
</template>
