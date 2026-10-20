<script setup lang="ts">
import { ChevronRight, ChevronLeft, Flame } from '@lucide/vue'
import { useCategoryTabs } from '@/composables/ui/useCategoryTabs'

const {
  categories,
  categoryContainer,
  canScrollLeft,
  canScrollRight,
  scrollCategories
} = useCategoryTabs()

defineProps<{
  modelValue: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()
</script>

<template>
  <div class="relative flex items-center gap-1.5 w-full">
    <!-- Left Arrow (Chỉ hiện khi bị tràn và đã cuộn sang phải) -->
    <transition
      enter-active-class="transition-opacity duration-200"
      leave-active-class="transition-opacity duration-150"
      enter-from-class="opacity-0"
      leave-to-class="opacity-0"
    >
      <button
        v-if="canScrollLeft"
        type="button"
        @click="scrollCategories('left')"
        class="shrink-0 p-1.5 rounded-xl bg-white dark:bg-surface-800 border border-gray-200 dark:border-surface-700 text-gray-500 hover:text-primary-500 hover:border-primary-500/30 transition-all duration-200 shadow-xs cursor-pointer active:scale-95"
        title="Cuộn sang trái"
      >
        <ChevronLeft :size="18" />
      </button>
    </transition>

    <!-- Scrollable Categories Container -->
    <div
      ref="categoryContainer"
      class="flex items-center gap-2 overflow-x-auto py-1 scrollbar-hide scroll-smooth flex-1 min-w-0"
    >
      <button
        type="button"
        @click="emit('update:modelValue', 'all')"
        :class="[
          'shrink-0 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer',
          modelValue === 'all'
            ? 'gradient-primary text-white shadow-md shadow-primary-500/20'
            : 'bg-white dark:bg-surface-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-surface-700 border border-gray-200 dark:border-surface-700'
        ]"
      >
        <span class="flex items-center gap-1.5">
          <Flame :size="15" />
          Tất cả
        </span>
      </button>

      <button
        v-for="cat in categories"
        :key="cat.slug"
        type="button"
        @click="emit('update:modelValue', cat.slug)"
        :class="[
          'shrink-0 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer',
          modelValue === cat.slug
            ? 'gradient-primary text-white shadow-md shadow-primary-500/20'
            : 'bg-white dark:bg-surface-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-surface-700 border border-gray-200 dark:border-surface-700'
        ]"
      >
        <span class="flex items-center gap-1.5">
          <span v-if="cat.icon" class="text-sm">{{ cat.icon }}</span>
          {{ cat.name }}
        </span>
      </button>
    </div>

    <!-- Right Arrow (Chỉ hiện khi bị tràn và còn nội dung phía sau) -->
    <transition
      enter-active-class="transition-opacity duration-200"
      leave-active-class="transition-opacity duration-150"
      enter-from-class="opacity-0"
      leave-to-class="opacity-0"
    >
      <button
        v-if="canScrollRight"
        type="button"
        @click="scrollCategories('right')"
        class="shrink-0 p-1.5 rounded-xl bg-white dark:bg-surface-800 border border-gray-200 dark:border-surface-700 text-gray-500 hover:text-primary-500 hover:border-primary-500/30 transition-all duration-200 shadow-xs cursor-pointer active:scale-95"
        title="Cuộn sang phải"
      >
        <ChevronRight :size="18" />
      </button>
    </transition>
  </div>
</template>
