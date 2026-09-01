<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { Flame, Loader2, CheckCircle } from '@lucide/vue'
import PostCard from '@/components/PostCard.vue'
import TrendingSidebar from '@/components/TrendingSidebar.vue'
import CategoryTabs from '@/components/CategoryTabs.vue'
import Skeleton from '@/components/ui/Skeleton.vue'
import { usePosts } from '@/composables/usePosts'
import { useCategories } from '@/composables/useCategories'
import { onMounted } from 'vue'

const router = useRouter()
const selectedCategory = ref('all')
const visibleCount = ref(4)
const loadingMore = ref(false)
const { posts, isLoading, fetchPosts, toggleBookmark: apiToggleBookmark } = usePosts()
const { categories, fetchCategories } = useCategories()

onMounted(() => {
  fetchPosts()
  fetchCategories()
})

const filteredPosts = computed(() => {
  const all = selectedCategory.value === 'all'
    ? posts.value
    : posts.value.filter(p => p.category.slug === selectedCategory.value)
  return all.slice(0, visibleCount.value)
})

const totalFiltered = computed(() => {
  if (selectedCategory.value === 'all') return posts.value.length
  return posts.value.filter(p => p.category.slug === selectedCategory.value).length
})

const hasMore = computed(() => visibleCount.value < totalFiltered.value)

const loadMore = async () => {
  loadingMore.value = true
  // Giả lập delay tải thêm từ API
  await new Promise(r => setTimeout(r, 800))
  visibleCount.value += 4
  loadingMore.value = false
}

const toggleBookmark = (postId: string) => {
  const post = posts.value.find(p => p.id === postId)
  if (post) {
    post.bookmarked = !post.bookmarked
    apiToggleBookmark(postId, !post.bookmarked)
  }
}
</script>

<template>
  <div class="mx-auto px-4 sm:px-6 lg:px-8 py-6">
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
              Chào buổi sáng, Lê Thanh Tình 👋
            </h1>
            <p class="text-primary-100 text-sm sm:text-base max-w-lg">
              Hôm nay có gì mới để khám phá?
            </p>
          </div>
          <!-- Decorative shapes -->
          <div class="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div class="absolute bottom-0 right-20 w-24 h-24 bg-white/5 rounded-full translate-y-1/2" />
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
          <div v-else-if="!isLoading && filteredPosts.length > 0" class="flex items-center gap-2 text-sm text-gray-400 dark:text-gray-500">
            <CheckCircle :size="16" />
            Đã hiển thị tất cả bài viết
          </div>
        </div>
      </div>

      <!-- Right Sidebar -->
      <TrendingSidebar />
    </div>
  </div>
</template>
