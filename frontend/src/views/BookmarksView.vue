<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Bookmark, FolderOpen, Hash, Sparkles, ArrowUp } from '@lucide/vue'
import PostCard from '@/components/PostCard.vue'
import Skeleton from '@/components/ui/Skeleton.vue'
import { usePosts } from '@/composables/usePosts'
import { formatNumber } from '@/utils/formatters'

const router = useRouter()
const { posts, isLoading, fetchPosts, tags, fetchPopularTags, toggleBookmark: apiToggleBookmark } = usePosts()
const sidebarLoading = ref(true)

onMounted(async () => {
  fetchPosts()
  sidebarLoading.value = true
  await fetchPopularTags()
  sidebarLoading.value = false
})

// Chỉ lấy bài đã bookmark
const bookmarkedPosts = computed(() =>
  posts.value.filter(p => p.bookmarked)
)

// Gợi ý: bài chưa bookmark, sắp theo votes cao
const suggestedPosts = computed(() =>
  posts.value
    .filter(p => !p.bookmarked)
    .sort((a, b) => b.upvotesCount - a.upvotesCount)
    .slice(0, 5)
)

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
        <!-- Bookmarks Banner -->
        <div class="relative overflow-hidden rounded-2xl bg-linear-to-r from-emerald-500 via-teal-500 to-cyan-500 p-6 sm:p-8 mb-6 shadow-xl">
          <div class="relative z-10">
            <div class="flex items-center gap-2 mb-3">
              <Bookmark :size="20" class="text-emerald-200" />
              <span class="text-emerald-100 text-sm font-medium">Bộ sưu tập cá nhân</span>
            </div>
            <h1 class="text-2xl sm:text-3xl font-bold text-white mb-2">
              Đã lưu 📚
            </h1>
            <p class="text-emerald-100 text-sm sm:text-base max-w-lg">
              Những bài viết bạn đã lưu lại để đọc sau. Hiện có {{ bookmarkedPosts.length }} bài viết.
            </p>
          </div>
          <!-- Decorative shapes -->
          <div class="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div class="absolute bottom-0 right-20 w-24 h-24 bg-white/5 rounded-full translate-y-1/2" />
        </div>

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
      <aside class="w-full lg:w-80 shrink-0 space-y-5">
        <!-- Gợi ý cho bạn -->
        <div class="bg-white dark:bg-surface-800 rounded-2xl border border-gray-200 dark:border-surface-700 p-5">
          <h3 class="flex items-center gap-2 text-base font-bold text-gray-900 dark:text-white mb-4">
            <Sparkles :size="18" class="text-amber-400" />
            Gợi ý cho bạn
          </h3>
          <div v-if="sidebarLoading || isLoading" class="space-y-4">
            <div v-for="i in 5" :key="i" class="flex items-start gap-3">
              <Skeleton type="text" class="w-7 h-7 rounded shrink-0" />
              <div class="flex-1 space-y-2">
                <Skeleton type="text" class="w-full" />
                <Skeleton type="text" class="w-24" />
              </div>
            </div>
          </div>
          <div v-else class="space-y-4">
            <div
              v-for="(post, i) in suggestedPosts"
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
          <div v-if="sidebarLoading" class="flex flex-wrap gap-2">
            <Skeleton v-for="i in 6" :key="i" type="button" class="w-20 h-8 rounded-xl" />
          </div>
          <div v-else class="flex flex-wrap gap-2">
            <span
              v-for="tag in tags"
              :key="tag.id"
              class="px-3 py-1.5 bg-gray-50 dark:bg-surface-700 hover:bg-gray-100 dark:hover:bg-surface-600 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors cursor-pointer border border-gray-200 dark:border-surface-600"
            >
              #{{ tag.name }}
            </span>
          </div>
        </div>
      </aside>
    </div>
  </div>
</template>
