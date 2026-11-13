<script setup lang="ts">
import { ref, computed, watch, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import {
  X, ExternalLink, Eye, EyeOff, CheckCircle2, Trash2,
  Clock, ThumbsUp, MessageSquare, AlertTriangle, Tag, Folder
} from '@lucide/vue'
import UserAvatar from '@/components/UserAvatar.vue'
import Skeleton from '@/components/ui/Skeleton.vue'
import postsApi from '@/api/posts.api'
import { formatDate, formatNumber } from '@/utils/formatters'

const props = defineProps<{
  isOpen: boolean
  post: any | null
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'toggle-status', post: any): void
  (e: 'delete', post: any): void
}>()

const router = useRouter()

const detailedPost = ref<any | null>(null)
const isLoadingContent = ref(false)
const sanitizedContent = computed(() => {
  const raw = detailedPost.value?.content || ''
  return raw
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<(iframe|object|embed|form)\b[^>]*>[\s\S]*?<\/\1>/gi, '')
    .replace(/\son\w+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, '')
    .replace(/(href|src)\s*=\s*["']\s*javascript:[^"']*["']/gi, '$1="#"')
})

async function fetchFullPost(postId: string) {
  if (!postId) return
  isLoadingContent.value = true
  try {
    const res = await postsApi.getById(postId, { trackView: false })
    if (res.data?.success && res.data.data) {
      const data = res.data.data
      detailedPost.value = {
        ...detailedPost.value,
        ...data,
        author: data.author || detailedPost.value?.author,
        category: data.category || detailedPost.value?.category,
        tags: data.tags || detailedPost.value?.tags || []
      }
    }
  } catch (err) {
    console.warn('Không thể tải chi tiết đầy đủ của bài viết:', err)
  } finally {
    isLoadingContent.value = false
  }
}

watch(() => [props.isOpen, props.post?.id], ([open, id]) => {
  if (open && props.post) {
    detailedPost.value = { ...props.post }
    if (!props.post.content && id) {
      fetchFullPost(id as string)
    } else {
      isLoadingContent.value = false
    }
  } else {
    detailedPost.value = null
    isLoadingContent.value = false
  }
}, { immediate: true })

watch(() => props.post?.status, (newStatus) => {
  if (detailedPost.value && newStatus) {
    detailedPost.value = { ...detailedPost.value, status: newStatus }
  }
})

function openInNewTab(path: string) {
  window.open(router.resolve(path).href, '_blank', 'noopener')
}

function onKeydown(e: KeyboardEvent) {
  if (!props.isOpen) return
  if (e.key === 'Escape') emit('close')
}

watch(() => props.isOpen, (open) => {
  if (open) {
    window.addEventListener('keydown', onKeydown)
    document.body.style.overflow = 'hidden'
  } else {
    window.removeEventListener('keydown', onKeydown)
    document.body.style.overflow = ''
  }
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKeydown)
  document.body.style.overflow = ''
})
</script>

<template>
  <Teleport to="body">
    <Transition name="modal-fade">
      <div
        v-if="isOpen && detailedPost"
        class="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
        @click.self="emit('close')"
      >
        <div
          role="dialog"
          aria-modal="true"
          class="modal-panel w-full max-w-3xl max-h-[90vh] flex flex-col rounded-2xl bg-white dark:bg-surface-800 border border-gray-200 dark:border-surface-700 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        >
          <!-- Header -->
          <div class="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-surface-700 bg-gray-50/50 dark:bg-surface-800/80 shrink-0">
            <div class="flex items-center gap-2 flex-wrap">
              <span class="text-xs font-semibold px-2.5 py-1 rounded-lg bg-primary-50 dark:bg-primary-950/40 text-primary-600 dark:text-primary-400 border border-primary-200 dark:border-primary-800 flex items-center gap-1.5">
                <Folder :size="12" />
                {{ detailedPost.category?.name || detailedPost.categoryName || 'Chung' }}
              </span>
              <span :class="[
                'text-xs font-semibold px-2.5 py-1 rounded-lg',
                (detailedPost.status || '').toLowerCase() === 'published'
                  ? 'bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400'
                  : (detailedPost.status || '').toLowerCase() === 'draft'
                  ? 'bg-gray-100 dark:bg-surface-700 text-gray-500'
                  : 'bg-red-100 dark:bg-red-900/20 text-red-500'
              ]">
                {{ (detailedPost.status || '').toLowerCase() === 'published' ? 'Đã đăng' : (detailedPost.status || '').toLowerCase() === 'draft' ? 'Bản nháp' : 'Đã ẩn' }}
              </span>
              <span
                v-if="detailedPost.reportsCount > 0"
                class="text-xs font-semibold px-2.5 py-1 rounded-lg bg-rose-100 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800 flex items-center gap-1"
              >
                <AlertTriangle :size="12" />
                {{ detailedPost.reportsCount }} báo cáo
              </span>
            </div>
            <button
              type="button"
              @click="emit('close')"
              class="p-1.5 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-surface-700 dark:hover:text-gray-200 transition-colors cursor-pointer"
              title="Đóng (Esc)"
            >
              <X :size="20" />
            </button>
          </div>

          <!-- Body (Scrollable) -->
          <div class="flex-1 overflow-y-auto p-6 space-y-6">
            <!-- Title -->
            <div>
              <h2 class="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white leading-snug">
                {{ detailedPost.title }}
              </h2>
            </div>

            <!-- Author & Meta Bar -->
            <div class="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-surface-700 flex-wrap gap-3">
              <div class="flex items-center gap-3">
                <UserAvatar :user="detailedPost.author || { name: detailedPost.authorName, avatar: detailedPost.authorAvatar }" size="md" />
                <div>
                  <button
                    type="button"
                    @click="openInNewTab(`/profile/${detailedPost.author?.id || detailedPost.authorId}`)"
                    class="font-semibold text-sm text-gray-900 dark:text-white hover:text-primary-500 flex items-center gap-1 text-left cursor-pointer transition-colors"
                  >
                    {{ detailedPost.author?.name || detailedPost.authorName || 'Ẩn danh' }}
                    <ExternalLink :size="12" class="opacity-60" />
                  </button>
                  <p class="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                    <Clock :size="12" /> Đăng ngày {{ formatDate(detailedPost.createdAt) }}
                  </p>
                </div>
              </div>

              <!-- Quick stats chips -->
              <div class="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-surface-700/50 px-3 py-1.5 rounded-xl">
                <span class="flex items-center gap-1" title="Lượt xem"><Eye :size="14" /> {{ formatNumber(detailedPost.viewsCount || 0) }}</span>
                <span class="flex items-center gap-1" title="Lượt thích"><ThumbsUp :size="14" /> {{ formatNumber(detailedPost.upvotesCount || 0) }}</span>
                <span class="flex items-center gap-1" title="Bình luận"><MessageSquare :size="14" /> {{ formatNumber(detailedPost.commentsCount || 0) }}</span>
              </div>
            </div>

            <!-- Cover Image (if present) -->
            <div v-if="detailedPost.coverImage" class="rounded-xl overflow-hidden bg-gray-100 dark:bg-surface-700 max-h-72">
              <img
                :src="detailedPost.coverImage"
                :alt="detailedPost.title"
                class="w-full h-full object-cover max-h-72"
                @error="($event.target as HTMLImageElement).style.display = 'none'"
              />
            </div>

            <!-- Main Content (Straight to article body) -->
            <div>
              <div v-if="isLoadingContent" class="space-y-3 p-4 bg-gray-50/50 dark:bg-surface-900/30 rounded-xl border border-gray-100 dark:border-surface-700/50">
                <Skeleton class="h-4 w-full rounded" />
                <Skeleton class="h-4 w-5/6 rounded" />
                <Skeleton class="h-4 w-3/4 rounded" />
                <Skeleton class="h-4 w-4/5 rounded" />
              </div>
              <div
                v-else-if="detailedPost.content"
                class="prose dark:prose-invert max-w-none text-gray-700 dark:text-gray-300 text-sm leading-relaxed p-4 rounded-xl bg-gray-50/50 dark:bg-surface-900/30 border border-gray-100 dark:border-surface-700/50"
                v-html="sanitizedContent"
              />
              <div
                v-else-if="detailedPost.excerpt"
                class="prose dark:prose-invert max-w-none text-gray-700 dark:text-gray-300 text-sm leading-relaxed p-4 rounded-xl bg-gray-50/50 dark:bg-surface-900/30 border border-gray-100 dark:border-surface-700/50"
              >
                {{ detailedPost.excerpt }}
              </div>
              <div
                v-else
                class="text-sm text-gray-400 italic p-4 rounded-xl bg-gray-50/50 dark:bg-surface-900/30 border border-gray-100 dark:border-surface-700/50"
              >
                Bài viết chưa có nội dung văn bản.
              </div>
            </div>

            <!-- Tags -->
            <div v-if="detailedPost.tags && detailedPost.tags.length" class="flex items-center gap-2 flex-wrap pt-2">
              <span
                v-for="tag in detailedPost.tags"
                :key="typeof tag === 'string' ? tag : tag.name"
                class="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg bg-gray-100 dark:bg-surface-700 text-gray-600 dark:text-gray-400 font-medium"
              >
                <Tag :size="10" /> #{{ typeof tag === 'string' ? tag : tag.name }}
              </span>
            </div>
          </div>

          <!-- Footer Actions -->
          <div class="flex items-center justify-between px-6 py-4 border-t border-gray-200 dark:border-surface-700 bg-gray-50/50 dark:bg-surface-800/80 gap-3 shrink-0">
            <button
              type="button"
              @click="openInNewTab(`/posts/${detailedPost.id}`)"
              class="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-950/40 hover:bg-primary-100 dark:hover:bg-primary-900/40 border border-primary-200 dark:border-primary-800 transition-colors cursor-pointer"
            >
              <ExternalLink :size="14" />
              Xem trên web
            </button>

            <div class="flex items-center gap-2">
              <button
                v-if="(detailedPost.status || '').toLowerCase() !== 'draft'"
                type="button"
                @click="emit('toggle-status', detailedPost)"
                :class="[
                  'inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl transition-colors cursor-pointer',
                  (detailedPost.status || '').toLowerCase() === 'hidden'
                    ? 'bg-green-600 hover:bg-green-700 text-white'
                    : 'bg-amber-100 hover:bg-amber-200 dark:bg-amber-900/30 dark:hover:bg-amber-900/50 text-amber-700 dark:text-amber-300'
                ]"
              >
                <CheckCircle2 v-if="(detailedPost.status || '').toLowerCase() === 'hidden'" :size="14" />
                <EyeOff v-else :size="14" />
                {{ (detailedPost.status || '').toLowerCase() === 'hidden' ? 'Hiện bài viết' : 'Ẩn bài viết' }}
              </button>

              <button
                type="button"
                @click="emit('delete', detailedPost)"
                class="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40 text-red-600 dark:text-red-400 transition-colors cursor-pointer"
              >
                <Trash2 :size="14" />
                Xóa bài
              </button>

              <button
                type="button"
                @click="emit('close')"
                class="px-4 py-2 text-xs font-medium rounded-xl text-gray-700 dark:text-gray-300 bg-gray-200 hover:bg-gray-300 dark:bg-surface-700 dark:hover:bg-surface-600 transition-colors cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.15s ease;
}
.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}
</style>
