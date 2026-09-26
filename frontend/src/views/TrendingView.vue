<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { TrendingUp, Eye, ArrowUpRight, Hash, Star, Loader2, CheckCircle } from '@lucide/vue'
import PostCard from '@/components/PostCard.vue'
import CategoryTabs from '@/components/CategoryTabs.vue'
import Skeleton from '@/components/ui/Skeleton.vue'
import TrendingSidebar from './components/TrendingSidebar.vue'
import { useTrendingPosts } from '@/composables/posts/useTrendingPosts'
import { formatNumber } from '@/utils/formatters'

const router = useRouter()

const {
  tags,
  users,
  isLoading,
  sidebarLoading,
  selectedCategory,
  loadingMore,
  trendingPosts,
  hasMore,
  totalViews,
  totalUpvotes,
  loadMore,
  toggleBookmark
} = useTrendingPosts()
</script>

<template>
  <div class="mx-auto px-4 sm:px-6 lg:px-8 py-6">
    <div class="flex flex-col lg:flex-row gap-6">
      <!-- Main Content -->
      <div class="flex-1 min-w-0">
        <!-- Trending Banner -->
        <div class="relative overflow-hidden rounded-2xl bg-linear-to-r from-orange-500 via-red-500 to-pink-500 p-6 sm:p-8 mb-6 shadow-xl">
          <div class="relative z-10">
            <div class="flex items-center gap-2 mb-3">
              <TrendingUp :size="20" class="text-orange-200" />
              <span class="text-orange-100 text-sm font-medium">Nội dung nổi bật</span>
            </div>
            <h1 class="text-2xl sm:text-3xl font-bold text-white mb-2">
              Thịnh hành 🔥
            </h1>
            <p class="text-orange-100 text-sm sm:text-base max-w-lg mb-4">
              Những bài viết được cộng đồng yêu thích và tương tác nhiều nhất
            </p>
            <!-- Stats -->
            <div class="flex items-center gap-6">
              <div class="flex items-center gap-2">
                <Eye :size="16" class="text-orange-200" />
                <span class="text-white text-sm font-medium">{{ totalViews.toLocaleString() }} lượt xem</span>
              </div>
              <div class="flex items-center gap-2">
                <ArrowUpRight :size="16" class="text-orange-200" />
                <span class="text-white text-sm font-medium">{{ totalUpvotes.toLocaleString() }} lượt vote</span>
              </div>
            </div>
          </div>
          <!-- Decorative shapes -->
          <div class="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div class="absolute bottom-0 right-20 w-24 h-24 bg-white/5 rounded-full translate-y-1/2" />
          <div class="absolute top-1/2 right-10 w-16 h-16 bg-white/5 rounded-full" />
        </div>

        <!-- Categories -->
        <CategoryTabs v-model="selectedCategory" class="mb-6" />

        <!-- Feed -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 stagger-children">
          <template v-if="isLoading">
            <div v-for="i in 4" :key="i" class="bg-white dark:bg-surface-800 rounded-2xl overflow-hidden border border-gray-200 dark:border-surface-700">
              <Skeleton type="image" class="w-full h-48 shrink-0" rounded="rounded-none" />
              <div class="p-5 space-y-4">
                <div class="flex items-center gap-3">
                  <Skeleton type="avatar" width="w-8" height="h-8" />
                  <Skeleton type="text" width="w-24" />
                </div>
                <div class="space-y-2">
                  <Skeleton type="title" width="w-full" height="h-7" />
                  <Skeleton type="text" width="w-full" />
                  <Skeleton type="text" width="w-2/3" />
                </div>
              </div>
            </div>
          </template>
          
          <template v-else>
            <!-- Thêm badge thứ hạng cho 3 bài đầu -->
            <div v-for="(post, index) in trendingPosts" :key="post.id" class="relative">
              <div
                v-if="index < 3"
                :class="[
                  'absolute -top-2 -left-2 z-10 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-lg',
                  index === 0 ? 'bg-linear-to-br from-yellow-400 to-amber-500' :
                  index === 1 ? 'bg-linear-to-br from-gray-300 to-gray-400' :
                  'bg-linear-to-br from-orange-400 to-orange-600'
                ]"
              >
                {{ index + 1 }}
              </div>
              <PostCard
                :post="post"
                @toggle-bookmark="toggleBookmark"
                @click="router.push(`/posts/${post.id}`)"
                class="cursor-pointer transition-transform hover:-translate-y-1"
              />
            </div>
          </template>
        </div>

        <!-- Load More -->
        <div class="flex justify-center mt-8">
          <button
            v-if="hasMore"
            @click="loadMore"
            :disabled="loadingMore"
            class="px-6 py-3 rounded-xl text-sm font-medium text-primary-500 border border-primary-500/30 hover:bg-primary-500/10 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Loader2 v-if="loadingMore" :size="16" class="animate-spin" />
            {{ loadingMore ? 'Đang tải...' : 'Xem thêm bài viết' }}
          </button>
          <div v-else-if="!isLoading && trendingPosts.length > 0" class="flex items-center gap-2 text-sm text-gray-400 dark:text-gray-500">
            <CheckCircle :size="16" />
            Đã hiển thị tất cả bài viết
          </div>
        </div>
      </div>

      <!-- Right Sidebar -->
      <TrendingSidebar :tags="tags" :users="users" :sidebar-loading="sidebarLoading" />
    </div>
  </div>
</template>
