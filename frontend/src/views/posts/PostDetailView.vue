<script setup lang="ts">
import { ref, computed } from 'vue'
import {
  ArrowUp, ArrowDown, Bookmark, BookmarkCheck, Share2, MessageCircle,
  Eye, Clock, MapPin, Flag, Heart, MoreHorizontal, Send, ChevronLeft,
  SmilePlus, X, Edit3
} from '@lucide/vue'
import UserAvatar from '@/components/UserAvatar.vue'
import { formatDate, formatNumber } from '@/utils/formatters'
import Skeleton from '@/components/ui/Skeleton.vue'
import { usePostDetail } from '@/composables/usePostDetail'
import { useCodeHighlight } from '@/composables/useCodeHighlight'
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
  isUpvoted,
  replyingTo,
  activeEmojiPicker,
  emojiList,
  toggleUpvote,
  toggleBookmark,
  toggleEmojiPicker,
  setReplyingTo,
  clearReplyingTo
} = usePostDetail()

const isFollowing = ref(false)
function toggleFollow() {
  isFollowing.value = !isFollowing.value
}

// Code syntax highlighting for post content
const postContent = computed(() => post.value?.content || null)
useCodeHighlight(postContent)


</script>

<template>
  <div class="mx-auto px-4 sm:px-6 lg:px-8 py-6">
    <!-- Back button -->
    <button
      @click="router.back()"
      class="flex items-center gap-2 text-sm text-gray-500 hover:text-primary-500 transition-colors mb-6"
    >
      <ChevronLeft :size="16" />
      Quay lại
    </button>

    <!-- Loading Skeleton -->
    <div v-if="isLoading" class="flex flex-col lg:flex-row gap-8 items-start">
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

    <div v-else-if="post" class="flex flex-col lg:flex-row gap-8 items-start">
      <!-- Article -->
      <article class="flex-1 min-w-0">
        <!-- Cover Image -->
        <div class="relative rounded-2xl overflow-hidden mb-6 h-64 sm:h-80">
          <img :src="post.coverImage" :alt="post.title" class="w-full h-full object-cover" />
          <div class="absolute inset-0 bg-linear-to-t from-black/60 to-transparent" />
          <div class="absolute bottom-6 left-6 right-6">
            <span class="inline-block px-3 py-1 rounded-lg text-xs font-semibold bg-white/90 text-gray-700 mb-3">
              {{ post.category.icon }} {{ post.category.name }}
            </span>
            <h1 class="text-2xl sm:text-3xl font-bold text-white">{{ post.title }}</h1>
          </div>
        </div>

        <!-- Author Info -->
        <div class="flex items-center justify-between mb-6 bg-white dark:bg-surface-800 rounded-2xl border border-gray-200 dark:border-surface-700 p-4">
          <div class="flex items-center gap-3">
            <UserAvatar :user="post.author" size="lg" class="ring-2 ring-primary-500/30 cursor-pointer" @click="router.push(`/profile/${post.author.id}`)" />
            <div>
              <p class="font-semibold text-gray-900 dark:text-white cursor-pointer hover:text-primary-500 transition-colors" @click="router.push(`/profile/${post.author.id}`)">{{ post.author.name }}</p>
              <div class="flex items-center gap-3 text-xs text-gray-400">
                <span class="flex items-center gap-1"><Clock :size="12" /> {{ formatDate(post.createdAt) }}</span>
                <span class="flex items-center gap-1"><Eye :size="12" /> {{ formatNumber(post.viewsCount) }} lượt xem</span>
                <span v-if="post.location" class="flex items-center gap-1"><MapPin :size="12" /> {{ post.location.address }}</span>
              </div>
            </div>
          </div>
          <!-- Edit button (only for own posts) -->
          <button
            v-if="user && user.id === post.author.id"
            @click="router.push(`/posts/${post.id}/edit`)"
            class="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-gray-500 hover:text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-500/10 border border-gray-200 dark:border-surface-700 transition-all"
          >
            <Edit3 :size="14" />
            <span class="hidden sm:inline">Chỉnh sửa</span>
          </button>
        </div>

        <!-- Content -->
        <div class="bg-white dark:bg-surface-800 rounded-2xl border border-gray-200 dark:border-surface-700 p-6 sm:p-8 mb-6">
          <div
            class="prose prose-lg dark:prose-invert max-w-none
              prose-headings:text-gray-900 dark:prose-headings:text-white prose-headings:font-bold
              prose-p:text-gray-600 dark:prose-p:text-gray-300 prose-p:leading-relaxed
              prose-a:text-primary-500 prose-a:no-underline hover:prose-a:underline
              prose-code:bg-gray-100 dark:prose-code:bg-surface-700 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded
              prose-pre:bg-gray-900 dark:prose-pre:bg-surface-900 prose-pre:rounded-xl prose-pre:border prose-pre:border-gray-200 dark:prose-pre:border-surface-700
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
        <div class="flex items-center justify-between bg-white dark:bg-surface-800 rounded-2xl border border-gray-200 dark:border-surface-700 p-4 mb-6 sticky bottom-4 shadow-lg">
          <div class="flex items-center gap-1">
            <button
              @click="toggleUpvote"
              :class="[
                'flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200',
                isUpvoted ? 'bg-primary-500/10 text-primary-500' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-surface-700'
              ]"
            >
              <ArrowUp :size="18" />
              <span>{{ formatNumber(post.upvotesCount + (isUpvoted ? 1 : 0)) }}</span>
            </button>
            <button class="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium text-gray-500 hover:bg-gray-100 dark:hover:bg-surface-700 transition-all">
              <ArrowDown :size="18" />
            </button>
          </div>

          <div class="flex items-center gap-1">
            <button class="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium text-gray-500 hover:bg-gray-100 dark:hover:bg-surface-700 transition-all">
              <MessageCircle :size="18" />
              <span class="hidden sm:inline">{{ post.commentsCount }}</span>
            </button>
            <button
              @click="toggleBookmark"
              :class="[
                'flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200',
                isBookmarked ? 'bg-amber-500/10 text-amber-500' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-surface-700'
              ]"
            >
              <BookmarkCheck v-if="isBookmarked" :size="18" />
              <Bookmark v-else :size="18" />
              <span class="hidden sm:inline">Lưu</span>
            </button>
            <button class="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium text-gray-500 hover:bg-gray-100 dark:hover:bg-surface-700 transition-all">
              <Share2 :size="18" />
              <span class="hidden sm:inline">Chia sẻ</span>
            </button>
            <button class="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium text-gray-500 hover:bg-gray-100 dark:hover:bg-surface-700 transition-all">
              <Flag :size="18" />
            </button>
          </div>
        </div>

        <!-- Comments Section -->
        <div class="bg-white dark:bg-surface-800 rounded-2xl border border-gray-200 dark:border-surface-700 p-6">
          <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <MessageCircle :size="20" class="text-primary-500" />
            Bình luận ({{ comments.length }})
          </h3>

          <!-- Comment Input -->
          <div class="mb-6">
            <!-- Replying To Banner -->
            <div v-if="replyingTo" class="flex items-center justify-between px-4 py-2 mb-2 bg-primary-50 dark:bg-primary-900/20 rounded-xl border border-primary-200 dark:border-primary-800">
              <p class="text-sm text-primary-600 dark:text-primary-400">
                Đang trả lời <span class="font-semibold">@{{ replyingTo.authorName }}</span>
              </p>
              <button @click="clearReplyingTo" class="text-primary-400 hover:text-primary-600 transition-colors">
                <X :size="16" />
              </button>
            </div>
            <div class="flex items-start gap-3">
              <UserAvatar v-if="user" :user="user" size="sm" class="shrink-0" />
              <div v-else class="w-9 h-9 rounded-full bg-gray-200 dark:bg-surface-700 shrink-0"></div>
              <div class="flex-1 relative">
                <textarea
                  v-model="newComment"
                  :placeholder="replyingTo ? `Trả lời @${replyingTo.authorName}...` : 'Viết bình luận...'"
                  rows="3"
                  class="w-full p-3 pr-12 bg-gray-50 dark:bg-surface-700 border border-gray-200 dark:border-surface-600 rounded-xl text-sm text-gray-700 dark:text-gray-300 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500/50 resize-none transition-all"
                />
                <button class="absolute bottom-3 right-3 p-2 rounded-lg gradient-primary text-white hover:opacity-90 transition-all">
                  <Send :size="14" />
                </button>
              </div>
            </div>
          </div>

          <!-- Comments List -->
          <div class="space-y-5">
            <div v-for="comment in comments" :key="comment.id" class="animate-slide-up">
              <!-- Main Comment (Level 0) -->
              <div class="flex items-start gap-3">
                <UserAvatar :user="comment.author" size="md" class="shrink-0" />
                <div class="flex-1">
                  <div class="bg-gray-50 dark:bg-surface-700 rounded-2xl p-4">
                    <div class="flex items-center justify-between mb-1">
                      <span class="text-sm font-semibold text-gray-900 dark:text-white">{{ comment.author.name }}</span>
                      <span class="text-xs text-gray-400">{{ formatDate(comment.createdAt) }}</span>
                    </div>
                    <p class="text-sm text-gray-600 dark:text-gray-300">{{ comment.content }}</p>
                  </div>
                  <!-- Actions: Reactions + Reply -->
                  <div class="flex items-center gap-3 mt-2 ml-2">
                    <!-- Emoji Reactions -->
                    <div class="flex items-center gap-1">
                      <button
                        v-for="reaction in comment.reactions"
                        :key="reaction.emoji"
                        :class="[
                          'flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium transition-all border',
                          reaction.reacted
                            ? 'bg-primary-50 dark:bg-primary-900/20 border-primary-300 dark:border-primary-700 text-primary-600 dark:text-primary-400'
                            : 'bg-gray-50 dark:bg-surface-600 border-gray-200 dark:border-surface-500 text-gray-500 hover:bg-gray-100 dark:hover:bg-surface-500'
                        ]"
                      >
                        {{ reaction.emoji }} {{ reaction.count }}
                      </button>
                    </div>
                    <!-- Add Reaction Button -->
                    <div class="relative">
                      <button
                        @click="toggleEmojiPicker(comment.id)"
                        class="flex items-center gap-1 text-xs text-gray-400 hover:text-primary-500 transition-colors"
                      >
                        <SmilePlus :size="14" />
                      </button>
                      <!-- Emoji Picker Popup -->
                      <div v-if="activeEmojiPicker === comment.id" class="absolute left-0 bottom-7 z-50 bg-white dark:bg-surface-800 rounded-xl shadow-xl border border-gray-200 dark:border-surface-700 p-2 flex gap-1">
                        <button
                          v-for="emoji in emojiList"
                          :key="emoji"
                          @click="activeEmojiPicker = null"
                          class="w-8 h-8 rounded-lg hover:bg-gray-100 dark:hover:bg-surface-700 flex items-center justify-center text-base transition-colors"
                        >
                          {{ emoji }}
                        </button>
                      </div>
                    </div>
                    <button @click="setReplyingTo(comment.id, comment.author.name)" class="text-xs font-semibold text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors">
                      Phản hồi
                    </button>
                  </div>

                  <!-- Replies (Level 1 + Level 2 flatten) -->
                  <div v-if="comment.replies.length > 0" class="ml-6 mt-3 space-y-3 border-l-2 border-gray-100 dark:border-surface-600 pl-4">
                    <div v-for="reply in comment.replies" :key="reply.id" class="flex items-start gap-3">
                      <UserAvatar :user="reply.author" size="sm" class="shrink-0" />
                      <div class="flex-1">
                        <div class="bg-gray-50 dark:bg-surface-700/50 rounded-xl p-3">
                          <div class="flex items-center justify-between mb-1">
                            <span class="text-sm font-semibold text-gray-900 dark:text-white">{{ reply.author.name }}</span>
                            <span class="text-xs text-gray-400">{{ formatDate(reply.createdAt) }}</span>
                          </div>
                          <p class="text-sm text-gray-600 dark:text-gray-300">
                            <span v-if="reply.replyTo" class="text-primary-500 font-medium cursor-pointer hover:underline">@{{ reply.replyTo }} </span>
                            {{ reply.content }}
                          </p>
                        </div>
                        <!-- Reply Actions -->
                        <div class="flex items-center gap-3 mt-1.5 ml-2">
                          <div class="flex items-center gap-1">
                            <button
                              v-for="reaction in reply.reactions"
                              :key="reaction.emoji"
                              :class="[
                                'flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium transition-all border',
                                reaction.reacted
                                  ? 'bg-primary-50 dark:bg-primary-900/20 border-primary-300 dark:border-primary-700 text-primary-600 dark:text-primary-400'
                                  : 'bg-gray-50 dark:bg-surface-600 border-gray-200 dark:border-surface-500 text-gray-500 hover:bg-gray-100 dark:hover:bg-surface-500'
                              ]"
                            >
                              {{ reaction.emoji }} {{ reaction.count }}
                            </button>
                          </div>
                          <div class="relative">
                            <button
                              @click="activeEmojiPicker = activeEmojiPicker === reply.id ? null : reply.id"
                              class="flex items-center gap-1 text-xs text-gray-400 hover:text-primary-500 transition-colors"
                            >
                              <SmilePlus :size="14" />
                            </button>
                            <div v-if="activeEmojiPicker === reply.id" class="absolute left-0 bottom-7 z-50 bg-white dark:bg-surface-800 rounded-xl shadow-xl border border-gray-200 dark:border-surface-700 p-2 flex gap-1">
                              <button
                                v-for="emoji in emojiList"
                                :key="emoji"
                                @click="activeEmojiPicker = null"
                                class="w-8 h-8 rounded-lg hover:bg-gray-100 dark:hover:bg-surface-700 flex items-center justify-center text-base transition-colors"
                              >
                                {{ emoji }}
                              </button>
                            </div>
                          </div>
                          <button
                            @click="replyingTo = { commentId: comment.id, authorName: reply.author.name }"
                            class="text-xs text-gray-400 hover:text-primary-500 transition-colors font-medium"
                          >
                            Phản hồi
                          </button>
                        </div>

                        <!-- Sub-replies (Level 3) -->
                        <div v-if="reply.replies && reply.replies.length > 0" class="ml-5 mt-3 space-y-3 border-l-2 border-gray-100 dark:border-surface-600 pl-3">
                          <div v-for="subReply in reply.replies" :key="subReply.id" class="flex items-start gap-2">
                            <UserAvatar :user="subReply.author" size="sm" class="shrink-0 w-6! h-6!" />
                            <div class="flex-1">
                              <div class="bg-gray-50 dark:bg-surface-700/30 rounded-lg p-2.5">
                                <div class="flex items-center justify-between mb-0.5">
                                  <span class="text-xs font-semibold text-gray-900 dark:text-white">{{ subReply.author.name }}</span>
                                  <span class="text-xs text-gray-400">{{ formatDate(subReply.createdAt) }}</span>
                                </div>
                                <p class="text-xs text-gray-600 dark:text-gray-300">
                                  <span v-if="subReply.replyTo" class="text-primary-500 font-medium cursor-pointer hover:underline">@{{ subReply.replyTo }} </span>
                                  {{ subReply.content }}
                                </p>
                              </div>
                              <div class="flex items-center gap-3 mt-1 ml-1">
                                <div class="flex items-center gap-1">
                                  <button
                                    v-for="reaction in subReply.reactions"
                                    :key="reaction.emoji"
                                    :class="[
                                      'flex items-center gap-1 px-1.5 py-0.5 rounded-full text-xs font-medium transition-all border',
                                      reaction.reacted
                                        ? 'bg-primary-50 dark:bg-primary-900/20 border-primary-300 dark:border-primary-700 text-primary-600 dark:text-primary-400'
                                        : 'bg-gray-50 dark:bg-surface-600 border-gray-200 dark:border-surface-500 text-gray-500 hover:bg-gray-100 dark:hover:bg-surface-500'
                                    ]"
                                  >
                                    {{ reaction.emoji }} {{ reaction.count }}
                                  </button>
                                </div>
                                <button
                                  @click="replyingTo = { commentId: comment.id, authorName: subReply.author.name }"
                                  class="text-xs text-gray-400 hover:text-primary-500 transition-colors font-medium"
                                >
                                  Phản hồi
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </article>

      <!-- Sidebar -->
      <aside class="w-full lg:w-72 shrink-0 space-y-5 lg:sticky lg:top-6 lg:self-start">
        <!-- Author Card -->
        <div class="bg-white dark:bg-surface-800 rounded-2xl border border-gray-200 dark:border-surface-700 p-5 text-center">
          <UserAvatar :user="post.author" size="lg" class="mx-auto ring-3 ring-primary-500/20 mb-3" />
          <h4 class="font-bold text-gray-900 dark:text-white">{{ post.author.name }}</h4>
          <p class="text-xs text-gray-400 mt-1 mb-3">{{ post.author.bio }}</p>
          <div class="flex justify-center gap-4 text-center mb-4">
            <div>
              <p class="text-lg font-bold text-gray-900 dark:text-white">{{ post.author.postsCount }}</p>
              <p class="text-xs text-gray-400">Bài viết</p>
            </div>
            <div>
              <p class="text-lg font-bold text-gray-900 dark:text-white">{{ formatNumber(post.author.followersCount) }}</p>
              <p class="text-xs text-gray-400">Followers</p>
            </div>
          </div>
          <button
            @click="toggleFollow"
            :class="[
              'w-full py-2 rounded-xl text-sm font-medium transition-all',
              isFollowing
                ? 'bg-gray-100 dark:bg-surface-700 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-surface-600 hover:border-red-300 hover:text-red-500 dark:hover:text-red-400'
                : 'text-white gradient-primary hover:opacity-90 shadow-lg shadow-primary-500/25'
            ]"
          >
            {{ isFollowing ? '✓ Đang theo dõi' : 'Theo dõi' }}
          </button>
        </div>

        <!-- Related Posts -->
        <div class="bg-white dark:bg-surface-800 rounded-2xl border border-gray-200 dark:border-surface-700 p-5">
          <h4 class="font-bold text-gray-900 dark:text-white mb-4">Bài viết liên quan</h4>
          <div class="space-y-3">
            <div
              v-for="p in posts.slice(0, 3)"
              :key="p.id"
              @click="router.push(`/posts/${p.id}`)"
              class="flex items-start gap-3 cursor-pointer group"
            >
              <img :src="p.coverImage" class="w-16 h-12 rounded-lg object-cover shrink-0" />
              <div>
                <p class="text-sm font-medium text-gray-700 dark:text-gray-300 line-clamp-2 group-hover:text-primary-500 transition-colors">
                  {{ p.title }}
                </p>
                <p class="text-xs text-gray-400 mt-1">{{ formatDate(p.createdAt) }}</p>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </div>
    
    <div v-else class="text-center py-20 text-gray-500">
      Đang tải bài viết...
    </div>
  </div>
</template>
