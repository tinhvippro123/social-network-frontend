<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { Heart, MessageSquare, Send, Trash2, Share2, Check, Loader2 } from '@lucide/vue'
import UserAvatar from '@/components/UserAvatar.vue'
import { formatRelativeTime } from '@/utils/formatters'
import { useAuthStore } from '@/stores/auth.store'
import { useToast } from '@/composables/ui/useToast'
import groupsApi from '@/api/groups.api'
import type { GroupPostItem, GroupCommentItem } from '@/api/groups.api'

const props = defineProps<{
  groupId: string
  post: GroupPostItem
}>()

const emit = defineEmits<{
  (e: 'update:post', updated: Partial<GroupPostItem>): void
}>()

const authStore = useAuthStore()
const toast = useToast()

const isLiked = ref(props.post.isLiked ?? false)
const likesCount = ref(props.post.likesCount ?? 0)
const comments = ref<GroupCommentItem[]>([])
const isLoadingComments = ref(false)
const newComment = ref('')
const isSubmitting = ref(false)
const isLiking = ref(false)
const copied = ref(false)

watch(
  () => props.post.id,
  () => {
    isLiked.value = props.post.isLiked ?? false
    likesCount.value = props.post.likesCount ?? 0
    fetchComments()
  }
)

const fetchComments = async () => {
  if (!props.groupId || !props.post?.id) return
  isLoadingComments.value = true
  try {
    const res = await groupsApi.getPostComments(props.groupId, props.post.id)
    if (res.data?.data) {
      comments.value = res.data.data
    }
  } catch (err) {
    console.error('Failed to load group post comments:', err)
  } finally {
    isLoadingComments.value = false
  }
}

const toggleLike = async () => {
  if (!authStore.isLoggedIn) {
    toast.info('Vui lòng đăng nhập để thích bài viết')
    return
  }
  if (isLiking.value) return
  isLiking.value = true

  // Optimistic update
  const previousIsLiked = isLiked.value
  const previousLikesCount = likesCount.value
  isLiked.value = !previousIsLiked
  likesCount.value = previousIsLiked ? Math.max(0, previousLikesCount - 1) : previousLikesCount + 1

  try {
    const res = await groupsApi.toggleLikePost(props.groupId, props.post.id)
    if (res.data?.data) {
      isLiked.value = res.data.data.isLiked
      likesCount.value = res.data.data.likesCount
      emit('update:post', { isLiked: isLiked.value, likesCount: likesCount.value })
    }
  } catch (err: any) {
    // Rollback
    isLiked.value = previousIsLiked
    likesCount.value = previousLikesCount
    toast.error('Không thể thực hiện thao tác thích bài viết')
  } finally {
    isLiking.value = false
  }
}

const submitComment = async () => {
  const content = newComment.value.trim()
  if (!content) return
  if (!authStore.isLoggedIn) {
    toast.info('Vui lòng đăng nhập để bình luận')
    return
  }

  isSubmitting.value = true
  try {
    const res = await groupsApi.addPostComment(props.groupId, props.post.id, content)
    if (res.data?.data) {
      comments.value.push(res.data.data)
      newComment.value = ''
      toast.success('Đã gửi bình luận thành công')
      emit('update:post', { commentsCount: comments.value.length })
    }
  } catch (err: any) {
    toast.error(err.response?.data?.message || 'Không thể gửi bình luận')
  } finally {
    isSubmitting.value = false
  }
}

const deleteComment = async (commentId: string) => {
  if (!confirm('Bạn có chắc chắn muốn xóa bình luận này?')) return
  try {
    await groupsApi.deletePostComment(props.groupId, props.post.id, commentId)
    comments.value = comments.value.filter(c => c.id !== commentId)
    toast.success('Đã xóa bình luận')
    emit('update:post', { commentsCount: comments.value.length })
  } catch (err: any) {
    toast.error('Không thể xóa bình luận')
  }
}

const copyLink = async () => {
  const url = `${window.location.origin}/groups/${props.groupId}/posts/${props.post.id}`
  try {
    await navigator.clipboard.writeText(url)
    copied.value = true
    toast.success('Đã sao chép liên kết bài viết')
    setTimeout(() => {
      copied.value = false
    }, 2000)
  } catch {
    toast.error('Không thể sao chép liên kết')
  }
}

onMounted(() => {
  fetchComments()
})
</script>

<template>
  <div class="mt-6 pt-5 border-t border-gray-100 dark:border-surface-700/60 space-y-6">
    <!-- Interaction Action Bar -->
    <div class="flex items-center justify-between gap-3 flex-wrap">
      <div class="flex items-center gap-2">
        <!-- Like / Heart Button -->
        <button
          @click="toggleLike"
          :class="[
            'inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer border',
            isLiked
              ? 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900/60 shadow-xs'
              : 'text-gray-600 dark:text-gray-300 hover:text-rose-500 hover:bg-gray-50 dark:hover:bg-surface-700 border-gray-200 dark:border-surface-600'
          ]"
        >
          <Heart
            :size="18"
            :class="[
              'transition-transform duration-200',
              isLiked ? 'fill-rose-500 scale-110' : 'group-hover:scale-110'
            ]"
          />
          <span>{{ likesCount > 0 ? likesCount : 'Thích' }}</span>
        </button>

        <!-- Comments Counter Badge -->
        <div class="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-surface-700/50 border border-gray-100 dark:border-surface-700">
          <MessageSquare :size="16" />
          <span>{{ comments.length }} bình luận</span>
        </div>
      </div>

      <!-- Share Button -->
      <button
        @click="copyLink"
        class="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-gray-100 dark:hover:bg-surface-700 rounded-xl transition-all cursor-pointer"
        title="Sao chép liên kết"
      >
        <component :is="copied ? Check : Share2" :size="15" :class="copied ? 'text-teal-500' : ''" />
        <span>{{ copied ? 'Đã sao chép' : 'Chia sẻ' }}</span>
      </button>
    </div>

    <!-- Comments Section -->
    <div class="space-y-4">
      <h3 class="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
        <span>Bình luận & Thảo luận</span>
        <span class="text-xs font-semibold text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-950/50 px-2 py-0.5 rounded-full">
          {{ comments.length }}
        </span>
      </h3>

      <!-- New Comment Input Box -->
      <div v-if="authStore.isLoggedIn && authStore.user" class="flex gap-3">
        <UserAvatar :user="{ name: authStore.user.name, avatar: authStore.user.avatar || '' }" size="md" class="shrink-0 mt-1" />
        <div class="flex-1 relative">
          <textarea
            v-model="newComment"
            rows="2"
            placeholder="Chia sẻ suy nghĩ hoặc ý kiến của bạn với nhóm..."
            @keydown.enter.exact.prevent="submitComment"
            class="w-full px-4 py-2.5 text-sm rounded-2xl bg-gray-50 dark:bg-surface-700 border border-gray-200 dark:border-surface-600 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 resize-none transition-all"
          ></textarea>
          <div class="flex items-center justify-between mt-1.5">
            <span class="text-[11px] text-gray-400">
              Nhấn <strong>Enter</strong> để gửi
            </span>
            <button
              @click="submitComment"
              :disabled="!newComment.trim() || isSubmitting"
              class="inline-flex items-center gap-1.5 px-4 py-1.5 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition-all shadow-xs cursor-pointer disabled:cursor-not-allowed"
            >
              <Loader2 v-if="isSubmitting" :size="13" class="animate-spin" />
              <Send v-else :size="13" />
              <span>Gửi</span>
            </button>
          </div>
        </div>
      </div>

      <div
        v-else
        class="p-4 rounded-2xl bg-gray-50 dark:bg-surface-700/50 border border-gray-100 dark:border-surface-700 text-center text-sm text-gray-500 dark:text-gray-400"
      >
        Vui lòng đăng nhập để tham gia thảo luận trong nhóm.
      </div>

      <!-- Comments List -->
      <div v-if="isLoadingComments" class="space-y-3 py-2">
        <div v-for="i in 2" :key="i" class="flex gap-3 animate-pulse">
          <div class="w-8 h-8 rounded-full bg-gray-200 dark:bg-surface-700 shrink-0"></div>
          <div class="flex-1 space-y-2">
            <div class="w-28 h-3.5 bg-gray-200 dark:bg-surface-700 rounded-md"></div>
            <div class="w-full h-3 bg-gray-100 dark:bg-surface-700/60 rounded-md"></div>
          </div>
        </div>
      </div>

      <div v-else-if="comments.length > 0" class="space-y-3 pt-2">
        <div
          v-for="comment in comments"
          :key="comment.id"
          class="flex items-start gap-3 p-3.5 rounded-2xl bg-gray-50/80 dark:bg-surface-700/40 border border-gray-100 dark:border-surface-700/60 transition-colors group"
        >
          <UserAvatar :user="{ name: comment.author?.name || 'Thành viên', avatar: comment.author?.avatar || '' }" size="sm" class="shrink-0 mt-0.5" />
          <div class="flex-1 min-w-0">
            <div class="flex items-center justify-between gap-2">
              <span class="text-xs font-bold text-gray-900 dark:text-white">
                {{ comment.author?.name || 'Thành viên' }}
              </span>
              <div class="flex items-center gap-2">
                <span class="text-[11px] text-gray-400">
                  {{ formatRelativeTime(comment.createdAt) }}
                </span>
                <button
                  v-if="authStore.user?.id === comment.author?.id"
                  @click="deleteComment(comment.id)"
                  class="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-rose-500 transition-opacity p-1 rounded-lg"
                  title="Xóa bình luận"
                >
                  <Trash2 :size="13" />
                </button>
              </div>
            </div>
            <p class="mt-1 text-sm text-gray-700 dark:text-gray-300 leading-relaxed wrap-break-word whitespace-pre-wrap">
              {{ comment.content }}
            </p>
          </div>
        </div>
      </div>

      <div
        v-else
        class="py-6 text-center text-sm text-gray-400 dark:text-gray-500"
      >
        Chưa có bình luận nào. Hãy là người đầu tiên chia sẻ góc nhìn của bạn!
      </div>
    </div>
  </div>
</template>
