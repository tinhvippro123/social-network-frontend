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
  (e: 'addComment', content: string, image: File | null): void
  (e: 'replyComment', parentId: string, content: string, image: File | null): void
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
      mainComposerRef.value?.focus()
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
  emit('addComment', content, image)
  mainComposerRef.value?.clear()
  emit('clearReplyingTo')
}

const handleInlineSubmit = (content: string, image: File | null) => {
  if (inlineReplyId.value) {
    emit('replyComment', inlineReplyId.value, content, image)
  }
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


    <div class="fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-surface-800 p-3 sm:p-0 border-t border-gray-200 dark:border-surface-700 shadow-[0_-4px_10px_rgba(0,0,0,0.05)] sm:shadow-none sm:border-0 sm:static sm:bg-transparent sm:z-auto flex items-start gap-3 w-full sm:mb-6">
      <UserAvatar v-if="user" :user="user" size="md" class="shrink-0 hidden sm:block" />
      <CommentComposer
        ref="mainComposerRef"
        :placeholder="'Viết bình luận...'"
        :reply-to-name="replyingTo?.authorName"
        :rows="2"
        class="w-full"
        @submit="handleMainSubmit"
        @cancel="cancelReply"
      />
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
