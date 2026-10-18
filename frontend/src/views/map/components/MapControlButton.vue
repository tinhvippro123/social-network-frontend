<script setup lang="ts">
defineProps<{
  icon: any
}>()

defineEmits<{
  (e: 'click'): void
}>()
</script>

<template>
  <button
    @click="$emit('click')"
    class="p-2.5 bg-white dark:bg-surface-800 rounded-xl shadow-lg border border-gray-200 dark:border-surface-700 text-gray-600 dark:text-gray-400 hover:text-primary-500 transition-colors"
  >
    <component :is="icon" :size="18" />
  </button>
</template>
