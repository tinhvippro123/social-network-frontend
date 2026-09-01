<script setup lang="ts">
import { useRouter } from 'vue-router'
import { TrendingUp, ArrowUp, Hash, Star } from '@lucide/vue'
import { usePosts } from '@/composables/usePosts'
import { useUsers } from '@/composables/useUsers'
import UserAvatar from '@/components/UserAvatar.vue'
import { onMounted } from 'vue'
import { formatNumber } from '@/utils/formatters'

const { posts, fetchTrending, tags, fetchPopularTags } = usePosts()
const { users, fetchUsers } = useUsers()

onMounted(async () => {
  posts.value = await fetchTrending(5)
  await fetchUsers()
  await fetchPopularTags()
})

const router = useRouter()
</script>

<template>
  <aside class="w-full lg:w-80 shrink-0 space-y-5">
    <!-- Trending Posts -->
    <div class="bg-white dark:bg-surface-800 rounded-2xl border border-gray-200 dark:border-surface-700 p-5">
      <h3 class="flex items-center gap-2 text-base font-bold text-gray-900 dark:text-white mb-4">
        <TrendingUp :size="18" class="text-primary-500" />
        Thịnh hành
      </h3>
      <div class="space-y-4">
        <div
          v-for="(post, i) in posts.slice(0, 5)"
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
          v-for="tag in tags"
          :key="tag.id"
          class="px-3 py-1.5 bg-gray-50 dark:bg-surface-700 hover:bg-gray-100 dark:hover:bg-surface-600 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors cursor-pointer border border-gray-200 dark:border-surface-600"
        >
          #{{ tag.name }}
        </span>
      </div>
    </div>

    <!-- Top Authors -->
    <div class="bg-white dark:bg-surface-800 rounded-2xl border border-gray-200 dark:border-surface-700 p-5">
      <h3 class="flex items-center gap-2 text-base font-bold text-gray-900 dark:text-white mb-4">
        <Star :size="18" class="text-amber-400" />
        Tác giả nổi bật
      </h3>
      <div class="space-y-4">
        <div v-for="user in users.slice(0, 3)" :key="user.id" class="flex items-center gap-3">
          <UserAvatar :user="user" size="md" class="ring-2 ring-transparent group-hover:ring-primary-500/30 transition-all cursor-pointer" @click="router.push(`/profile/${user.id}`)" />
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
</template>
