<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { Clock, Eye, ArrowUp, MessageCircle } from '@lucide/vue'
import { formatDate, formatNumber } from '@/utils/formatters'
import type { Post } from '@/types'

const props = defineProps<{
  post: Post
  isDraft?: boolean
}>()

const router = useRouter()
const imageFailed = ref(false)

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
    <!-- Cover Image with Fallback -->
    <div
      v-if="post.coverImage && !imageFailed"
      :class="[
        'w-24 h-20 sm:w-32 sm:h-24 rounded-xl overflow-hidden shrink-0 bg-gray-100 dark:bg-surface-700',
        isDraft ? 'opacity-60' : ''
      ]"
    >
      <img
        :src="post.coverImage"
        :alt="post.title"
        @error="imageFailed = true"
        :class="[
          'w-full h-full object-cover',
          isDraft ? '' : 'transition-transform duration-300 group-hover:scale-105'
        ]"
      />
    </div>
    <div
      v-else
      :class="[
        'w-24 h-20 sm:w-32 sm:h-24 rounded-xl shrink-0 flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100/60 dark:from-primary-950/40 dark:to-primary-900/30 border border-primary-200/50 dark:border-primary-800/40',
        isDraft ? 'opacity-60' : 'transition-transform duration-300 group-hover:scale-105'
      ]"
    >
      <span class="text-primary-400 dark:text-primary-500/80">
        <svg class="w-7 h-7 sm:w-8 sm:h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </span>
    </div>

    <div class="flex-1 min-w-0">
      <div v-if="isDraft" class="flex items-center gap-2 mb-2">
        <span class="px-2 py-0.5 text-xs font-medium bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 rounded-full">Nháp</span>
        <span class="text-xs text-gray-400">Lần cuối chỉnh sửa: {{ formatDate(post.createdAt) }}</span>
      </div>

      <h3 :class="[
        'font-bold text-gray-900 dark:text-white line-clamp-2 mb-2 break-words',
        !isDraft && 'group-hover:text-primary-500 transition-colors'
      ]">
        {{ post.title }}
      </h3>
      <p class="text-sm text-gray-500 dark:text-gray-400 line-clamp-1 mb-3 break-words">
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
