<script setup lang="ts">
import { Check } from '@lucide/vue'
import UserAvatar from '@/components/UserAvatar.vue'
import type { User } from '@/types'

defineProps<{
  user: User
  isSelected: boolean
}>()

const emit = defineEmits<{
  (e: 'toggle', user: User): void
}>()
</script>

<template>
  <button
    @click="emit('toggle', user)"
    :class="[
      'w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all text-left',
      isSelected
        ? 'bg-primary-50 dark:bg-primary-900/20'
        : 'hover:bg-gray-50 dark:hover:bg-surface-700'
    ]"
  >
    <UserAvatar :user="user" size="sm" />
    <div class="flex-1 min-w-0">
      <p class="text-sm font-medium text-gray-900 dark:text-white truncate">{{ user.name }}</p>
      <p class="text-xs text-gray-500 dark:text-gray-400 truncate">{{ user.bio || user.email }}</p>
    </div>
    <div
      :class="[
        'w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all shrink-0',
        isSelected
          ? 'bg-primary-500 border-primary-500'
          : 'border-gray-300 dark:border-surface-500'
      ]"
    >
      <Check v-if="isSelected" :size="12" class="text-white" />
    </div>
  </button>
</template>
