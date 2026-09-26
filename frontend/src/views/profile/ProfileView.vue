<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import {
  FileText, Eye, ArrowUp, MessageCircle, Clock
} from '@lucide/vue'
import { useProfileTabs } from '@/composables/ui/useProfileTabs'
import { onMounted } from 'vue'
import { formatDate, formatNumber } from '@/utils/formatters'
import Skeleton from '@/components/ui/Skeleton.vue'
import ProfileHeader from './components/ProfileHeader.vue'

const router = useRouter()
const { currentUser, activeTab, tabs, posts, isLoading, fetchPosts } = useProfileTabs()

onMounted(() => {
  fetchPosts()
})


</script>

<template>
  <div v-if="currentUser" class="mx-auto px-4 sm:px-6 lg:px-8 py-6">
    <!-- Profile Header -->
    <ProfileHeader :current-user="currentUser" />

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
      <template v-if="isLoading">
        <div v-for="i in 3" :key="i" class="flex gap-4 bg-white dark:bg-surface-800 rounded-2xl border border-gray-200 dark:border-surface-700 p-4 sm:p-5">
          <Skeleton type="image" class="hidden sm:block w-32 h-24 rounded-xl shrink-0" />
          <div class="flex-1 space-y-3">
            <Skeleton type="text" class="w-3/4 h-5" />
            <Skeleton type="text" class="w-full h-4" />
            <div class="flex gap-4 mt-2">
              <Skeleton type="text" class="w-16 h-3" />
              <Skeleton type="text" class="w-16 h-3" />
            </div>
          </div>
        </div>
      </template>
      
      <template v-else-if="posts.length > 0">
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
      </template>

      <!-- Empty State -->
      <div v-else class="bg-white dark:bg-surface-800 rounded-2xl border border-gray-200 dark:border-surface-700 p-12 text-center">
        <FileText class="w-12 h-12 text-gray-300 dark:text-surface-600 mx-auto mb-4" />
        <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-2">Chưa có bài viết nào</h3>
        <p class="text-gray-500 dark:text-gray-400 text-sm">Khi người dùng xuất bản bài viết, chúng sẽ xuất hiện ở đây.</p>
      </div>
    </div>
  </div>
  <div v-else class="mx-auto px-4 sm:px-6 lg:px-8 py-6">
    <div class="relative bg-white dark:bg-surface-800 rounded-2xl border border-gray-200 dark:border-surface-700 mb-6 h-64 overflow-hidden">
      <Skeleton type="image" class="w-full h-full" />
    </div>
  </div>
</template>
