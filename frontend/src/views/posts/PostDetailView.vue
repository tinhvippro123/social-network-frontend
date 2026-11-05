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
import PostAiSummary from './components/PostAiSummary.vue'
import PostInteractionBar from './components/PostInteractionBar.vue'
import PostComments from './components/PostComments.vue'
import RelatedPostsSidebar from './components/RelatedPostsSidebar.vue'
import ReportPostModal from './components/ReportPostModal.vue'
import ImageLightboxModal from '@/components/ui/ImageLightboxModal.vue'
import { formatContentWithGalleries } from '@/utils/proseGallery'
import { usePostDetail } from '@/composables/posts/usePostDetail'
import { useUiStore } from '@/stores/ui.store'
import { useToast } from '@/composables/ui/useToast'
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
  userVote,
  currentUserReaction,
  handleUpvote,
  handleDownvote,
  replyingTo,
  activeEmojiPicker,
  emojiList,
  showReportModal,
  toggleBookmark,
  toggleEmojiPicker,
  toggleReaction,
  reportPost,
  scrollToComments,
  setReplyingTo,
  clearReplyingTo,
  addComment,
  replyComment,
  deleteComment
} = usePostDetail()

const isFollowing = ref(false)
const uiStore = useUiStore()
const toast = useToast()

function handleOpenReport() {
  if (!user.value) {
    toast.info('Vui lòng đăng nhập để báo cáo bài viết')
    uiStore.openAuthModal('login')
    return
  }
  showReportModal.value = true
}
// Code syntax highlighting for post content
const postContent = computed(() => post.value?.content || null)
useCodeHighlight(postContent)

// Transform consecutive images in each section into Collage Gallery Grids (+N)
const formattedPostContent = computed(() => formatContentWithGalleries(post.value?.content))

// Image Lightbox Gallery
const isLightboxOpen = ref(false)
const lightboxIndex = ref(0)
const galleryImages = ref<Array<{ src: string; alt?: string }>>([])

function updateGalleryImages() {
  if (!post.value) {
    galleryImages.value = []
    return
  }
  const list: Array<{ src: string; alt?: string }> = []
  if (post.value.coverImage) {
    list.push({ src: post.value.coverImage, alt: post.value.title || 'Ảnh bìa' })
  }
  if (typeof document !== 'undefined') {
    const proseImgs = document.querySelectorAll('.post-prose-content img')
    proseImgs.forEach((imgEl) => {
      const src = (imgEl as HTMLImageElement).getAttribute('src') || (imgEl as HTMLImageElement).src
      const alt = (imgEl as HTMLImageElement).alt || ''
      if (src && !list.some((item) => item.src === src)) {
        list.push({ src, alt })
      }
    })
  }
  galleryImages.value = list
}

function handleOpenLightbox(index: number = 0) {
  updateGalleryImages()
  lightboxIndex.value = Math.max(0, Math.min(index, galleryImages.value.length - 1))
  isLightboxOpen.value = true
}

function handleProseClick(e: MouseEvent) {
  const target = e.target as HTMLElement
  if (target && target.tagName === 'IMG') {
    const img = target as HTMLImageElement
    const src = img.getAttribute('src') || img.src

    // Check if the clicked image belongs to a section's inline Collage Gallery
    const inlineGallery = img.closest('.post-inline-gallery')
    if (inlineGallery) {
      const groupImgs = Array.from(inlineGallery.querySelectorAll('img'))
      const groupList = groupImgs
        .map((el) => ({
          src: el.getAttribute('src') || el.src,
          alt: el.alt || post.value?.title || 'Ảnh bài viết'
        }))
        .filter((item) => Boolean(item.src))

      if (groupList.length > 0) {
        galleryImages.value = groupList
        const idx = groupList.findIndex((item) => item.src === src)
        lightboxIndex.value = idx !== -1 ? idx : 0
        isLightboxOpen.value = true
        return
      }
    }

    // Standalone image: open with all article images
    updateGalleryImages()
    const foundIdx = galleryImages.value.findIndex((item) => item.src === src)
    if (foundIdx !== -1) {
      handleOpenLightbox(foundIdx)
    } else {
      galleryImages.value.push({ src, alt: img.alt || '' })
      lightboxIndex.value = galleryImages.value.length - 1
      isLightboxOpen.value = true
    }
  }
}
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
        <PostDetailHeader :post="post" :user="user" @open-lightbox="handleOpenLightbox" />

        <!-- AI TextRank Summarization Block -->
        <PostAiSummary v-if="(post.status || 'published').toLowerCase() === 'published'" :postId="post.id" />

        <!-- Content -->
        <div class="bg-white dark:bg-surface-800 rounded-2xl border border-gray-200 dark:border-surface-700 p-4 sm:p-8 mb-6 overflow-hidden">
          <div
            class="post-prose-content prose prose-lg dark:prose-invert max-w-none wrap-break-word
              prose-headings:text-gray-900 dark:prose-headings:text-white prose-headings:font-bold
              prose-p:text-gray-600 dark:prose-p:text-gray-300 prose-p:leading-relaxed
              prose-a:text-primary-500 prose-a:no-underline hover:prose-a:underline
              prose-code:bg-gray-100 dark:prose-code:bg-surface-700 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:wrap-break-word
              prose-pre:bg-gray-900 dark:prose-pre:bg-surface-900 prose-pre:rounded-xl prose-pre:border prose-pre:border-gray-200 dark:prose-pre:border-surface-700 prose-pre:overflow-x-auto prose-pre:max-w-full
              prose-blockquote:border-primary-500 prose-blockquote:bg-primary-50 dark:prose-blockquote:bg-primary-900/10 prose-blockquote:rounded-r-xl prose-blockquote:py-1 prose-blockquote:not-italic
              prose-li:text-gray-600 dark:prose-li:text-gray-300
              prose-strong:text-gray-900 dark:prose-strong:text-white"
            @click="handleProseClick"
            v-html="formattedPostContent"
          ></div>

          <!-- Tags -->
          <div class="flex flex-wrap gap-2 mt-8 pt-6 border-t border-gray-200 dark:border-surface-700">
            <span
              v-for="tag in post.tags"
              :key="tag"
              @click="router.push(`/tags/${encodeURIComponent(tag)}`)"
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
          :userVote="userVote"
          :currentUserReaction="currentUserReaction"
          :activeEmojiPicker="activeEmojiPicker"
          :emojiList="emojiList"
          @upvote="handleUpvote"
          @downvote="handleDownvote"
          @toggleBookmark="toggleBookmark"
          @toggleEmojiPicker="toggleEmojiPicker"
          @toggleReaction="toggleReaction"
          @report="handleOpenReport"
          @scrollToComments="scrollToComments"
        />

        <!-- Comments Section -->
        <div id="comments-section">
          <PostComments
            :comments="comments"
            :user="user"
            :replyingTo="replyingTo"
            :activeEmojiPicker="activeEmojiPicker"
            @setReplyingTo="setReplyingTo"
            @clearReplyingTo="clearReplyingTo"
            @toggleEmojiPicker="toggleEmojiPicker"
            @addComment="addComment"
            @replyComment="replyComment"
            @deleteComment="deleteComment"
          />
        </div>
      </article>

      <!-- Sidebar -->
      <aside class="w-full lg:w-72 shrink-0 space-y-5 lg:sticky lg:top-6 lg:self-start">
        <!-- Author Card -->
        <PostAuthorCard :author="post.author" />

        <!-- Related Posts -->
        <RelatedPostsSidebar :posts="posts.filter(p => p.id !== post?.id)" />
      </aside>
    </div>
    
    <div v-else class="text-center py-20 bg-white dark:bg-surface-800 rounded-2xl border border-gray-200 dark:border-surface-700 p-8">
      <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-2">Không tìm thấy bài viết</h3>
      <p class="text-sm text-gray-500 dark:text-gray-400 mb-6">Bài viết này không tồn tại hoặc đã bị xóa khỏi hệ thống.</p>
      <button
        @click="router.push('/')"
        class="px-5 py-2.5 rounded-xl gradient-primary text-white text-sm font-semibold shadow-md shadow-primary-500/20 hover:opacity-90 transition-opacity cursor-pointer"
      >
        Về trang chủ
      </button>
    </div>

    <!-- Report Modal -->
    <ReportPostModal
      :show="showReportModal"
      @close="showReportModal = false"
      @submit="(reason, desc) => { reportPost(reason, desc); showReportModal = false }"
    />

    <!-- Image Lightbox Gallery Modal -->
    <ImageLightboxModal
      :show="isLightboxOpen"
      :images="galleryImages"
      :initialIndex="lightboxIndex"
      @close="isLightboxOpen = false"
    />
  </div>
</template>

<style>
.highlight-comment-target {
  outline: 2px solid #10b981 !important;
  outline-offset: 4px;
  background-color: rgba(16, 185, 129, 0.12) !important;
  border-radius: 1rem;
  transition: all 0.5s ease-in-out;
  animation: pulse-glow 1.5s ease-in-out infinite alternate;
}

@keyframes pulse-glow {
  0% {
    box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.4);
  }
  100% {
    box-shadow: 0 0 0 10px rgba(16, 185, 129, 0);
  }
}

.post-prose-content > img,
.post-prose-content p > img {
  cursor: zoom-in;
  border-radius: 0.75rem;
  transition: transform 0.25s ease, box-shadow 0.25s ease;
}

.post-prose-content > img:hover,
.post-prose-content p > img:hover {
  transform: scale(1.008);
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.15);
}
</style>
