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

import { useUserAvatar } from '@/composables/ui/useUserAvatar'

const { sizeClasses } = useUserAvatar(props)
</script>

<template>
  <img
    v-if="user.avatar"
    :src="user.avatar"
    :alt="user.name"
    :class="[
      'rounded-full object-cover bg-gray-100 dark:bg-surface-700 shrink-0',
      sizeClasses,
      showRing ? 'ring-2 ring-white dark:ring-surface-800' : ''
    ]"
  />
  <div
    v-else
    :class="[
      'rounded-full flex! items-center justify-center text-center font-bold leading-none select-none bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400 shrink-0',
      sizeClasses,
      showRing ? 'ring-2 ring-white dark:ring-surface-800' : ''
    ]"
  >
    <span class="inline-flex items-center justify-center leading-none">{{ (user.name || '?').trim().charAt(0).toUpperCase() }}</span>
  </div>
</template>
