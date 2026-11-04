<template>
  <div :id="'comment-' + comment.id" class="animate-slide-up scroll-mt-28 transition-all duration-300" :class="containerClass">
    <!-- Parent Comment Content Box & Actions -->
    <div class="relative">
      <div class="flex items-start gap-2.5 sm:gap-3">
        <!-- Avatar size based on level -->
        <div @click="goToProfile(comment.author?.id)" class="flex flex-col items-center shrink-0 cursor-pointer" title="Xem trang cá nhân">
          <UserAvatar 
            :user="comment.author" 
            :size="level === 0 ? 'md' : 'sm'" 
            class="shrink-0 relative z-10" 
            :class="level === 0 ? 'w-8! h-8!' : 'w-7! h-7!'" 
          />
        </div>
        <div class="flex-1 min-w-0">
          <!-- Content Box (Facebook styled bubble) -->
          <div 
            :class="[
              'rounded-2xl inline-block max-w-full',
              level === 0 
                ? 'bg-gray-100 dark:bg-surface-700/80 px-3.5 py-2' 
                : 'bg-gray-100 dark:bg-surface-700/60 px-3 py-1.5 rounded-xl'
            ]"
          >
            <div class="flex items-center justify-between mb-0.5 gap-2">
              <div class="flex items-center gap-1.5 flex-wrap">
                <span @click="goToProfile(comment.author?.id)" class="font-bold text-gray-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400 hover:underline cursor-pointer" :class="level === 0 ? 'text-[13px]' : 'text-xs'">
                  {{ comment.author.name }}
                </span>
                <!-- AI Lexicon Sentiment Badge -->
                <span
                  v-if="comment.sentiment"
                  :class="[
                    'inline-flex items-center px-1.5 py-0.2 rounded-full text-[10px] font-medium border',
                    comment.sentiment === 'positive' ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800' :
                    comment.sentiment === 'negative' ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-800' :
                    'bg-gray-100 dark:bg-surface-600 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-surface-500'
                  ]"
                  :title="'Cảm xúc: ' + (comment.sentiment === 'positive' ? 'Tích cực' : comment.sentiment === 'negative' ? 'Tiêu cực' : 'Trung lập')"
                >
                  {{ comment.sentiment === 'positive' ? '😊' : comment.sentiment === 'negative' ? '⚠️' : '😐' }}
                </span>
              </div>
            </div>
            <p
              class="text-gray-900 dark:text-gray-100 whitespace-pre-line wrap-break-word leading-snug"
              :class="level === 0 ? 'text-[13px] sm:text-sm' : 'text-xs sm:text-[13px]'"
            ><span v-if="comment.replyTo" class="text-primary-600 dark:text-primary-400 font-bold cursor-pointer hover:underline mr-1">@{{ comment.replyTo }}</span><span>{{ cleanCommentText }}</span></p>
            <img
              v-if="commentImageUrl"
              :src="commentImageUrl"
              alt="Ảnh bình luận"
              class="mt-2 max-h-52 w-auto rounded-xl object-cover border border-gray-200 dark:border-surface-600"
            />
          </div>
          
          <!-- Actions: Time + Reply + Reactions (Facebook style snug spacing) -->
          <div class="flex items-center gap-2.5 mt-0.5 ml-2.5 text-[11px] sm:text-xs text-gray-500">
            <span class="text-gray-400 font-normal">{{ formatDate(comment.createdAt) }}</span>
            
            <button 
              @click="handleReplyClick" 
              class="font-bold text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white hover:underline cursor-pointer"
            >
              Phản hồi
            </button>

            <!-- Emoji Reactions -->
            <div v-if="comment.reactions && comment.reactions.length > 0" class="flex items-center gap-1">
              <button
                v-for="reaction in comment.reactions"
                :key="reaction.emoji"
                @click="toggleReaction(reaction.emoji)"
                :title="reaction.reacted ? 'Bỏ cảm xúc' : 'Thả cảm xúc'"
                :class="[
                  'flex items-center gap-1 rounded-full font-medium transition-all border px-1.5 py-0.2 text-[10px] cursor-pointer hover:scale-105',
                  reaction.reacted
                    ? 'bg-primary-50 dark:bg-primary-900/20 border-primary-300 dark:border-primary-700 text-primary-600 dark:text-primary-400 font-semibold'
                    : 'bg-gray-50 dark:bg-surface-600 border-gray-200 dark:border-surface-500 text-gray-500 hover:bg-gray-100 dark:hover:bg-surface-500'
                ]"
              >
                {{ reaction.emoji }} {{ reaction.count }}
              </button>
            </div>
            
            <!-- Add Reaction Button -->
            <div class="relative">
              <button
                @click="$emit('toggle-emoji', comment.id)"
                class="text-gray-400 hover:text-primary-500 transition-colors p-0.5 cursor-pointer"
                title="Thả cảm xúc"
              >
                <SmilePlus :size="13" />
              </button>
              
              <!-- Emoji Picker Popup -->
              <div v-if="activeEmojiPicker === comment.id" class="absolute left-0 bottom-6 z-50 bg-white dark:bg-surface-800 rounded-xl shadow-xl border border-gray-200 dark:border-surface-700 p-2 flex gap-1">
                <button
                  v-for="emoji in emojiList"
                  :key="emoji"
                  @click="toggleReaction(emoji)"
                  class="w-8 h-8 rounded-lg hover:bg-gray-100 dark:hover:bg-surface-700 flex items-center justify-center text-base transition-colors cursor-pointer hover:scale-110"
                >
                  {{ emoji }}
                </button>
              </div>
            </div>

            <!-- Delete Button (Only for author) -->
            <button
              v-if="user && (user.id === comment.author?.id || user.id === comment.authorId)"
              @click="$emit('delete', comment.id)"
              class="font-semibold text-rose-500 hover:text-rose-700 hover:underline cursor-pointer"
            >
              Xóa
            </button>
          </div>
        </div>
      </div>

      <!-- Continuous vertical trunk line from under avatar down through actions, overlapping child replies -->
      <span 
        v-if="level === 0 && (displayReplies.length > 0 || inlineReplyId === comment.id)"
        class="thread-trunk-father"
        aria-hidden="true"
      />
    </div>

    <!-- Inline Reply Box with curved connector (Facebook style) -->
    <div v-if="inlineReplyId === comment.id" 
         class="relative mt-2 pl-10">
      <span 
        class="thread-branch-child"
        aria-hidden="true"
      />
      <div class="flex items-start gap-2 sm:gap-3 animate-slide-down">
        <UserAvatar v-if="user" :user="user" size="sm" class="shrink-0 w-7! h-7! relative z-10" />
        <div v-else class="rounded-full bg-gray-200 dark:bg-surface-700 shrink-0 w-7 h-7 relative z-10"></div>
        <CommentComposer
          ref="inlineComposerRef"
          :reply-to-name="comment.author.name"
          :auto-focus="true"
          :compact="true"
          :show-cancel="true"
          :rows="1"
          @submit="handleSubmitReply"
          @cancel="$emit('cancel-reply')"
        />
      </div>
    </div>
    
    <!-- Flat Replies (Facebook style 1-level thread) -->
    <div v-if="level === 0 && displayReplies.length > 0" class="mt-1 relative">
      <div 
        v-if="!isCollapsed"
        class="space-y-1.5"
      >
        <div
          v-for="(reply, rIndex) in displayReplies"
          :key="reply.id"
          class="relative pl-10"
        >
          <!-- Vertical trunk between sibling replies -->
          <span
            v-if="Number(rIndex) < displayReplies.length - 1"
            class="thread-trunk-child"
            aria-hidden="true"
          />

          <!-- Vertical trunk for the last child leading to toggle button: stops at bottom 0 so it never pokes past the curve -->
          <span
            v-else-if="displayReplies.length > 1"
            class="thread-trunk-to-toggle"
            aria-hidden="true"
          />

          <!-- Curved branch connecting from trunk directly into child avatar -->
          <span 
            class="thread-branch-child"
            aria-hidden="true"
          />

          <CommentItem
            :comment="reply"
            :level="1"
            :inline-reply-id="inlineReplyId"
            :active-emoji-picker="activeEmojiPicker"
            :user="user"
            @reply="(tid, rid, aname) => $emit('reply', tid, comment.id, aname)"
            @submit-reply="(content, image) => $emit('submit-reply', content, image)"
            @cancel-reply="$emit('cancel-reply')"
            @toggle-emoji="(cid) => $emit('toggle-emoji', cid)"
            @delete="(cid) => $emit('delete', cid)"
          />
        </div>
      </div>

      <!-- Collapsed Thread Toggle (Curved L connector like Facebook's 'Xem tất cả 14 phản hồi') -->
      <div
        v-if="isCollapsed"
        class="relative pl-10 py-0.5 mt-1"
      >
        <span 
          class="thread-branch-toggle"
          aria-hidden="true"
        />
        <button
          @click="isCollapsed = false"
          type="button"
          class="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-300 hover:underline font-semibold cursor-pointer py-0.5"
        >
          <ChevronRight :size="13" />
          <span>Xem tất cả {{ displayReplies.length }} phản hồi</span>
        </button>
      </div>

      <!-- Collapse button beneath thread line when expanded -->
      <div
        v-if="!isCollapsed && displayReplies.length > 1"
        class="relative pl-10 py-0.5 mt-1"
      >
        <span 
          class="thread-branch-toggle"
          aria-hidden="true"
        />
        <button
          @click="isCollapsed = true"
          type="button"
          class="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 font-semibold transition-colors cursor-pointer py-0.5"
        >
          <ChevronDown :size="13" />
          <span>Thu gọn {{ displayReplies.length }} phản hồi</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watchEffect } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { SmilePlus, ChevronDown, ChevronRight } from '@lucide/vue'
import UserAvatar from '@/components/UserAvatar.vue'
import CommentComposer from '@/components/comments/CommentComposer.vue'
import { formatDate } from '@/utils/formatters'

interface Props {
  comment: any
  level?: number
  inlineReplyId?: string | null
  activeEmojiPicker?: string | null
  user?: any
}

const props = withDefaults(defineProps<Props>(), {
  level: 0,
  inlineReplyId: null,
  activeEmojiPicker: null,
  user: null
})

const emit = defineEmits<{
  (e: 'reply', targetId: string, rootCommentId: string, authorName: string): void
  (e: 'submit-reply', content: string, image: File | null): void
  (e: 'cancel-reply'): void
  (e: 'toggle-emoji', commentId: string | null): void
  (e: 'delete', commentId: string): void
}>()

const emojiList = ['😀', '😂', '🥰', '😎', '😭', '😡', '👍', '👎', '❤️', '🔥', '🎉', '✨', '🤔', '🙌', '👀', '💯']

const inlineComposerRef = ref<InstanceType<typeof CommentComposer> | null>(null)
const isCollapsed = ref(false)
const route = useRoute()
const router = useRouter()

function goToProfile(userId?: string) {
  if (userId && userId !== 'guest') {
    router.push(`/profile/${userId}`)
  }
}

const commentImageUrl = computed(() => {
  const raw = props.comment?.content || ''
  const match = raw.match(/\[img:(https?:\/\/[^\]]+)\]/)
  return match ? match[1] : null
})

const cleanCommentText = computed(() => {
  const raw = props.comment?.content || ''
  return raw.replace(/\[img:https?:\/\/[^\]]+\]/g, '').trim()
})

const containerClass = computed(() => {
  if (props.level === 0) return 'mt-5'
  return ''
})

/**
 * Facebook / YouTube pattern: Flatten nested replies to a single clean 1-level thread
 */
function flattenReplies(replies: any[]): any[] {
  if (!replies || !Array.isArray(replies)) return []
  const result: any[] = []
  function traverse(list: any[]) {
    for (const item of list) {
      result.push(item)
      if (item.replies && item.replies.length > 0) {
        traverse(item.replies)
      }
    }
  }
  traverse(replies)
  return result.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
}

const displayReplies = computed(() => {
  if (props.level === 0) {
    return flattenReplies(props.comment.replies || [])
  }
  return []
})

// Auto-expand replies thread if the target comment is inside this thread (by ID, hash, or author)
watchEffect(() => {
  if (displayReplies.value.length === 0) return
  const rawTarget = route?.hash ? route.hash.replace('#comment-', '').replace('#', '').trim() : ''
  const author = route?.query?.highlightAuthor ? String(route.query.highlightAuthor).toLowerCase().trim() : ''

  if (rawTarget && displayReplies.value.some(r => r.id === rawTarget || `comment-${r.id}` === rawTarget)) {
    isCollapsed.value = false
  }
  if (author && displayReplies.value.some(r => r.author?.name?.toLowerCase().includes(author))) {
    isCollapsed.value = false
  }
})

if (typeof window !== 'undefined') {
  window.addEventListener('jump-to-comment', (e: any) => {
    if (displayReplies.value.length === 0) return
    const detail = e.detail
    const targetHash = typeof detail === 'string' ? detail : detail?.targetHash || ''
    const authorName = (typeof detail === 'object' && detail?.authorName ? detail.authorName : '').toLowerCase().trim()
    const cleanId = targetHash.replace('#comment-', '').replace('#', '').trim()

    if (cleanId && displayReplies.value.some(r => r.id === cleanId || `comment-${r.id}` === cleanId)) {
      isCollapsed.value = false
    }
    if (authorName && displayReplies.value.some(r => r.author?.name?.toLowerCase().includes(authorName))) {
      isCollapsed.value = false
    }
  })
}

const handleReplyClick = () => {
  emit('reply', props.comment.id, props.comment.id, props.comment.author.name)
}

const handleSubmitReply = (content: string, image: File | null) => {
  emit('submit-reply', content, image)
  inlineComposerRef.value?.clear()
}

function toggleReaction(emoji: string) {
  if (!props.comment.reactions) {
    props.comment.reactions = []
  }
  const existing = props.comment.reactions.find((r: any) => r.emoji === emoji)
  if (existing) {
    existing.reacted = !existing.reacted
    existing.count += existing.reacted ? 1 : -1
    if (existing.count <= 0) {
      props.comment.reactions = props.comment.reactions.filter((r: any) => r.emoji !== emoji)
    }
  } else {
    props.comment.reactions.push({ emoji, count: 1, reacted: true })
  }
  emit('toggle-emoji', null)
}
</script>

<style scoped>
/* Facebook 1-Level Thread Connector Lines */

/* 1. Trunk of parent comment: starts slightly below avatar (top: 36px) leaving a clean 4px breathing gap */
.thread-trunk-father {
  position: absolute;
  left: 15px;
  top: 36px;
  bottom: 0;
  width: 2px;
  background-color: #d1d5db;
  pointer-events: none;
}

/* 2. Trunk between sibling reply items */
.thread-trunk-child {
  position: absolute;
  left: 15px;
  top: -8px;
  bottom: -8px;
  width: 2px;
  background-color: #d1d5db;
  pointer-events: none;
}

/* 3. Trunk for the last child leading to toggle button: stops at bottom 0 so it never pokes past the curve */
.thread-trunk-to-toggle {
  position: absolute;
  left: 15px;
  top: -8px;
  bottom: 0;
  width: 2px;
  background-color: #d1d5db;
  pointer-events: none;
}

/* 4. Curved L connector into child avatar: stops with a clean 4px gap before avatar (width: 21px) */
.thread-branch-child {
  position: absolute;
  left: 15px;
  top: -8px;
  width: 21px;
  height: 22px;
  border-left: 2px solid #d1d5db;
  border-bottom: 2px solid #d1d5db;
  border-bottom-left-radius: 12px;
  pointer-events: none;
}

/* 5. Curved L connector into collapse / expand toggle buttons */
.thread-branch-toggle {
  position: absolute;
  left: 15px;
  top: -8px;
  width: 22px;
  height: 20px;
  border-left: 2px solid #d1d5db;
  border-bottom: 2px solid #d1d5db;
  border-bottom-left-radius: 12px;
  pointer-events: none;
}

/* Dark mode support */
:global(.dark) .thread-trunk-father,
:global(.dark) .thread-trunk-child,
:global(.dark) .thread-trunk-to-toggle {
  background-color: #475569;
}

:global(.dark) .thread-branch-child,
:global(.dark) .thread-branch-toggle {
  border-color: #475569;
}
</style>

