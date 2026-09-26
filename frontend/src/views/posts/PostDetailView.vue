<script setup lang="ts">
import { ref, computed } from 'vue'
import {
  ArrowUp, ArrowDown, Bookmark, BookmarkCheck, Share2, MessageCircle,
  Eye, Clock, MapPin, Flag, Heart, MoreHorizontal, Send, ChevronLeft,
  SmilePlus, X, Edit3, Image as ImageIcon, Smile
} from '@lucide/vue'
import UserAvatar from '@/components/UserAvatar.vue'
import { formatDate, formatNumber } from '@/utils/formatters'
import Skeleton from '@/components/ui/Skeleton.vue'
import PostDetailHeader from './components/PostDetailHeader.vue'
import PostAuthorCard from './components/PostAuthorCard.vue'
import PostInteractionBar from './components/PostInteractionBar.vue'
import PostComments from './components/PostComments.vue'
import RelatedPostsSidebar from './components/RelatedPostsSidebar.vue'
import { usePostDetail } from '@/composables/posts/usePostDetail'
import { useCodeHighlight } from '@/composables/core/useCodeHighlight'
import 'highlight.js/styles/github-dark.css'

const {
  user,
  router,
  post,
  posts,
  comments,
  isLoading,
  newComment,
  isBookmarked,
  replyingTo,
  activeEmojiPicker,
  emojiList,
  toggleBookmark,
  toggleEmojiPicker,
  setReplyingTo,
  clearReplyingTo
} = usePostDetail()

const isFollowing = ref(false)
// Code syntax highlighting for post content
const postContent = computed(() => post.value?.content || null)
useCodeHighlight(postContent)



</script>

<template>
  <div class="mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24 sm:pb-6">
    <!-- Back button -->
    <button
      @click="router.back()"
      class="flex items-center gap-2 text-sm text-gray-500 hover:text-primary-500 transition-colors mb-6"
    >
      <ChevronLeft :size="16" />
      Quay lại
    </button>

    <!-- Loading Skeleton -->
    <div v-if="isLoading" class="flex flex-col lg:flex-row gap-8 lg:items-start">
      <div class="flex-1 min-w-0 space-y-6">
        <Skeleton type="image" class="w-full h-64 sm:h-96 rounded-2xl" />
        <div class="bg-white dark:bg-surface-800 rounded-2xl border border-gray-200 dark:border-surface-700 p-6 sm:p-8 space-y-4">
          <Skeleton type="title" width="w-3/4" height="h-8" />
          <Skeleton type="text" width="w-full" height="h-4" v-for="i in 5" :key="i" />
          <Skeleton type="text" width="w-2/3" height="h-4" />
        </div>
      </div>
      <aside class="w-full lg:w-72 shrink-0 space-y-5">
        <Skeleton type="image" class="w-full h-48 rounded-2xl" />
      </aside>
    </div>

    <div v-else-if="post" class="flex flex-col lg:flex-row gap-8 lg:items-start">
      <!-- Article -->
      <article class="flex-1 min-w-0">
        <!-- Cover Image & Author Info -->
        <PostDetailHeader :post="post" :user="user" />

        <!-- Content -->
        <div class="bg-white dark:bg-surface-800 rounded-2xl border border-gray-200 dark:border-surface-700 p-4 sm:p-8 mb-6 overflow-hidden">
          <div
            class="prose prose-lg dark:prose-invert max-w-none wrap-break-word
              prose-headings:text-gray-900 dark:prose-headings:text-white prose-headings:font-bold
              prose-p:text-gray-600 dark:prose-p:text-gray-300 prose-p:leading-relaxed
              prose-a:text-primary-500 prose-a:no-underline hover:prose-a:underline
              prose-code:bg-gray-100 dark:prose-code:bg-surface-700 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:wrap-break-word
              prose-pre:bg-gray-900 dark:prose-pre:bg-surface-900 prose-pre:rounded-xl prose-pre:border prose-pre:border-gray-200 dark:prose-pre:border-surface-700 prose-pre:overflow-x-auto prose-pre:max-w-full
              prose-blockquote:border-primary-500 prose-blockquote:bg-primary-50 dark:prose-blockquote:bg-primary-900/10 prose-blockquote:rounded-r-xl prose-blockquote:py-1 prose-blockquote:not-italic
              prose-li:text-gray-600 dark:prose-li:text-gray-300
              prose-strong:text-gray-900 dark:prose-strong:text-white"
            v-html="post.content || '<p>Đang cập nhật nội dung...</p>'"
          ></div>

          <!-- Tags -->
          <div class="flex flex-wrap gap-2 mt-8 pt-6 border-t border-gray-200 dark:border-surface-700">
            <span
              v-for="tag in post.tags"
              :key="tag"
              @click="router.push(`/tags/${tag}`)"
              class="px-3 py-1.5 rounded-lg text-sm font-medium bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 hover:bg-primary-100 dark:hover:bg-primary-900/30 cursor-pointer transition-colors"
            >
              #{{ tag }}
            </span>
          </div>
        </div>

        <!-- Interaction Bar -->
        <PostInteractionBar
          :post="post"
          :isBookmarked="isBookmarked"
          :activeEmojiPicker="activeEmojiPicker"
          :emojiList="emojiList"
          @toggleBookmark="toggleBookmark"
          @toggleEmojiPicker="toggleEmojiPicker"
        />

        <!-- Comments Section -->
        <!-- Comments Section -->
        <PostComments
          :comments="comments"
          :user="user"
          :replyingTo="replyingTo"
          :activeEmojiPicker="activeEmojiPicker"
          @setReplyingTo="setReplyingTo"
          @clearReplyingTo="clearReplyingTo"
          @toggleEmojiPicker="toggleEmojiPicker"
        />
      </article>

      <!-- Sidebar -->
      <aside class="w-full lg:w-72 shrink-0 space-y-5 lg:sticky lg:top-6 lg:self-start">
        <!-- Author Card -->
        <PostAuthorCard :author="post.author" />

        <!-- Related Posts -->
        <RelatedPostsSidebar :posts="posts" />
      </aside>
    </div>
    
    <div v-else class="text-center py-20 text-gray-500">
      Đang tải bài viết...
    </div>
  </div>
</template>
