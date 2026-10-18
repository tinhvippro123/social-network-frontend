<script setup lang="ts">
import UserAvatar from '@/components/UserAvatar.vue'
import type { User } from '@/types'

defineProps<{
  user?: User
}>()
</script>

<template>
  <div class="flex items-end gap-2 mt-2">
    <UserAvatar v-if="user" :user="user" size="sm" class="w-7 h-7 shrink-0" />
    <div class="bg-white dark:bg-surface-800 rounded-2xl rounded-bl-md px-4 py-3 border border-gray-200 dark:border-surface-700">
      <div class="flex gap-1">
        <span class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0ms" />
        <span class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 150ms" />
        <span class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 300ms" />
      </div>
    </div>
  </div>
</template>
