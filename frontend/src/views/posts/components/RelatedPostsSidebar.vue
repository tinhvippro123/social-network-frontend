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
        <img :src="p.coverImage" class="w-16 h-12 rounded-lg object-cover shrink-0" />
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
