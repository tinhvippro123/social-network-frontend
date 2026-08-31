<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import {
  Calendar, MapPin, Link as LinkIcon, Edit3, Settings,
  FileText, Bookmark, Users, Eye, ArrowUp, MessageCircle, Clock
} from '@lucide/vue'
import { usePosts } from '@/composables/usePosts'
import { useAuth } from '@/composables/useAuth'
import { onMounted, computed } from 'vue'

const router = useRouter()
const activeTab = ref('posts')
const { posts, fetchPosts } = usePosts()
const { user: currentUser } = useAuth() // Assuming useAuth has user state

const tabs = computed(() => [
  { key: 'posts', label: 'Bài viết', icon: FileText, count: currentUser.value?.postsCount || 0 },
  { key: 'bookmarks', label: 'Đã lưu', icon: Bookmark, count: 12 },
  { key: 'groups', label: 'Nhóm', icon: Users, count: 5 },
])

onMounted(() => {
  fetchPosts()
})

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('vi-VN', { day: 'numeric', month: 'long', year: 'numeric' })
}

const formatNumber = (num: number) => {
  if (num >= 1000) return `${(num / 1000).toFixed(1)}k`
  return num.toString()
}
</script>

<template>
  <div v-if="currentUser" class="mx-auto px-4 sm:px-6 lg:px-8 py-6">
    <!-- Profile Header -->
    <div class="relative bg-white dark:bg-surface-800 rounded-2xl border border-gray-200 dark:border-surface-700 mb-6">
      <!-- Cover -->
      <div class="h-40 sm:h-52 bg-linear-to-r from-primary-600 via-purple-600 to-pink-600 relative overflow-hidden rounded-t-2xl">
        <div class="absolute inset-0 opacity-20"
          style="background-image: radial-gradient(circle, rgba(255,255,255,0.2) 1px, transparent 1px); background-size: 20px 20px;"
        />
      </div>

      <!-- Avatar & Info -->
      <div class="px-6 pb-6">
        <div class="flex flex-col sm:flex-row items-start sm:items-end gap-4 -mt-12 sm:-mt-16 relative z-10">
          <img
            :src="currentUser.avatar"
            class="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl ring-4 ring-white dark:ring-surface-800 shadow-xl"
          />
          <div class="flex-1 pt-2 sm:pb-2">
            <div class="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
              <h1 class="text-2xl font-bold text-gray-900 dark:text-white">{{ currentUser.name }}</h1>
              <span class="inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-semibold bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 w-fit">
                {{ currentUser.role === 'admin' ? '👑 Admin' : '👤 Member' }}
              </span>
            </div>
            <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">{{ currentUser.bio }}</p>
            <div class="flex flex-wrap items-center gap-4 mt-3 text-xs text-gray-400">
              <span class="flex items-center gap-1"><Calendar :size="12" /> Tham gia {{ formatDate(currentUser.joinedAt) }}</span>
              <span class="flex items-center gap-1"><MapPin :size="12" /> TP. Hồ Chí Minh</span>
              <span class="flex items-center gap-1"><LinkIcon :size="12" /> github.com/tinh</span>
            </div>
          </div>
          <button class="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border border-gray-200 dark:border-surface-700 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-surface-700 transition-all">
            <Edit3 :size="14" /> Chỉnh sửa
          </button>
        </div>

        <!-- Stats -->
        <div class="flex items-center gap-6 mt-6 pt-6 border-t border-gray-200 dark:border-surface-700">
          <div class="text-center">
            <p class="text-xl font-bold text-gray-900 dark:text-white">{{ currentUser.postsCount }}</p>
            <p class="text-xs text-gray-400">Bài viết</p>
          </div>
          <div class="text-center">
            <p class="text-xl font-bold text-gray-900 dark:text-white">{{ formatNumber(currentUser.followersCount) }}</p>
            <p class="text-xs text-gray-400">Followers</p>
          </div>
          <div class="text-center">
            <p class="text-xl font-bold text-gray-900 dark:text-white">{{ currentUser.followingCount }}</p>
            <p class="text-xs text-gray-400">Following</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Tabs -->
    <div class="flex items-center gap-1 mb-6 bg-white dark:bg-surface-800 rounded-2xl border border-gray-200 dark:border-surface-700 p-1.5">
      <button
        v-for="tab in tabs"
        :key="tab.key"
        @click="activeTab = tab.key"
        :class="[
          'flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 flex-1 justify-center',
          activeTab === tab.key
            ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/25'
            : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-surface-700'
        ]"
      >
        <component :is="tab.icon" :size="16" />
        {{ tab.label }}
        <span class="text-xs opacity-70">({{ tab.count }})</span>
      </button>
    </div>

    <!-- Posts List -->
    <div class="space-y-4 stagger-children">
      <article
        v-for="post in posts.slice(0, 4)"
        :key="post.id"
        @click="router.push(`/posts/${post.id}`)"
        class="flex gap-4 bg-white dark:bg-surface-800 rounded-2xl border border-gray-200 dark:border-surface-700 p-4 sm:p-5 hover:border-primary-500/30 hover:shadow-lg hover:shadow-primary-500/5 transition-all duration-300 cursor-pointer group"
      >
        <img
          :src="post.coverImage"
          class="hidden sm:block w-32 h-24 rounded-xl object-cover shrink-0 transition-transform duration-300 group-hover:scale-105"
        />
        <div class="flex-1 min-w-0">
          <h3 class="font-bold text-gray-900 dark:text-white group-hover:text-primary-500 transition-colors line-clamp-2 mb-2">
            {{ post.title }}
          </h3>
          <p class="text-sm text-gray-500 dark:text-gray-400 line-clamp-1 mb-3">
            {{ post.excerpt }}
          </p>
          <div class="flex items-center gap-4 text-xs text-gray-400">
            <span class="flex items-center gap-1"><Clock :size="12" /> {{ formatDate(post.createdAt) }}</span>
            <span class="flex items-center gap-1"><Eye :size="12" /> {{ formatNumber(post.viewsCount) }}</span>
            <span class="flex items-center gap-1"><ArrowUp :size="12" /> {{ post.upvotesCount }}</span>
            <span class="flex items-center gap-1"><MessageCircle :size="12" /> {{ post.commentsCount }}</span>
          </div>
        </div>
      </article>
    </div>
  </div>
  <div v-else class="text-center py-20 text-gray-500">
    Đang tải hồ sơ...
  </div>
</template>
