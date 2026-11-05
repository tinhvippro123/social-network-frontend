<script setup lang="ts">
import { ref, computed } from 'vue'
import { MessageCircle, X, Sparkles, Smile, Frown, Meh } from '@lucide/vue'
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
  (e: 'deleteComment', commentId: string): void
}>()

const commentInputRef = ref<HTMLTextAreaElement | null>(null)
const inlineReplyId = ref<string | null>(null)
const inlineReplyContent = ref('')
const mainComposerRef = ref<InstanceType<typeof CommentComposer> | null>(null)

// Tỉ lệ cảm xúc bình luận (Lexicon Sentiment Analysis) khớp Đề cương NCKH
const sentimentStats = computed(() => {
  const allComments: any[] = []
  function collect(list: any[]) {
    if (!list) return
    for (const c of list) {
      allComments.push(c)
      if (c.replies && c.replies.length > 0) {
        collect(c.replies)
      }
    }
  }
  collect(props.comments)

  const total = allComments.length
  if (total === 0) return null

  let positive = 0
  let negative = 0
  let neutral = 0

  for (const c of allComments) {
    if (c.sentiment === 'positive') positive++
    else if (c.sentiment === 'negative') negative++
    else neutral++
  }

  const posPct = Math.round((positive / total) * 100)
  const negPct = Math.round((negative / total) * 100)
  const neuPct = Math.max(0, 100 - posPct - negPct)

  return {
    total,
    positive,
    negative,
    neutral,
    posPct,
    negPct,
    neuPct,
  }
})

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
  <div id="comments" class="bg-white dark:bg-surface-800 rounded-2xl border border-gray-200 dark:border-surface-700 p-6 scroll-mt-20">
    <!-- Header with count & Sentiment Ratio (Khớp Đề cương) -->
    <div class="flex flex-wrap items-center justify-between gap-3 mb-6">
      <h3 class="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
        <MessageCircle :size="20" class="text-primary-500" />
        Bình luận ({{ sentimentStats?.total || comments.length }})
      </h3>

      <!-- AI Sentiment Widget -->
      <div
        v-if="sentimentStats && sentimentStats.total > 0"
        class="inline-flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-linear-to-r from-emerald-50/70 via-indigo-50/40 to-purple-50/50 dark:from-surface-700 dark:to-surface-700 border border-gray-200/90 dark:border-surface-600 text-xs shadow-2xs"
        title="Tỉ lệ cảm xúc tự động phân tích bởi giải thuật Lexicon-based NLP"
      >
        <span class="inline-flex items-center gap-1 font-bold text-indigo-700 dark:text-indigo-300">
          <Sparkles :size="13" class="text-indigo-500 animate-pulse" />
          Cảm xúc AI:
        </span>
        <span class="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold">
          <Smile :size="13" /> {{ sentimentStats.posPct }}% Tích cực
        </span>
        <span v-if="sentimentStats.neuPct > 0" class="inline-flex items-center gap-1 text-gray-500 dark:text-gray-400 font-medium">
          <Meh :size="13" /> {{ sentimentStats.neuPct }}% Trung lập
        </span>
        <span v-if="sentimentStats.negPct > 0" class="inline-flex items-center gap-1 text-rose-500 dark:text-rose-400 font-semibold">
          <Frown :size="13" /> {{ sentimentStats.negPct }}% Tiêu cực
        </span>
      </div>
    </div>


    <div class="fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-surface-800 p-3 sm:p-0 border-t border-gray-200 dark:border-surface-700 shadow-[0_-4px_10px_rgba(0,0,0,0.05)] sm:shadow-none sm:border-0 sm:static sm:bg-transparent sm:z-auto flex items-start gap-3 w-full sm:mb-6">
      <UserAvatar v-if="user" :user="user" size="md" class="shrink-0 hidden sm:flex" />
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
    <div v-if="comments.length === 0" class="text-center py-8 text-sm text-gray-400 dark:text-gray-500 italic">
      Chưa có bình luận nào. Hãy là người đầu tiên chia sẻ suy nghĩ của bạn!
    </div>
    <div class="space-y-5">
      <CommentItem
        v-for="comment in comments"
        :id="'comment-' + comment.id"
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
        @delete="emit('deleteComment', $event)"
      />
    </div>
  </div>
</template>
