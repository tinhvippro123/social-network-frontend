<script setup lang="ts">
import { ref, computed } from 'vue'
import {
  ChevronUp,
  ChevronDown,
  SmilePlus,
  MessageCircle,
  BookmarkCheck,
  Bookmark,
  Share2,
  Flag
} from '@lucide/vue'
import { useToast } from '@/composables/ui/useToast'
import { COMMENT_EMOJIS } from '@/constants'

const props = withDefaults(
  defineProps<{
    post: any
    isBookmarked: boolean
    userVote?: 'UPVOTE' | 'DOWNVOTE' | null
    currentUserReaction?: string | null
    emojiList?: readonly string[]
  }>(),
  {
    emojiList: () => COMMENT_EMOJIS
  }
)

const emit = defineEmits<{
  (e: 'upvote'): void
  (e: 'downvote'): void
  (e: 'toggleBookmark'): void
  (e: 'toggleReaction', emoji: string): void
  (e: 'report'): void
  (e: 'scrollToComments'): void
}>()

const toast = useToast()
const showReactionDock = ref(false)
let hideTimer: ReturnType<typeof setTimeout> | null = null

const formatEmoji = (emoji: string): string => {
  if (!emoji) return '👍'
  const upper = emoji.toUpperCase()
  if (upper === 'LIKE' || upper === 'UPVOTE') return '👍'
  if (upper === 'HEART' || upper === 'LOVE') return '❤️'
  if (upper === 'DOWNVOTE') return '👎'
  return emoji
}

const getReactionLabel = (emoji?: string | null): string => {
  if (!emoji) return 'Cảm xúc'
  switch (emoji) {
    case '👍': return 'Thích'
    case '❤️': return 'Yêu thích'
    case '😂': return 'Haha'
    case '😮': return 'Wow'
    case '😢': return 'Buồn'
    case '😡': return 'Phẫn nộ'
    case '🔥': return 'Tuyệt vời'
    case '🎉': return 'Chúc mừng'
    case '💡': return 'Hữu ích'
    default: return 'Cảm xúc'
  }
}

const voteScore = computed(() => {
  const up = Number(props.post?.upvotesCount) || 0
  const down = Number(props.post?.downvotesCount) || 0
  return up - down
})

// Filter out UPVOTE and DOWNVOTE so they only appear in the dedicated vote pill
const validReactions = computed(() => {
  if (!props.post?.reactions || !Array.isArray(props.post.reactions)) return []
  return props.post.reactions.filter((r: any) => {
    const upper = (r.emoji || '').toUpperCase()
    return upper !== 'UPVOTE' && upper !== 'DOWNVOTE' && (Number(r.count) || 0) > 0
  })
})

// Top 3 distinct emojis sorted by count descending
const topReactions = computed(() => {
  return [...validReactions.value]
    .sort((a: any, b: any) => (Number(b.count) || 0) - (Number(a.count) || 0))
    .slice(0, 3)
})

// Total count of all emoji reactions
const totalReactionCount = computed(() => {
  return validReactions.value.reduce((sum: number, r: any) => sum + (Number(r.count) || 0), 0)
})

const reactionTooltip = computed(() => {
  if (totalReactionCount.value === 0) return 'Chưa có cảm xúc nào'
  return validReactions.value.map((r: any) => `${formatEmoji(r.emoji)} ${r.count}`).join(', ')
})

const openDock = () => {
  if (hideTimer) {
    clearTimeout(hideTimer)
    hideTimer = null
  }
  showReactionDock.value = true
}

const scheduleCloseDock = () => {
  hideTimer = setTimeout(() => {
    showReactionDock.value = false
  }, 250)
}

const handleReactionButtonClick = () => {
  if (props.currentUserReaction) {
    // If user already reacted, clicking the button directly un-reacts (toggles off)
    emit('toggleReaction', props.currentUserReaction)
  } else {
    // Toggle the dock on click (convenient for touch/mobile devices)
    showReactionDock.value = !showReactionDock.value
  }
}

const selectEmoji = (emoji: string) => {
  showReactionDock.value = false
  emit('toggleReaction', emoji)
}

const scrollToComments = () => {
  emit('scrollToComments')
}

const sharePost = async () => {
  const url = window.location.href
  try {
    if (navigator.share) {
      await navigator.share({ title: props.post?.title || 'VietBlog', url })
    } else {
      await navigator.clipboard.writeText(url)
      toast.success('Đã sao chép liên kết vào bộ nhớ tạm!')
    }
  } catch {
    // User cancelled share dialog
  }
}
</script>

<template>
  <div class="relative flex items-center justify-between bg-white dark:bg-surface-800 rounded-2xl border border-gray-200 dark:border-surface-700 p-2 sm:p-2.5 mb-6 sm:sticky sm:bottom-4 sm:shadow-lg sm:z-30">
    <!-- Left Section: Vote Pill + Facebook-Style Grouped Reactions -->
    <div class="flex items-center gap-2 sm:gap-2.5 min-w-0 mr-2">
      <!-- Reddit-style Upvote/Downvote Cluster -->
      <div class="flex items-center bg-gray-100 dark:bg-surface-700/80 rounded-xl p-0.5 border border-gray-200/80 dark:border-surface-600 shrink-0">
        <!-- Upvote Button -->
        <button
          type="button"
          @click="emit('upvote')"
          :class="[
            'flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-lg transition-all duration-150 cursor-pointer active:scale-90',
            userVote === 'UPVOTE'
              ? 'bg-orange-500 text-white shadow-xs'
              : 'text-gray-500 dark:text-gray-400 hover:text-orange-500 dark:hover:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-950/30'
          ]"
          title="Tán thành (Upvote)"
        >
          <ChevronUp :size="18" class="stroke-[2.5]" />
        </button>

        <!-- Score -->
        <span
          :class="[
            'px-1 sm:px-1.5 text-xs font-bold min-w-6 sm:min-w-7 text-center select-none tabular-nums transition-colors',
            userVote === 'UPVOTE'
              ? 'text-orange-600 dark:text-orange-400 font-extrabold'
              : userVote === 'DOWNVOTE'
              ? 'text-indigo-600 dark:text-indigo-400 font-extrabold'
              : 'text-gray-700 dark:text-gray-300'
          ]"
        >
          {{ voteScore }}
        </span>

        <!-- Downvote Button -->
        <button
          type="button"
          @click="emit('downvote')"
          :class="[
            'flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-lg transition-all duration-150 cursor-pointer active:scale-90',
            userVote === 'DOWNVOTE'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/30'
          ]"
          title="Không tán thành (Downvote)"
        >
          <ChevronDown :size="18" class="stroke-[2.5]" />
        </button>
      </div>

      <!-- Subtle Vertical Divider -->
      <div class="h-6 w-px bg-gray-200 dark:bg-surface-700 shrink-0"></div>

      <!-- Facebook-style Grouped Emoji Cluster (Summary + Action Button) -->
      <div class="relative flex items-center gap-1.5 shrink-0" @mouseenter="openDock" @mouseleave="scheduleCloseDock">
        <!-- Floating Emoji Dock (Pops up above like Facebook) -->
        <Transition
          enter-active-class="transition duration-200 ease-out"
          enter-from-class="transform scale-90 opacity-0 translate-y-2"
          enter-to-class="transform scale-100 opacity-100 translate-y-0"
          leave-active-class="transition duration-150 ease-in"
          leave-from-class="transform scale-100 opacity-100 translate-y-0"
          leave-to-class="transform scale-90 opacity-0 translate-y-2"
        >
          <div
            v-if="showReactionDock"
            class="absolute bottom-full mb-2.5 left-0 z-50 flex items-center gap-1 sm:gap-1.5 p-1.5 bg-white/95 dark:bg-surface-800/95 backdrop-blur-md rounded-full shadow-2xl border border-gray-200/90 dark:border-surface-700 select-none animate-in fade-in"
          >
            <button
              v-for="emoji in emojiList"
              :key="emoji"
              type="button"
              @click.stop="selectEmoji(emoji)"
              :class="[
                'w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-xl sm:text-2xl transition-all duration-150 cursor-pointer',
                'hover:scale-130 active:scale-95 hover:-translate-y-1',
                currentUserReaction === emoji ? 'bg-primary-50 dark:bg-primary-950/50 ring-2 ring-primary-500 scale-110' : 'hover:bg-gray-100 dark:hover:bg-surface-700'
              ]"
              :title="getReactionLabel(emoji)"
            >
              {{ emoji }}
            </button>
          </div>
        </Transition>

        <!-- Reaction Button -->
        <button
          type="button"
          @click="handleReactionButtonClick"
          :class="[
            'flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 border shrink-0 cursor-pointer active:scale-95 shadow-2xs select-none',
            currentUserReaction
              ? 'bg-primary-50 dark:bg-primary-950/40 border-primary-200 dark:border-primary-800/60 text-primary-600 dark:text-primary-400'
              : 'bg-gray-50 dark:bg-surface-700/60 border-gray-200/80 dark:border-surface-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-surface-700 hover:text-primary-600 dark:hover:text-primary-400'
          ]"
          :title="currentUserReaction ? 'Bấm để hủy cảm xúc' : 'Thả cảm xúc cho bài viết'"
        >
          <span v-if="currentUserReaction" class="text-base leading-none">{{ formatEmoji(currentUserReaction) }}</span>
          <SmilePlus v-else :size="16" class="text-gray-500 dark:text-gray-400" />
          <span class="hidden sm:inline">{{ getReactionLabel(currentUserReaction) }}</span>
        </button>

        <!-- Stacked Emojis Summary (Overlap avatar style + count) -->
        <div
          v-if="totalReactionCount > 0"
          class="flex items-center gap-1 px-2 py-1 rounded-xl bg-gray-50 dark:bg-surface-700/50 border border-gray-200/60 dark:border-surface-600/50 text-xs font-semibold text-gray-700 dark:text-gray-300 select-none cursor-default shrink-0"
          :title="reactionTooltip"
        >
          <!-- Stacked top 3 icons -->
          <div class="flex items-center -space-x-1.5">
            <span
              v-for="(r, idx) in topReactions"
              :key="r.emoji"
              :style="{ zIndex: 10 - idx }"
              class="inline-flex items-center justify-center w-5 h-5 text-xs bg-white dark:bg-surface-800 rounded-full shadow-2xs border border-white dark:border-surface-700"
            >
              {{ formatEmoji(r.emoji) }}
            </span>
          </div>
          <!-- Total Count -->
          <span class="tabular-nums font-bold text-gray-600 dark:text-gray-300 ml-0.5">
            {{ totalReactionCount }}
          </span>
        </div>
      </div>
    </div>

    <!-- Actions Section (Right) -->
    <div class="flex items-center gap-1 shrink-0">
      <button 
        type="button"
        @click="scrollToComments"
        class="flex items-center justify-center gap-1.5 p-2 sm:px-3 sm:py-2 rounded-xl text-sm font-medium text-gray-500 hover:bg-gray-100 dark:hover:bg-surface-700 transition-all cursor-pointer"
        title="Bình luận"
      >
        <MessageCircle :size="18" />
        <span class="hidden sm:inline text-xs font-semibold">{{ post?.commentsCount || 0 }}</span>
      </button>

      <button
        type="button"
        @click="emit('toggleBookmark')"
        :class="[
          'flex items-center justify-center gap-1.5 p-2 sm:px-3 sm:py-2 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer',
          isBookmarked ? 'bg-amber-500/10 text-amber-500' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-surface-700'
        ]"
        title="Lưu bài viết"
      >
        <BookmarkCheck v-if="isBookmarked" :size="18" />
        <Bookmark v-else :size="18" />
        <span class="hidden sm:inline text-xs font-semibold">Lưu</span>
      </button>

      <button 
        type="button"
        @click="sharePost"
        class="flex items-center justify-center gap-1.5 p-2 sm:px-3 sm:py-2 rounded-xl text-sm font-medium text-gray-500 hover:bg-gray-100 dark:hover:bg-surface-700 transition-all cursor-pointer"
        title="Chia sẻ"
      >
        <Share2 :size="18" />
        <span class="hidden sm:inline text-xs font-semibold">Chia sẻ</span>
      </button>

      <button 
        type="button"
        @click="emit('report')"
        class="flex items-center justify-center gap-1.5 p-2 sm:px-3 sm:py-2 rounded-xl text-sm font-medium text-gray-500 hover:bg-gray-100 dark:hover:bg-surface-700 hover:text-red-500 transition-all cursor-pointer"
        title="Báo cáo"
      >
        <Flag :size="18" />
      </button>
    </div>
  </div>
</template>
