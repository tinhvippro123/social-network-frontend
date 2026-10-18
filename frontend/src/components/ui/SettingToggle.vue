<script setup lang="ts">
defineProps<{
  modelValue: boolean
  title: string
  description?: string
}>()

defineEmits<{
  (e: 'update:modelValue', value: boolean): void
}>()
</script>

<template>
  <label class="flex items-center justify-between cursor-pointer group">
    <div>
      <p class="text-sm font-medium text-gray-700 dark:text-gray-300">{{ title }}</p>
      <p v-if="description" class="text-xs text-gray-400 mt-0.5">{{ description }}</p>
    </div>
    <div class="relative">
      <input
        type="checkbox"
        :checked="modelValue"
        @change="$emit('update:modelValue', ($event.target as HTMLInputElement).checked)"
        class="sr-only peer"
      />
      <div class="w-11 h-6 bg-gray-200 dark:bg-surface-600 peer-checked:bg-primary-500 rounded-full transition-colors"></div>
      <div class="absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform peer-checked:translate-x-5"></div>
    </div>
  </label>
</template>
