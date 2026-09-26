<script setup lang="ts">
import { SmilePlus, MessageCircle, BookmarkCheck, Bookmark, Share2, Flag } from '@lucide/vue'

defineProps<{
  post: any
  isBookmarked: boolean
  activeEmojiPicker: string | null
  emojiList: readonly string[]
}>()

const emit = defineEmits<{
  (e: 'toggleBookmark'): void
  (e: 'toggleEmojiPicker', postId: string): void
}>()
</script>

<template>
  <div class="flex items-center justify-between bg-white dark:bg-surface-800 rounded-2xl border border-gray-200 dark:border-surface-700 p-3 sm:p-4 mb-6 sm:sticky sm:bottom-4 sm:shadow-lg sm:z-40 overflow-hidden">
    <div class="flex items-center gap-1.5 overflow-x-auto scrollbar-hide min-w-0 mr-2 pb-1">
      <button
        v-for="reaction in post.reactions"
        :key="reaction.emoji"
        :class="[
          'flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 border shrink-0 whitespace-nowrap',
          reaction.reacted
            ? 'bg-primary-50 dark:bg-primary-900/20 border-primary-300 dark:border-primary-700 text-primary-600 dark:text-primary-400'
            : 'bg-gray-50 dark:bg-surface-600 border-gray-200 dark:border-surface-500 text-gray-500 hover:bg-gray-100 dark:hover:bg-surface-500'
        ]"
      >
        <span>{{ reaction.emoji }}</span>
        <span>{{ reaction.count }}</span>
      </button>
      <div class="relative">
        <button
          @click="emit('toggleEmojiPicker', post.id)"
          class="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium text-gray-500 hover:bg-gray-100 dark:hover:bg-surface-700 transition-all border border-gray-200 dark:border-surface-500 bg-gray-50 dark:bg-surface-600 hover:text-primary-500 shrink-0"
        >
          <SmilePlus :size="18" />
        </button>
        <div v-if="activeEmojiPicker === post.id" class="absolute left-0 bottom-12 z-50 bg-white dark:bg-surface-800 rounded-xl shadow-xl border border-gray-200 dark:border-surface-700 p-2 flex gap-1">
          <button
            v-for="emoji in emojiList"
            :key="emoji"
            @click="emit('toggleEmojiPicker', post.id)"
            class="w-10 h-10 rounded-lg hover:bg-gray-100 dark:hover:bg-surface-700 flex items-center justify-center text-xl transition-colors"
          >
            {{ emoji }}
          </button>
        </div>
      </div>
    </div>

    <div class="flex items-center gap-1 shrink-0">
      <button class="flex items-center justify-center gap-1.5 p-2 sm:px-3 sm:py-2 rounded-xl text-sm font-medium text-gray-500 hover:bg-gray-100 dark:hover:bg-surface-700 transition-all">
        <MessageCircle :size="18" />
        <span class="hidden sm:inline">{{ post.commentsCount }}</span>
      </button>
      <button
        @click="emit('toggleBookmark')"
        :class="[
          'flex items-center justify-center gap-1.5 p-2 sm:px-3 sm:py-2 rounded-xl text-sm font-medium transition-all duration-200',
          isBookmarked ? 'bg-amber-500/10 text-amber-500' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-surface-700'
        ]"
      >
        <BookmarkCheck v-if="isBookmarked" :size="18" />
        <Bookmark v-else :size="18" />
        <span class="hidden sm:inline">Lưu</span>
      </button>
      <button class="flex items-center justify-center gap-1.5 p-2 sm:px-3 sm:py-2 rounded-xl text-sm font-medium text-gray-500 hover:bg-gray-100 dark:hover:bg-surface-700 transition-all">
        <Share2 :size="18" />
        <span class="hidden sm:inline">Chia sẻ</span>
      </button>
      <button class="flex items-center justify-center gap-1.5 p-2 sm:px-3 sm:py-2 rounded-xl text-sm font-medium text-gray-500 hover:bg-gray-100 dark:hover:bg-surface-700 transition-all">
        <Flag :size="18" />
      </button>
    </div>
  </div>
</template>
