<script setup lang="ts">
import { Clock, Eye, MapPin, Edit3, Trash2 } from '@lucide/vue'
import UserAvatar from '@/components/UserAvatar.vue'
import { formatDate, formatNumber } from '@/utils/formatters'
import { useRouter } from 'vue-router'
import { useToast } from '@/composables/ui/useToast'
import postsApi from '@/api/posts.api'

const props = defineProps<{
  post: any
  user: any
}>()

const router = useRouter()
const { success, error } = useToast()

const handleDeletePost = async () => {
  if (!confirm('Bạn có chắc chắn muốn xóa bài viết này không? Hành động này không thể hoàn tác.')) return
  try {
    await postsApi.delete(props.post.id)
    success('Đã xóa bài viết thành công!')
    router.push('/')
  } catch (err: any) {
    error(err.response?.data?.message || 'Không thể xóa bài viết. Vui lòng thử lại.')
  }
}
</script>

<template>
  <div>
    <!-- Cover Image -->
    <div class="relative rounded-2xl overflow-hidden mb-6 h-64 sm:h-80">
      <img v-if="post.coverImage" :src="post.coverImage" :alt="post.title" class="w-full h-full object-cover" />
      <div v-else class="w-full h-full bg-gradient-to-br from-primary-100 to-primary-300 dark:from-primary-900/50 dark:to-primary-800/50 flex items-center justify-center">
        <span class="text-primary-300 dark:text-primary-700/50 opacity-40">
          <svg class="w-24 h-24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </span>
      </div>
      <!-- Category Badge -->
      <span class="absolute top-4 left-4 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white/90 dark:bg-surface-800/90 backdrop-blur-sm text-gray-700 dark:text-gray-300 shadow-sm">
        {{ post.category?.icon }} {{ post.category?.name }}
      </span>
    </div>

    <!-- Title -->
    <h1 class="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-gray-900 dark:text-white leading-tight mb-4">
      {{ post.title }}
    </h1>

    <!-- Author Info -->
    <div class="flex items-center justify-between mb-6 bg-white dark:bg-surface-800 rounded-2xl border border-gray-200 dark:border-surface-700 p-4">
      <div class="flex items-center gap-3">
        <UserAvatar :user="post.author" size="lg" class="ring-2 ring-primary-500/30 cursor-pointer" @click="router.push(`/profile/${post.author.id}`)" />
        <div>
          <p class="font-semibold text-gray-900 dark:text-white cursor-pointer hover:text-primary-500 transition-colors" @click="router.push(`/profile/${post.author.id}`)">{{ post.author.name }}</p>
          <div class="flex flex-wrap items-center gap-3 text-xs text-gray-400 mt-1">
            <span class="flex items-center gap-1"><Clock :size="12" /> {{ formatDate(post.createdAt) }}</span>
            <span class="flex items-center gap-1"><Eye :size="12" /> {{ formatNumber(post.viewsCount) }} lượt xem</span>
            <span v-if="post.location" class="flex items-center gap-1"><MapPin :size="12" /> {{ post.location.address }}</span>
          </div>
        </div>
      </div>
      <!-- Actions (only for own posts) -->
      <div v-if="user && user.id === post.author?.id" class="flex items-center gap-2">
        <button
          @click="router.push(`/posts/${post.id}/edit`)"
          class="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-500/10 border border-gray-200 dark:border-surface-700 transition-all"
        >
          <Edit3 :size="14" />
          <span class="hidden sm:inline">Chỉnh sửa</span>
        </button>
        <button
          @click="handleDeletePost"
          class="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 border border-red-200 dark:border-red-900/30 transition-all"
        >
          <Trash2 :size="14" />
          <span class="hidden sm:inline">Xóa</span>
        </button>
      </div>
    </div>
  </div>
</template>
