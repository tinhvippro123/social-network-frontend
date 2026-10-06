<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ChevronDown as ChevronDownIcon } from '@lucide/vue'

const props = withDefaults(defineProps<{
  title: string
  defaultOpen?: boolean
}>(), {
  defaultOpen: false
})

const isOpen = ref(props.defaultOpen)
</script>

<template>
  <div class="border-b border-gray-100 dark:border-surface-700">
    <button 
      @click="isOpen = !isOpen" 
      class="w-full flex items-center justify-between px-4 py-3.5 text-sm font-semibold text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-surface-700/50 transition-colors"
    >
      <span>{{ title }}</span>
      <ChevronDownIcon :size="18" :class="['transition-transform', isOpen ? 'rotate-180' : '']" />
    </button>
    <div v-show="isOpen" class="px-2 pb-2">
      <slot />
    </div>
  </div>
</template>
