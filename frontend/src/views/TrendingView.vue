<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { TrendingUp, Eye, ArrowUpRight, Hash, Star, Loader2, CheckCircle } from '@lucide/vue'
import PostCard from '@/components/PostCard.vue'
import CategoryTabs from '@/components/CategoryTabs.vue'
import PostSkeletonCard from '@/components/posts/PostSkeletonCard.vue'
import TrendingSidebar from './components/TrendingSidebar.vue'
import TrendingHeroBanner from './components/TrendingHeroBanner.vue'
import TrendingRankBadge from './components/TrendingRankBadge.vue'
import LoadMoreButton from '@/components/ui/LoadMoreButton.vue'
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
          
          <template v-else>
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
