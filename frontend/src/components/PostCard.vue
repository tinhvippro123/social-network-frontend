<script setup lang="ts">
import { getCurrentInstance } from 'vue'
import {
  Eye, MessageCircle, Bookmark,
  BookmarkCheck, Clock, ChevronUp, MapPin
} from '@lucide/vue'
import type { Post } from '@/types'

import { useRouter } from 'vue-router'
import UserAvatar from '@/components/UserAvatar.vue'
import { formatRelativeTime, formatNumber } from '@/utils/formatters'
import postsApi from '@/api/posts.api'
import { useToast } from '@/composables/ui/useToast'

const router = useRouter()
const toast = useToast()
const instance = getCurrentInstance()

const props = defineProps<{
  post: Post
}>()

const emit = defineEmits<{
  (e: 'click', postId: string): void
  (e: 'bookmark', postId: string): void
  (e: 'toggleBookmark', postId: string): void
  (e: 'toggle-bookmark', postId: string): void
}>()

const handleClick = () => {
  emit('click', props.post.id)
  router.push(`/posts/${props.post.id}`)
}

const handleBookmark = async (e: Event) => {
  e.stopPropagation()
  const vnodeProps = instance?.vnode.props || {}
  const hasParentListener = Boolean(
    vnodeProps.onBookmark ||
    vnodeProps.onToggleBookmark ||
    vnodeProps['onToggle-bookmark']
  )

  if (hasParentListener) {
    emit('bookmark', props.post.id)
    emit('toggleBookmark', props.post.id)
    emit('toggle-bookmark', props.post.id)
    return
  }

  try {
    const res = await postsApi.toggleBookmark(props.post.id)
    const nextState = typeof res.data?.data === 'boolean' ? res.data.data : !props.post.bookmarked
    props.post.bookmarked = nextState
    toast.success(nextState ? 'Đã lưu bài viết' : 'Đã bỏ lưu bài viết')
  } catch (err: any) {
    toast.error(err.response?.data?.message || 'Vui lòng đăng nhập để lưu bài viết')
  }
}
</script>

<template>
  <article
    @click="handleClick"
    class="group h-full flex flex-col bg-white dark:bg-surface-800 rounded-2xl overflow-hidden border border-gray-200 dark:border-surface-700 hover:border-primary-500/30 dark:hover:border-primary-500/30 hover:shadow-xl hover:shadow-primary-500/5 transition-all duration-300 cursor-pointer"
  >
    <!-- Cover Image -->
    <div class="relative overflow-hidden h-48">
      <img
        v-if="post.coverImage"
        :src="post.coverImage"
        :alt="post.title"
        class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
      />
      <div v-else class="w-full h-full bg-linear-to-br from-primary-100 to-primary-200 dark:from-primary-900/40 dark:to-primary-800/40 transition-transform duration-500 group-hover:scale-105 flex items-center justify-center">
        <span class="text-primary-300 dark:text-primary-700/50 opacity-50">
          <svg class="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </span>
      </div>
      <div class="absolute inset-0 bg-linear-to-t from-black/60 via-black/20 to-transparent" />
      <!-- Category badge -->
      <span
        @click.stop="post.category?.slug && router.push('/?category=' + post.category.slug)"
        class="absolute top-3 left-3 px-3 py-1 rounded-lg text-xs font-semibold bg-white/90 dark:bg-surface-800/90 backdrop-blur-sm text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-surface-700 hover:text-primary-600 transition-colors cursor-pointer"
        title="Lọc theo danh mục này"
      >
        {{ post.category.icon }} {{ post.category.name }}
      </span>
      <!-- Location badge -->
      <span
        v-if="post.location?.address"
        @click.stop="router.push('/map?postId=' + post.id)"
        class="absolute bottom-3 left-3 max-w-[75%] truncate px-2.5 py-1 rounded-lg text-[11px] font-medium bg-black/60 text-white backdrop-blur-sm hover:bg-primary-600/90 transition-colors flex items-center gap-1 cursor-pointer"
        :title="`Xem trên bản đồ: ${post.location.address}`"
      >
        <MapPin :size="11" class="shrink-0" />
        <span class="truncate">{{ post.location.address }}</span>
      </span>
      <!-- Bookmark -->
      <button
        @click.stop="handleBookmark"
        class="absolute top-3 right-3 p-2 rounded-lg bg-white/90 dark:bg-surface-800/90 backdrop-blur-sm text-gray-600 dark:text-gray-400 hover:text-primary-500 transition-colors cursor-pointer"
      >
        <BookmarkCheck v-if="post.bookmarked" :size="16" class="text-primary-500" />
        <Bookmark v-else :size="16" />
      </button>
    </div>

    <!-- Content -->
    <div class="p-5 flex-1 flex flex-col">
      <!-- Author -->
      <div class="flex items-center gap-2 mb-3">
        <div
          class="flex items-center gap-2 hover:text-primary-500 transition-colors"
          @click.stop="post.author?.id && router.push('/profile/' + post.author.id)"
        >
          <UserAvatar :user="post.author" size="sm" />
          <span class="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-primary-500 transition-colors">{{ post.author.name }}</span>
        </div>
        <span class="text-gray-300 dark:text-surface-600">·</span>
        <span class="text-xs text-gray-400 flex items-center gap-1">
          <Clock :size="12" />
          {{ formatRelativeTime(post.createdAt) }}
        </span>
      </div>

      <!-- Title -->
      <h2 class="text-lg font-bold text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-primary-500 transition-colors">
        {{ post.title }}
      </h2>

      <!-- Excerpt -->
      <p class="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-4 flex-1 wrap-break-word">
        {{ post.excerpt }}
      </p>

      <!-- Tags -->
      <div v-if="post.tags && post.tags.length > 0" class="flex flex-wrap gap-1.5 mb-4">
        <span
          v-for="tag in post.tags.slice(0, 3)"
          :key="tag"
          @click.stop="router.push('/tags/' + tag)"
          class="px-2 py-0.5 rounded-md text-xs font-medium bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 hover:bg-primary-100 dark:hover:bg-primary-900/40 transition-colors cursor-pointer"
        >
          #{{ tag }}
        </span>
      </div>

      <!-- Stats -->
      <div class="flex items-center gap-4 text-gray-400 text-sm">
        <span class="flex items-center gap-1 font-semibold text-orange-500" title="Điểm bình chọn">
          <ChevronUp :size="15" class="stroke-[2.5]" />
          {{ formatNumber((post.upvotesCount || 0) - (post.downvotesCount || 0)) }}
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
