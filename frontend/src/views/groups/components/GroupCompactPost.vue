<script setup lang="ts">
import { useRouter } from 'vue-router'
import { Eye, ArrowUp, MessageCircle } from '@lucide/vue'
import UserAvatar from '@/components/UserAvatar.vue'
import type { Post } from '@/types'

defineProps<{
  post: Post
}>()

const router = useRouter()
</script>

<template>
  <article @click="router.push(`/posts/${post.id}`)"
    class="flex gap-4 bg-white dark:bg-surface-800 rounded-2xl border border-gray-200 dark:border-surface-700 p-4 hover:border-primary-500/30 transition-all cursor-pointer group">
    <img :src="post.coverImage" class="hidden sm:block w-28 h-20 rounded-xl object-cover shrink-0" />
    <div class="flex-1">
      <h3 class="font-bold text-gray-900 dark:text-white group-hover:text-primary-500 transition-colors line-clamp-2 mb-1">{{ post.title }}</h3>
      <p class="text-sm text-gray-400 line-clamp-1">{{ post.excerpt }}</p>
      <div class="flex items-center gap-3 mt-2 text-xs text-gray-400">
        <UserAvatar :user="post.author" size="sm" />
        <span>{{ post.author.name }}</span>
        <span class="flex items-center gap-1"><Eye :size="12" /> {{ post.viewsCount }}</span>
        <span class="flex items-center gap-1"><ArrowUp :size="12" /> {{ post.upvotesCount ?? 0 }}</span>
        <span class="flex items-center gap-1"><MessageCircle :size="12" /> {{ post.commentsCount }}</span>
      </div>
    </div>
  </article>
</template>
