<script setup lang="ts">
import { useRouter } from 'vue-router'
import { TrendingUp } from '@lucide/vue'
import PostCard from '@/components/PostCard.vue'
import CategoryTabs from '@/components/CategoryTabs.vue'
import PostSkeletonCard from '@/components/posts/PostSkeletonCard.vue'
import TrendingSidebar from './components/TrendingSidebar.vue'
import TrendingHeroBanner from './components/TrendingHeroBanner.vue'
import TrendingRankBadge from './components/TrendingRankBadge.vue'
import LoadMoreButton from '@/components/ui/LoadMoreButton.vue'
import { useTrendingPosts } from '@/composables/posts/useTrendingPosts'

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
        <TrendingHeroBanner 
          :total-views="totalViews" 
          :total-upvotes="totalUpvotes" 
        />

        <!-- Categories -->
        <CategoryTabs v-model="selectedCategory" class="mb-6" />

        <!-- Feed -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 stagger-children">
          <template v-if="isLoading">
            <PostSkeletonCard v-for="i in 4" :key="i" />
          </template>
          
          <template v-else-if="trendingPosts.length > 0">
            <!-- Thêm badge thứ hạng cho 3 bài đầu -->
            <div v-for="(post, index) in trendingPosts" :key="post.id" class="relative">
              <TrendingRankBadge :rank="index + 1" />
              <PostCard
                :post="post"
                @toggle-bookmark="toggleBookmark"
                @click="router.push(`/posts/${post.id}`)"
                class="cursor-pointer transition-transform hover:-translate-y-1"
              />
            </div>
          </template>

          <div v-else class="col-span-full bg-white dark:bg-surface-800 rounded-2xl border border-gray-200 dark:border-surface-700 p-12 text-center">
            <TrendingUp class="w-12 h-12 text-gray-300 dark:text-surface-600 mx-auto mb-3" />
            <h3 class="text-base font-bold text-gray-900 dark:text-white mb-1">Chưa có bài viết thịnh hành trong danh mục này</h3>
            <p class="text-sm text-gray-500 dark:text-gray-400 mb-4">Hãy chọn danh mục khác hoặc khám phá toàn bộ bài viết nổi bật.</p>
            <button
              v-if="selectedCategory !== 'all'"
              type="button"
              @click="selectedCategory = 'all'"
              class="px-4 py-2 rounded-xl text-sm font-medium bg-primary-500 text-white hover:bg-primary-600 transition-colors cursor-pointer"
            >
              Xem tất cả danh mục
            </button>
          </div>
        </div>

        <!-- Load More -->
        <LoadMoreButton 
          :has-more="hasMore" 
          :is-loading="isLoading" 
          :loading-more="loadingMore" 
          :item-count="trendingPosts.length" 
          @load-more="loadMore" 
        />
      </div>

      <!-- Right Sidebar -->
      <TrendingSidebar :tags="tags" :users="users" :sidebar-loading="sidebarLoading" />
    </div>
  </div>
</template>
