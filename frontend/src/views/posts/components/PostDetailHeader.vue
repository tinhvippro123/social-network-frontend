<script setup lang="ts">
import { Clock, Eye, MapPin, Edit3, Trash2, ZoomIn, Calendar } from '@lucide/vue'
import UserAvatar from '@/components/UserAvatar.vue'
import { formatDate, formatNumber } from '@/utils/formatters'
import { useRouter } from 'vue-router'
import { useToast } from '@/composables/ui/useToast'
import { useConfirm } from '@/composables/ui/useConfirm'
import postsApi from '@/api/posts.api'

const props = defineProps<{
  post: any
  user: any
}>()

const emit = defineEmits<{
  (e: 'open-lightbox', index: number): void
}>()

const router = useRouter()
const { success, error } = useToast()
const { confirm } = useConfirm()

const formatEventTimeRange = (start?: string, end?: string) => {
  if (!start) return ''
  const s = new Date(start)
  const e = end ? new Date(end) : null
  const dateStr = s.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
  const startTime = s.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
  const endTime = e ? e.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : ''
  return `${dateStr} · ${startTime}${endTime ? ' - ' + endTime : ''}`
}

const handleDeletePost = async () => {
  const ok = await confirm({
    title: 'Xóa bài viết',
    message: 'Bạn có chắc chắn muốn xóa bài viết này không? Hành động này không thể hoàn tác.',
    confirmText: 'Xóa bài viết',
    variant: 'danger'
  })
  if (!ok) return
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
    <div
      class="relative rounded-2xl overflow-hidden mb-6 h-64 sm:h-80 group cursor-pointer"
      @click="post.coverImage ? emit('open-lightbox', 0) : null"
    >
      <img
        v-if="post.coverImage"
        :src="post.coverImage"
        :alt="post.title"
        class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-102"
      />
      <div v-else class="w-full h-full bg-linear-to-br from-primary-100 to-primary-300 dark:from-primary-900/50 dark:to-primary-800/50 flex items-center justify-center">
        <span class="text-primary-300 dark:text-primary-700/50 opacity-40">
          <svg class="w-24 h-24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </span>
      </div>
      <!-- Category & Status Badges -->
      <div class="absolute top-4 left-4 flex items-center gap-2">
        <span
          @click.stop="post.category?.slug && router.push(`/?category=${post.category.slug}`)"
          class="px-3 py-1.5 rounded-xl text-xs font-semibold bg-white/90 dark:bg-surface-800/90 backdrop-blur-sm text-gray-700 dark:text-gray-300 shadow-sm hover:bg-white dark:hover:bg-surface-700 transition-colors cursor-pointer"
        >
          {{ post.category?.icon }} {{ post.category?.name }}
        </span>
        <span
          v-if="(post.status || '').toLowerCase() === 'draft'"
          class="px-3 py-1.5 rounded-xl text-xs font-semibold bg-amber-500/90 text-white backdrop-blur-sm shadow-sm"
        >
          📝 Bản nháp
        </span>
        <span
          v-else-if="(post.status || '').toLowerCase() === 'hidden'"
          class="px-3 py-1.5 rounded-xl text-xs font-semibold bg-red-500/90 text-white backdrop-blur-sm shadow-sm"
        >
          🔒 Đã ẩn
        </span>
      </div>

      <!-- Expand button badge on hover -->
      <div
        v-if="post.coverImage"
        class="absolute bottom-4 right-4 px-3 py-1.5 rounded-xl bg-black/60 hover:bg-black/80 backdrop-blur-md text-white text-xs font-medium flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-lg"
      >
        <ZoomIn :size="14" />
        <span>Phóng to ảnh bìa</span>
      </div>
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
            <span
              v-if="post.eventStartTime"
              class="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-medium"
            >
              <Calendar :size="12" /> {{ formatEventTimeRange(post.eventStartTime, post.eventEndTime) }}
            </span>
            <span
              v-if="post.location"
              @click="router.push(`/map?postId=${post.id}`)"
              class="flex items-center gap-1 text-red-500 hover:text-red-600 hover:underline cursor-pointer"
              title="Xem vị trí trên bản đồ"
            >
              <MapPin :size="12" /> {{ post.location.address }}
            </span>
          </div>
        </div>
      </div>
      <!-- Actions (for own posts or admin/moderator) -->
      <div v-if="user && (user.id === post.author?.id || ['admin', 'moderator'].includes((user.role || '').toLowerCase()))" class="flex items-center gap-2">
        <button
          v-if="user.id === post.author?.id && (post.status || '').toLowerCase() !== 'hidden'"
          @click="router.push(`/posts/${post.id}/edit`)"
          class="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-500/10 border border-gray-200 dark:border-surface-700 transition-all cursor-pointer"
        >
          <Edit3 :size="14" />
          <span class="hidden sm:inline">Chỉnh sửa</span>
        </button>
        <button
          @click="handleDeletePost"
          class="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 border border-red-200 dark:border-red-900/30 transition-all cursor-pointer"
        >
          <Trash2 :size="14" />
          <span class="hidden sm:inline">Xóa</span>
        </button>
      </div>
    </div>
  </div>
</template>
