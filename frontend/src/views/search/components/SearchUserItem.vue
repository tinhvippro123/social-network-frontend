<script setup lang="ts">
import UserAvatar from '@/components/UserAvatar.vue'

defineProps<{
  user: {
    id: string
    name: string
    avatar: string
    bio: string
    postsCount: number
    followersCount: number
  }
}>()

defineEmits<{
  (e: 'click'): void
}>()
</script>

<template>
  <div
    @click="$emit('click')"
    class="flex items-center gap-4 p-4 bg-white dark:bg-surface-800 rounded-2xl border border-gray-200 dark:border-surface-700 hover:border-primary-500/30 cursor-pointer transition-all"
  >
    <UserAvatar :user="user" size="lg" />
    <div class="flex-1">
      <p class="font-semibold text-gray-900 dark:text-white">{{ user.name }}</p>
      <p class="text-sm text-gray-500">{{ user.bio }}</p>
      <div class="flex items-center gap-3 mt-1 text-xs text-gray-400">
        <span>{{ user.postsCount }} bài viết</span>
        <span>{{ user.followersCount }} followers</span>
      </div>
    </div>
    <button class="px-4 py-1.5 rounded-xl text-sm font-medium text-primary-500 border border-primary-500/30 hover:bg-primary-50 dark:hover:bg-primary-500/10 transition-all">
      Theo dõi
    </button>
  </div>
</template>
