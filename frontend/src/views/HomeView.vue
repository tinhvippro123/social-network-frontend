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
          
          <template v-else>
            <PostCard
              v-for="post in filteredPosts"
              :key="post.id"
              :post="post"
              @toggle-bookmark="toggleBookmark"
              @click="router.push(`/posts/${post.id}`)"
              class="cursor-pointer transition-transform hover:-translate-y-1"
            />
          </template>
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
