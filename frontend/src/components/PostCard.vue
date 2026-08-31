<script setup lang="ts">
import {
  Eye, MessageCircle, ArrowUp, Bookmark,
  BookmarkCheck, Clock
} from '@lucide/vue'
import type { Post } from '@/types'

const props = defineProps<{
  post: Post
}>()

const emit = defineEmits<{
  (e: 'click', postId: string): void
  (e: 'bookmark', postId: string): void
}>()

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr)
  const now = new Date()
  const diffHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
  if (diffHours < 1) return 'Vừa xong'
  if (diffHours < 24) return `${diffHours} giờ trước`
  const diffDays = Math.floor(diffHours / 24)
  if (diffDays < 7) return `${diffDays} ngày trước`
  return date.toLocaleDateString('vi-VN')
}

const formatNumber = (num: number) => {
  if (num >= 1000) return `${(num / 1000).toFixed(1)}k`
  return num.toString()
}
</script>

<template>
  <article
    @click="emit('click', post.id)"
    class="group bg-white dark:bg-surface-800 rounded-2xl overflow-hidden border border-gray-200 dark:border-surface-700 hover:border-primary-500/30 dark:hover:border-primary-500/30 hover:shadow-xl hover:shadow-primary-500/5 transition-all duration-300 cursor-pointer"
  >
    <!-- Cover Image -->
    <div class="relative overflow-hidden h-48">
      <img
        :src="post.coverImage"
        :alt="post.title"
        class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
      />
      <div class="absolute inset-0 bg-linear-to-t from-black/50 to-transparent" />
      <!-- Category badge -->
      <span class="absolute top-3 left-3 px-3 py-1 rounded-lg text-xs font-semibold bg-white/90 dark:bg-surface-800/90 backdrop-blur-sm text-gray-700 dark:text-gray-300">
        {{ post.category.icon }} {{ post.category.name }}
      </span>
      <!-- Bookmark -->
      <button
        @click.stop="emit('bookmark', post.id)"
        class="absolute top-3 right-3 p-2 rounded-lg bg-white/90 dark:bg-surface-800/90 backdrop-blur-sm text-gray-600 dark:text-gray-400 hover:text-primary-500 transition-colors"
      >
        <BookmarkCheck v-if="post.bookmarked" :size="16" class="text-primary-500" />
        <Bookmark v-else :size="16" />
      </button>
    </div>

    <!-- Content -->
    <div class="p-5">
      <!-- Author -->
      <div class="flex items-center gap-2 mb-3">
        <img :src="post.author.avatar" class="w-7 h-7 rounded-full" />
        <span class="text-sm font-medium text-gray-700 dark:text-gray-300">{{ post.author.name }}</span>
        <span class="text-gray-300 dark:text-surface-600">·</span>
        <span class="text-xs text-gray-400 flex items-center gap-1">
          <Clock :size="12" />
          {{ formatDate(post.createdAt) }}
        </span>
      </div>

      <!-- Title -->
      <h2 class="text-lg font-bold text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-primary-500 transition-colors">
        {{ post.title }}
      </h2>

      <!-- Excerpt -->
      <p class="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-4">
        {{ post.excerpt }}
      </p>

      <!-- Tags -->
      <div class="flex flex-wrap gap-1.5 mb-4">
        <span
          v-for="tag in post.tags.slice(0, 3)"
          :key="tag"
          class="px-2 py-0.5 rounded-md text-xs font-medium bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400"
        >
          #{{ tag }}
        </span>
      </div>

      <!-- Stats -->
      <div class="flex items-center gap-4 text-gray-400 text-sm">
        <span class="flex items-center gap-1">
          <ArrowUp :size="14" :class="post.upvoted ? 'text-primary-500' : ''" />
          {{ formatNumber(post.upvotesCount) }}
        </span>
        <span class="flex items-center gap-1">
          <MessageCircle :size="14" />
          {{ post.commentsCount }}
        </span>
        <span class="flex items-center gap-1">
          <Eye :size="14" />
          {{ formatNumber(post.viewsCount) }}
        </span>
      </div>
    </div>
  </article>
</template>
