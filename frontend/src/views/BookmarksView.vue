<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { Bookmark, FolderOpen } from '@lucide/vue'
import PostCard from '@/components/PostCard.vue'
import PostSkeletonCard from '@/components/posts/PostSkeletonCard.vue'
import BookmarksSidebar from './components/BookmarksSidebar.vue'
import BookmarksHeroBanner from './components/BookmarksHeroBanner.vue'
import { useBookmarks } from '@/composables/core/useBookmarks'
import { formatNumber } from '@/utils/formatters'

const router = useRouter()

const {
  tags,
  isLoading,
  sidebarLoading,
  bookmarkedPosts,
  suggestedPosts,
  toggleBookmark
} = useBookmarks()
</script>

<template>
  <div class="mx-auto px-4 sm:px-6 lg:px-8 py-6">
    <div class="flex flex-col lg:flex-row gap-6">
      <!-- Main Content -->
      <div class="flex-1 min-w-0">
        <!-- Bookmarks Banner -->
        <BookmarksHeroBanner :item-count="bookmarkedPosts.length" />

        <!-- Feed -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 stagger-children">
          <template v-if="isLoading">
            <PostSkeletonCard v-for="i in 4" :key="i" />
          </template>
          
          <template v-else-if="bookmarkedPosts.length === 0">
            <!-- Empty state -->
            <div class="col-span-full flex flex-col items-center justify-center py-16 text-center">
              <div class="w-20 h-20 rounded-2xl bg-gray-100 dark:bg-surface-700 flex items-center justify-center mb-4">
                <FolderOpen :size="36" class="text-gray-400 dark:text-gray-500" />
              </div>
              <h3 class="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Chưa có bài viết nào được lưu
              </h3>
              <p class="text-sm text-gray-500 dark:text-gray-400 max-w-md mb-6">
                Hãy nhấn vào biểu tượng <Bookmark :size="14" class="inline text-primary-500" /> trên các bài viết bạn quan tâm để lưu lại đọc sau nhé!
              </p>
              <button
                @click="router.push('/')"
                class="px-6 py-2.5 rounded-xl text-sm font-medium text-white gradient-primary hover:opacity-90 transition-all duration-200 shadow-lg shadow-primary-500/25"
              >
                Khám phá bài viết
              </button>
            </div>
          </template>

          <template v-else>
            <PostCard
              v-for="post in bookmarkedPosts"
              :key="post.id"
              :post="post"
              @toggle-bookmark="toggleBookmark"
              @click="router.push(`/posts/${post.id}`)"
              class="cursor-pointer transition-transform hover:-translate-y-1"
            />
          </template>
        </div>
      </div>

      <!-- Right Sidebar: Gợi ý + Tags phổ biến -->
      <BookmarksSidebar
        :sidebar-loading="sidebarLoading"
        :suggested-posts="suggestedPosts"
        :tags="tags"
      />
    </div>
  </div>
</template>
