<script setup lang="ts">
import { computed } from 'vue'
import type { User } from '@/types'

const props = withDefaults(defineProps<{
  user: Pick<User, 'name' | 'avatar'>
  size?: 'sm' | 'md' | 'lg' | 'xl'
  showRing?: boolean
}>(), {
  size: 'md',
  showRing: false
})

const sizeClasses = computed(() => {
  switch (props.size) {
    case 'sm': return 'w-6 h-6 text-xs'
    case 'md': return 'w-8 h-8 text-sm'
    case 'lg': return 'w-12 h-12 text-base'
    case 'xl': return 'w-24 h-24 sm:w-32 sm:h-32 text-2xl'
    default: return 'w-8 h-8 text-sm'
  }
})
</script>

<template>
  <img
    v-if="user.avatar"
    :src="user.avatar"
    :alt="user.name"
    :class="[
      'rounded-full object-cover bg-gray-100 dark:bg-surface-700',
      sizeClasses,
      showRing ? 'ring-2 ring-white dark:ring-surface-800' : ''
    ]"
  />
  <div
    v-else
    :class="[
      'rounded-full flex items-center justify-center font-bold bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400',
      sizeClasses,
      showRing ? 'ring-2 ring-white dark:ring-surface-800' : ''
    ]"
  >
    {{ user.name.charAt(0).toUpperCase() }}
  </div>
</template>
