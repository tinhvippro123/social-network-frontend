<script setup lang="ts">
import { ref } from 'vue'
import { MessageCircle, X } from '@lucide/vue'
import UserAvatar from '@/components/UserAvatar.vue'
import CommentComposer from '@/components/comments/CommentComposer.vue'
import CommentItem from '@/components/comments/CommentItem.vue'

const props = defineProps<{
  comments: any[]
  user: any
  replyingTo: any
  activeEmojiPicker: string | null
}>()

const emit = defineEmits<{
  (e: 'setReplyingTo', targetId: string, authorName: string): void
  (e: 'clearReplyingTo'): void
  (e: 'toggleEmojiPicker', targetId: string | null): void
}>()

const commentInputRef = ref<HTMLTextAreaElement | null>(null)
const inlineReplyId = ref<string | null>(null)
const inlineReplyContent = ref('')
const mainComposerRef = ref<InstanceType<typeof CommentComposer> | null>(null)

const handleReplyClick = (targetId: string, rootCommentId: string, authorName: string) => {
  if (window.innerWidth < 640) {
    emit('setReplyingTo', targetId, authorName)
    inlineReplyId.value = null
    setTimeout(() => {
      commentInputRef.value?.focus()
    }, 50)
  } else {
    emit('clearReplyingTo')
    inlineReplyId.value = targetId
    inlineReplyContent.value = ''
  }
}

const cancelReply = () => {
  emit('clearReplyingTo')
}

const handleMainSubmit = (content: string, image: File | null) => {
  console.log('Submit main comment:', { content, image })
  mainComposerRef.value?.clear()
  emit('clearReplyingTo')
}

const handleInlineSubmit = (content: string, image: File | null) => {
  console.log('Submit inline reply to', inlineReplyId.value, ':', { content, image })
  inlineReplyId.value = null
}

const cancelInlineReply = () => {
  inlineReplyId.value = null
}
</script>

<template>
  <div class="bg-white dark:bg-surface-800 rounded-2xl border border-gray-200 dark:border-surface-700 p-6">
    <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
      <MessageCircle :size="20" class="text-primary-500" />
      Bình luận ({{ comments.length }})
    </h3>

    <textarea
      ref="commentInputRef"
      class="hidden"
    ></textarea>
    <div class="flex items-start gap-3 w-full mb-6">
      <UserAvatar v-if="user" :user="user" size="md" class="shrink-0 hidden sm:block" />
      <CommentComposer
        ref="mainComposerRef"
        :placeholder="replyingTo ? 'Viết phản hồi...' : 'Viết bình luận...'"
        :rows="2"
        @submit="handleMainSubmit"
      >
        <template #header>
          <div v-if="replyingTo" class="px-3 pt-3 flex items-center text-xs font-medium text-primary-600 dark:text-primary-400">
            <span>Đang trả lời <strong>{{ replyingTo.authorName }}</strong></span>
            <button @click="cancelReply" class="ml-1.5 p-0.5 rounded-full hover:bg-primary-50 dark:hover:bg-primary-900/50 transition-colors">
              <X :size="14" />
            </button>
          </div>
        </template>
      </CommentComposer>
    </div>

    <!-- Comments List -->
    <div class="space-y-5">
      <CommentItem
        v-for="comment in comments"
        :key="comment.id"
        :comment="comment"
        :level="0"
        :inline-reply-id="inlineReplyId"
        :active-emoji-picker="activeEmojiPicker"
        :user="user"
        @reply="handleReplyClick"
        @submit-reply="handleInlineSubmit"
        @cancel-reply="cancelInlineReply"
        @toggle-emoji="emit('toggleEmojiPicker', $event)"
      />
    </div>
  </div>
</template>
