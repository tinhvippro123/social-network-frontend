<script setup lang="ts">
import { useRouter } from 'vue-router'
import { formatDate } from '@/utils/formatters'
import type { Post } from '@/types'

defineProps<{
  posts: Post[]
}>()

const router = useRouter()
</script>

<template>
  <div class="bg-white dark:bg-surface-800 rounded-2xl border border-gray-200 dark:border-surface-700 p-5">
    <h4 class="font-bold text-gray-900 dark:text-white mb-4">Bài viết liên quan</h4>
    <div class="space-y-3">
      <div
        v-for="p in posts.slice(0, 3)"
        :key="p.id"
        @click="router.push(`/posts/${p.id}`)"
        class="flex items-start gap-3 cursor-pointer group"
      >
        <img v-if="p.coverImage" :src="p.coverImage" class="w-16 h-12 rounded-lg object-cover shrink-0" />
        <div v-else class="w-16 h-12 rounded-lg shrink-0 flex items-center justify-center bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900/40 dark:to-primary-800/40">
          <svg class="w-5 h-5 text-primary-300 dark:text-primary-700/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <div>
          <p class="text-sm font-medium text-gray-700 dark:text-gray-300 line-clamp-2 group-hover:text-primary-500 transition-colors">
            {{ p.title }}
          </p>
          <p class="text-xs text-gray-400 mt-1">{{ formatDate(p.createdAt) }}</p>
        </div>
      </div>
    </div>
  </div>
</template>
