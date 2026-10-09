<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { Flame, Loader2, CheckCircle } from '@lucide/vue'
import PostCard from '@/components/PostCard.vue'
import TrendingSidebar from '@/components/TrendingSidebar.vue'
import CategoryTabs from '@/components/CategoryTabs.vue'
import PostSkeletonCard from '@/components/posts/PostSkeletonCard.vue'
import HomeHeroBanner from './components/HomeHeroBanner.vue'
import LoadMoreButton from '@/components/ui/LoadMoreButton.vue'
import { useHomePosts } from '@/composables/posts/useHomePosts'

const router = useRouter()

const {
  categories,
  isLoading,
  selectedCategory,
  loadingMore,
  filteredPosts,
  hasMore,
  loadMore,
  toggleBookmark
} = useHomePosts()
</script>

<template>
  <div class="mx-auto px-4 sm:px-6 lg:px-8 py-6">
    <div class="flex flex-col lg:flex-row gap-6">
      <!-- Main Content -->
      <div class="flex-1 min-w-0">
        <!-- Hero Banner -->
        <HomeHeroBanner user-name="Lê Thanh Tình" />

        <!-- Categories -->
        <CategoryTabs v-model="selectedCategory" class="mb-6" />

        <!-- Feed -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 stagger-children">
          <template v-if="isLoading">
            <PostSkeletonCard v-for="i in 4" :key="i" />
          </template>
          
          <template v-else-if="filteredPosts.length > 0">
            <PostCard
              v-for="post in filteredPosts"
              :key="post.id"
              :post="post"
              @toggle-bookmark="toggleBookmark"
              @click="router.push(`/posts/${post.id}`)"
              class="cursor-pointer transition-transform hover:-translate-y-1"
            />
          </template>
          
          <!-- Empty State -->
          <div v-else class="col-span-1 lg:col-span-2 flex flex-col items-center justify-center py-16 text-center bg-white dark:bg-surface-800 rounded-2xl border border-gray-100 dark:border-surface-700">
            <div class="w-16 h-16 bg-primary-50 dark:bg-primary-900/20 rounded-full flex items-center justify-center mb-4">
              <svg class="w-8 h-8 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10l6 6v10a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-2">Chưa có bài viết nào</h3>
            <p class="text-gray-500 dark:text-gray-400 mb-6 max-w-sm">Chuyên mục này hiện chưa có bài viết. Hãy là người đầu tiên chia sẻ kiến thức của bạn nhé!</p>
            <button @click="router.push('/posts/create')" class="px-5 py-2.5 bg-primary-500 hover:bg-primary-600 text-white rounded-xl font-medium transition-colors shadow-lg shadow-primary-500/30 flex items-center gap-2">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
              Viết bài mới
            </button>
          </div>
        </div>

        <!-- Load More -->
        <LoadMoreButton 
          :has-more="hasMore" 
          :is-loading="isLoading" 
          :loading-more="loadingMore" 
          :item-count="filteredPosts.length" 
          @load-more="loadMore" 
        />
      </div>

      <!-- Right Sidebar -->
      <TrendingSidebar />
    </div>
  </div>
</template>
