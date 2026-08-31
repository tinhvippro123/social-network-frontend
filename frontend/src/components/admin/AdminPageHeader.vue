<script setup lang="ts">
import { Search } from '@lucide/vue'

defineProps<{
  title: string
  subtitle?: string
  searchPlaceholder?: string
  modelValue?: string
}>()

defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()
</script>

<template>
  <div>
    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <slot name="title-icon"></slot>
          {{ title }}
        </h1>
        <p v-if="subtitle" class="text-sm text-gray-500 dark:text-gray-400 mt-1">{{ subtitle }}</p>
      </div>
      <div v-if="$slots.actions" class="flex items-center gap-2">
        <slot name="actions"></slot>
      </div>
    </div>

    <div class="flex flex-col sm:flex-row gap-3 mb-6">
      <!-- Search -->
      <div v-if="searchPlaceholder" class="flex-1 flex items-center gap-2 bg-white dark:bg-surface-800 rounded-xl px-4 py-2.5 border border-gray-200 dark:border-surface-700">
        <Search :size="18" class="text-gray-400" />
        <input 
          :value="modelValue"
          @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
          type="text" 
          :placeholder="searchPlaceholder" 
          class="bg-transparent border-none outline-none text-sm w-full text-gray-700 dark:text-gray-300 placeholder-gray-400" 
        />
      </div>
      
      <!-- Filters Slot -->
      <div class="flex gap-2">
        <slot name="filters"></slot>
      </div>
    </div>
  </div>
</template>
