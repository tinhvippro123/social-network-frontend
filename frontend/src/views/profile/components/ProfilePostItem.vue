<script setup lang="ts">
import { useRouter } from 'vue-router'
import { Clock, Eye, ArrowUp, MessageCircle } from '@lucide/vue'
import { formatDate, formatNumber } from '@/utils/formatters'
import type { Post } from '@/types'

const props = defineProps<{
  post: Post
  isDraft?: boolean
}>()

const router = useRouter()

const handleClick = () => {
  if (props.isDraft) {
    router.push(`/posts/${props.post.id}/edit`)
  } else {
    router.push(`/posts/${props.post.id}`)
  }
}
</script>

<template>
  <article
    @click="handleClick"
    :class="[
      'flex gap-4 bg-white dark:bg-surface-800 rounded-2xl border border-gray-200 dark:border-surface-700 p-4 sm:p-5 transition-all duration-300 cursor-pointer group',
      isDraft ? 'hover:border-yellow-500/30 hover:shadow-lg' : 'hover:border-primary-500/30 hover:shadow-lg hover:shadow-primary-500/5'
    ]"
  >
    <img
      :src="post.coverImage"
      :class="[
        'hidden sm:block w-32 h-24 rounded-xl object-cover shrink-0',
        isDraft ? 'opacity-60' : 'transition-transform duration-300 group-hover:scale-105'
      ]"
    />
    <div class="flex-1 min-w-0">
      <div v-if="isDraft" class="flex items-center gap-2 mb-2">
        <span class="px-2 py-0.5 text-xs font-medium bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 rounded-full">Nháp</span>
        <span class="text-xs text-gray-400">Lần cuối chỉnh sửa: {{ formatDate(post.createdAt) }}</span>
      </div>

      <h3 :class="[
        'font-bold text-gray-900 dark:text-white line-clamp-2 mb-2',
        !isDraft && 'group-hover:text-primary-500 transition-colors'
      ]">
        {{ post.title }}
      </h3>
      <p class="text-sm text-gray-500 dark:text-gray-400 line-clamp-1 mb-3">
        {{ post.excerpt }}
      </p>

      <div v-if="isDraft" class="flex items-center gap-2">
        <button @click.stop="router.push(`/posts/${post.id}/edit`)" class="px-3 py-1.5 text-xs font-medium text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-colors">
          ✏️ Tiếp tục viết
        </button>
        <button @click.stop class="px-3 py-1.5 text-xs font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
          🗑️ Xóa nháp
        </button>
      </div>
      <div v-else class="flex items-center gap-4 text-xs text-gray-400">
        <span class="flex items-center gap-1"><Clock :size="12" /> {{ formatDate(post.createdAt) }}</span>
        <span class="flex items-center gap-1"><Eye :size="12" /> {{ formatNumber(post.viewsCount || 0) }}</span>
        <span class="flex items-center gap-1"><ArrowUp :size="12" /> {{ post.upvotesCount || 0 }}</span>
        <span class="flex items-center gap-1"><MessageCircle :size="12" /> {{ post.commentsCount || 0 }}</span>
      </div>
    </div>
  </article>
</template>
