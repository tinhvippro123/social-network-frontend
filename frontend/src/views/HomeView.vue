<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import {
  TrendingUp, Eye, MessageCircle, ArrowUp, Bookmark,
  BookmarkCheck, Clock, Filter, ChevronRight, Flame, Star, Hash
} from '@lucide/vue'
import { mockPosts, mockCategories, popularTags, mockUsers } from '@/data/mockData'

const router = useRouter()
const selectedCategory = ref('all')
const viewMode = ref<'grid' | 'list'>('grid')

const filteredPosts = computed(() => {
  if (selectedCategory.value === 'all') return mockPosts
  return mockPosts.filter(p => p.category.slug === selectedCategory.value)
})

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr)
  const now = new Date()
  const diffHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
  if (diffHours < 1) return 'Vừa xong'
  if (diffHours < 24) return `${diffHours} giờ trước`
  const diffDays = Math.floor(diffHours / 24)
  if (diffDays < 7) return `${diffDays} ngày trước`
  return date.toLocaleDateString('vi-VN')
}

const formatNumber = (num: number) => {
  if (num >= 1000) return `${(num / 1000).toFixed(1)}k`
  return num.toString()
}

const toggleBookmark = (postId: string) => {
  const post = mockPosts.find(p => p.id === postId)
  if (post) post.bookmarked = !post.bookmarked
}
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
    <div class="flex flex-col lg:flex-row gap-6">
      <!-- Main Content -->
      <div class="flex-1 min-w-0">
        <!-- Hero Banner -->
        <div class="relative overflow-hidden rounded-2xl gradient-primary p-6 sm:p-8 mb-6 shadow-xl glow">
          <div class="relative z-10">
            <div class="flex items-center gap-2 mb-3">
              <Flame :size="20" class="text-amber-300" />
              <span class="text-primary-100 text-sm font-medium">Chào mừng đến VietBlog</span>
            </div>
            <h1 class="text-2xl sm:text-3xl font-bold text-white mb-2">
              Khám phá & Chia sẻ kiến thức
            </h1>
            <p class="text-primary-100 text-sm sm:text-base max-w-lg">
              Nơi cộng đồng developer Việt Nam cùng nhau học hỏi, chia sẻ kinh nghiệm và phát triển kỹ năng.
            </p>
          </div>
          <!-- Decorative shapes -->
          <div class="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div class="absolute bottom-0 right-20 w-24 h-24 bg-white/5 rounded-full translate-y-1/2" />
        </div>

        <!-- Category Tabs -->
        <div class="flex items-center gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
          <button
            @click="selectedCategory = 'all'"
            :class="[
              'shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200',
              selectedCategory === 'all'
                ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/25'
                : 'bg-white dark:bg-surface-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-surface-700 border border-gray-200 dark:border-surface-700'
            ]"
          >
            <span class="flex items-center gap-1.5">
              <Flame :size="14" />
              Tất cả
            </span>
          </button>
          <button
            v-for="cat in mockCategories"
            :key="cat.id"
            @click="selectedCategory = cat.slug"
            :class="[
              'shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200',
              selectedCategory === cat.slug
                ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/25'
                : 'bg-white dark:bg-surface-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-surface-700 border border-gray-200 dark:border-surface-700'
            ]"
          >
            <span class="flex items-center gap-1.5">
              <span>{{ cat.icon }}</span>
              {{ cat.name }}
            </span>
          </button>
        </div>

        <!-- Posts Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-5 stagger-children">
          <article
            v-for="post in filteredPosts"
            :key="post.id"
            @click="router.push(`/posts/${post.id}`)"
            class="group bg-white dark:bg-surface-800 rounded-2xl overflow-hidden border border-gray-200 dark:border-surface-700 hover:border-primary-500/30 dark:hover:border-primary-500/30 hover:shadow-xl hover:shadow-primary-500/5 transition-all duration-300 cursor-pointer"
          >
            <!-- Cover Image -->
            <div class="relative overflow-hidden h-48">
              <img
                :src="post.coverImage"
                :alt="post.title"
                class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div class="absolute inset-0 bg-linear-to-t from-black/50 to-transparent" />
              <!-- Category badge -->
              <span class="absolute top-3 left-3 px-3 py-1 rounded-lg text-xs font-semibold bg-white/90 dark:bg-surface-800/90 backdrop-blur-sm text-gray-700 dark:text-gray-300">
                {{ post.category.icon }} {{ post.category.name }}
              </span>
              <!-- Bookmark -->
              <button
                @click.stop="toggleBookmark(post.id)"
                class="absolute top-3 right-3 p-2 rounded-lg bg-white/90 dark:bg-surface-800/90 backdrop-blur-sm text-gray-600 dark:text-gray-400 hover:text-primary-500 transition-colors"
              >
                <BookmarkCheck v-if="post.bookmarked" :size="16" class="text-primary-500" />
                <Bookmark v-else :size="16" />
              </button>
            </div>

            <!-- Content -->
            <div class="p-5">
              <!-- Author -->
              <div class="flex items-center gap-2 mb-3">
                <img :src="post.author.avatar" class="w-7 h-7 rounded-full" />
                <span class="text-sm font-medium text-gray-700 dark:text-gray-300">{{ post.author.name }}</span>
                <span class="text-gray-300 dark:text-surface-600">·</span>
                <span class="text-xs text-gray-400 flex items-center gap-1">
                  <Clock :size="12" />
                  {{ formatDate(post.createdAt) }}
                </span>
              </div>

              <!-- Title -->
              <h2 class="text-lg font-bold text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-primary-500 transition-colors">
                {{ post.title }}
              </h2>

              <!-- Excerpt -->
              <p class="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-4">
                {{ post.excerpt }}
              </p>

              <!-- Tags -->
              <div class="flex flex-wrap gap-1.5 mb-4">
                <span
                  v-for="tag in post.tags.slice(0, 3)"
                  :key="tag"
                  class="px-2 py-0.5 rounded-md text-xs font-medium bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400"
                >
                  #{{ tag }}
                </span>
              </div>

              <!-- Stats -->
              <div class="flex items-center gap-4 text-gray-400 text-sm">
                <span class="flex items-center gap-1">
                  <ArrowUp :size="14" :class="post.upvoted ? 'text-primary-500' : ''" />
                  {{ formatNumber(post.upvotesCount) }}
                </span>
                <span class="flex items-center gap-1">
                  <MessageCircle :size="14" />
                  {{ post.commentsCount }}
                </span>
                <span class="flex items-center gap-1">
                  <Eye :size="14" />
                  {{ formatNumber(post.viewsCount) }}
                </span>
              </div>
            </div>
          </article>
        </div>

        <!-- Load More -->
        <div class="flex justify-center mt-8">
          <button class="px-6 py-3 rounded-xl text-sm font-medium text-primary-500 border border-primary-500/30 hover:bg-primary-500/10 transition-all duration-200">
            Xem thêm bài viết
          </button>
        </div>
      </div>

      <!-- Right Sidebar -->
      <aside class="w-full lg:w-80 shrink-0 space-y-5">
        <!-- Trending Posts -->
        <div class="bg-white dark:bg-surface-800 rounded-2xl border border-gray-200 dark:border-surface-700 p-5">
          <h3 class="flex items-center gap-2 text-base font-bold text-gray-900 dark:text-white mb-4">
            <TrendingUp :size="18" class="text-primary-500" />
            Thịnh hành
          </h3>
          <div class="space-y-4">
            <div
              v-for="(post, i) in mockPosts.slice(0, 5)"
              :key="post.id"
              @click="router.push(`/posts/${post.id}`)"
              class="flex items-start gap-3 cursor-pointer group"
            >
              <span class="text-2xl font-black text-gray-200 dark:text-surface-600 group-hover:text-primary-500 transition-colors shrink-0 w-7">
                {{ String(i + 1).padStart(2, '0') }}
              </span>
              <div>
                <p class="text-sm font-semibold text-gray-700 dark:text-gray-300 line-clamp-2 group-hover:text-primary-500 transition-colors">
                  {{ post.title }}
                </p>
                <div class="flex items-center gap-2 mt-1 text-xs text-gray-400">
                  <span>{{ post.author.name }}</span>
                  <span>·</span>
                  <span class="flex items-center gap-0.5">
                    <ArrowUp :size="10" /> {{ formatNumber(post.upvotesCount) }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Popular Tags -->
        <div class="bg-white dark:bg-surface-800 rounded-2xl border border-gray-200 dark:border-surface-700 p-5">
          <h3 class="flex items-center gap-2 text-base font-bold text-gray-900 dark:text-white mb-4">
            <Hash :size="18" class="text-primary-500" />
            Tags phổ biến
          </h3>
          <div class="flex flex-wrap gap-2">
            <span
              v-for="tag in popularTags"
              :key="tag"
              class="px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-100 dark:bg-surface-700 text-gray-600 dark:text-gray-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 hover:text-primary-500 cursor-pointer transition-colors"
            >
              #{{ tag }}
            </span>
          </div>
        </div>

        <!-- Top Authors -->
        <div class="bg-white dark:bg-surface-800 rounded-2xl border border-gray-200 dark:border-surface-700 p-5">
          <h3 class="flex items-center gap-2 text-base font-bold text-gray-900 dark:text-white mb-4">
            <Star :size="18" class="text-amber-400" />
            Tác giả nổi bật
          </h3>
          <div class="space-y-3">
            <div
              v-for="user in mockUsers.slice(0, 4)"
              :key="user.id"
              @click="router.push(`/profile/${user.id}`)"
              class="flex items-center gap-3 cursor-pointer group"
            >
              <img :src="user.avatar" class="w-10 h-10 rounded-full ring-2 ring-transparent group-hover:ring-primary-500/30 transition-all" />
              <div class="flex-1 min-w-0">
                <p class="text-sm font-semibold text-gray-700 dark:text-gray-300 group-hover:text-primary-500 transition-colors truncate">
                  {{ user.name }}
                </p>
                <p class="text-xs text-gray-400">{{ user.postsCount }} bài viết</p>
              </div>
              <button class="px-3 py-1 rounded-lg text-xs font-medium border border-primary-500/30 text-primary-500 hover:bg-primary-500 hover:text-white transition-all duration-200">
                Theo dõi
              </button>
            </div>
          </div>
        </div>
      </aside>
    </div>
  </div>
</template>
