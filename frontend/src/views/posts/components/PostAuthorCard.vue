<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import UserAvatar from '@/components/UserAvatar.vue'
import { formatNumber } from '@/utils/formatters'
import type { User } from '@/types'

const props = defineProps<{
  author: User | any
}>()

const router = useRouter()
const isFollowing = ref(false)

function toggleFollow() {
  isFollowing.value = !isFollowing.value
}
</script>

<template>
  <div class="bg-white dark:bg-surface-800 rounded-2xl border border-gray-200 dark:border-surface-700 p-5 text-center">
    <UserAvatar :user="author" size="lg" class="mx-auto ring-3 ring-primary-500/20 mb-3" />
    <h4 class="font-bold text-gray-900 dark:text-white">{{ author.name }}</h4>
    <p class="text-xs text-gray-400 mt-1 mb-3">{{ author.bio }}</p>
    <div class="flex justify-center gap-4 text-center mb-4">
      <div>
        <p class="text-lg font-bold text-gray-900 dark:text-white">{{ author.postsCount }}</p>
        <p class="text-xs text-gray-400">Bài viết</p>
      </div>
      <div>
        <p class="text-lg font-bold text-gray-900 dark:text-white">{{ formatNumber(author.followersCount) }}</p>
        <p class="text-xs text-gray-400">Followers</p>
      </div>
    </div>
    <button
      @click="toggleFollow"
      :class="[
        'w-full py-2 rounded-xl text-sm font-medium transition-all',
        isFollowing
          ? 'bg-gray-100 dark:bg-surface-700 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-surface-600 hover:border-red-300 hover:text-red-500 dark:hover:text-red-400'
          : 'text-white gradient-primary hover:opacity-90 shadow-lg shadow-primary-500/25'
      ]"
    >
      {{ isFollowing ? '✓ Đang theo dõi' : 'Theo dõi' }}
    </button>
  </div>
</template>
