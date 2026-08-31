<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ChevronRight, ChevronLeft, Flame } from '@lucide/vue'
import PostCard from '@/components/PostCard.vue'
import TrendingSidebar from '@/components/TrendingSidebar.vue'
import CategoryTabs from '@/components/CategoryTabs.vue'
import { usePosts } from '@/composables/usePosts'
import { useCategories } from '@/composables/useCategories'
import { onMounted } from 'vue'

const router = useRouter()
const selectedCategory = ref('all')
const { posts, fetchPosts, toggleBookmark: apiToggleBookmark } = usePosts()
const { categories, fetchCategories } = useCategories()

onMounted(() => {
  fetchPosts()
  fetchCategories()
})

const filteredPosts = computed(() => {
  if (selectedCategory.value === 'all') return posts.value
  return posts.value.filter(p => p.category.slug === selectedCategory.value)
})

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

        <!-- Categories -->
        <CategoryTabs
          v-model="selectedCategory"
          :categories="categories"
          class="mb-6"
        />

        <!-- Posts Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-5 stagger-children">
          <PostCard
            v-for="post in filteredPosts"
            :key="post.id"
            :post="post"
            @click="router.push(`/posts/${post.id}`)"
            @bookmark="toggleBookmark"
          />
        </div>

        <!-- Load More -->
        <div class="flex justify-center mt-8">
          <button class="px-6 py-3 rounded-xl text-sm font-medium text-primary-500 border border-primary-500/30 hover:bg-primary-500/10 transition-all duration-200">
            Xem thêm bài viết
          </button>
        </div>
      </div>

      <!-- Right Sidebar -->
      <TrendingSidebar />
    </div>
  </div>
</template>
