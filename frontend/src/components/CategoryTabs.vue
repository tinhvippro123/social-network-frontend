<script setup lang="ts">
import { ref } from 'vue'
import { ChevronRight, ChevronLeft, Flame } from '@lucide/vue'
import { useCategoryTabs } from '@/composables/useCategoryTabs'

const {
  categories,
  categoryContainer,
  scrollCategories
} = useCategoryTabs()

const props = defineProps<{
  modelValue: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()
</script>

<template>
  <div class="relative flex items-center gap-1">
    <!-- Left Arrow -->
    <button
      @click="scrollCategories('left')"
      class="shrink-0 p-1.5 rounded-lg bg-white dark:bg-surface-800 border border-gray-200 dark:border-surface-700 text-gray-500 hover:text-primary-500 hover:border-primary-500/30 transition-all duration-200 shadow-sm"
    >
      <ChevronLeft :size="18" />
    </button>

    <!-- Scrollable Categories -->
    <div
      ref="categoryContainer"
      class="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide scroll-smooth"
    >
      <button
        @click="emit('update:modelValue', 'all')"
        :class="[
          'shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200',
          modelValue === 'all'
            ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/25'
            : 'bg-white dark:bg-surface-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-surface-700 border border-gray-200 dark:border-surface-700'
        ]"
      >
        <span class="flex items-center gap-1.5">
          <Flame :size="14" />
          Tất cả
        </span>
      </button>
      <button
        v-for="cat in categories"
        :key="cat.slug"
        @click="emit('update:modelValue', cat.slug)"
        :class="[
          'shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200',
          modelValue === cat.slug
            ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/25'
            : 'bg-white dark:bg-surface-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-surface-700 border border-gray-200 dark:border-surface-700'
        ]"
      >
        <span class="flex items-center gap-1.5">
          <span>{{ cat.icon }}</span>
          {{ cat.name }}
        </span>
      </button>
    </div>

    <!-- Right Arrow -->
    <button
      @click="scrollCategories('right')"
      class="shrink-0 p-1.5 rounded-lg bg-white dark:bg-surface-800 border border-gray-200 dark:border-surface-700 text-gray-500 hover:text-primary-500 hover:border-primary-500/30 transition-all duration-200 shadow-sm"
    >
      <ChevronRight :size="18" />
    </button>
  </div>
</template>
