<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { SearchIcon, FileText, Users, Tag, ArrowLeft, X } from '@lucide/vue'
import { usePosts } from '@/composables/usePosts'
import PostCard from '@/components/PostCard.vue'
import UserAvatar from '@/components/UserAvatar.vue'
import Skeleton from '@/components/ui/Skeleton.vue'

const route = useRoute()
const router = useRouter()
const query = ref((route.query.q as string) || '')
const activeTab = ref<'posts' | 'users' | 'tags'>('posts')

const { posts, isLoading, fetchPosts } = usePosts()

onMounted(() => {
  fetchPosts()
})

// Watch for query changes from URL
watch(() => route.query.q, (newQ) => {
  if (newQ) query.value = newQ as string
})

// Filter posts based on search query
const filteredPosts = computed(() => {
  if (!query.value.trim()) return posts.value
  const q = query.value.toLowerCase()
  return posts.value.filter(p =>
    p.title.toLowerCase().includes(q) ||
    p.tags?.some(t => t.toLowerCase().includes(q)) ||
    p.author.name.toLowerCase().includes(q)
  )
})

// Mock users for search
const mockUsers = [
  { id: '1', name: 'Lê Thanh Tính', email: 'tinh@example.com', avatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=LTT', bio: 'Full-stack developer', role: 'user' as const, joinedAt: '2026-08-24', postsCount: 12, followersCount: 156, followingCount: 42 },
  { id: '2', name: 'Phạm Minh Tuấn', email: 'tuan@example.com', avatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=PMT', bio: 'Frontend developer', role: 'user' as const, joinedAt: '2026-07-15', postsCount: 8, followersCount: 89, followingCount: 34 },
  { id: '3', name: 'Nguyễn Thị Mai', email: 'mai@example.com', avatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=NTM', bio: 'UX Designer & Writer', role: 'user' as const, joinedAt: '2026-06-20', postsCount: 15, followersCount: 234, followingCount: 56 },
]

const filteredUsers = computed(() => {
  if (!query.value.trim()) return mockUsers
  const q = query.value.toLowerCase()
  return mockUsers.filter(u =>
    u.name.toLowerCase().includes(q) || u.bio.toLowerCase().includes(q)
  )
})

// Mock tags
const allTags = computed(() => {
  const tagSet = new Set<string>()
  posts.value.forEach(p => p.tags?.forEach(t => tagSet.add(t)))
  return Array.from(tagSet)
})

const filteredTags = computed(() => {
  if (!query.value.trim()) return allTags.value
  const q = query.value.toLowerCase()
  return allTags.value.filter(t => t.toLowerCase().includes(q))
})

function handleSearch() {
  if (query.value.trim()) {
    router.replace({ query: { q: query.value.trim() } })
  }
}

const tabs = [
  { key: 'posts' as const, label: 'Bài viết', icon: FileText },
  { key: 'users' as const, label: 'Người dùng', icon: Users },
  { key: 'tags' as const, label: 'Tags', icon: Tag },
]
</script>

<template>
  <div class="mx-auto w-full max-w-5xl px-4 sm:px-6 lg:px-8 py-6">
    <!-- Search Header -->
    <div class="mb-8">
      <button
        @click="router.back()"
        class="flex items-center gap-2 text-sm text-gray-500 hover:text-primary-500 transition-colors mb-4"
      >
        <ArrowLeft :size="16" />
        Quay lại
      </button>

      <!-- Search Input -->
      <div class="relative mb-6">
        <SearchIcon :size="20" class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          v-model="query"
          @keydown.enter="handleSearch"
          type="text"
          placeholder="Tìm kiếm bài viết, người dùng, tag..."
          class="w-full pl-12 pr-12 py-4 bg-white dark:bg-surface-800 border border-gray-200 dark:border-surface-700 rounded-2xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 text-lg transition-all"
          autofocus
        />
        <button
          v-if="query"
          @click="query = ''"
          class="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X :size="20" />
        </button>
      </div>

      <!-- Tabs -->
      <div class="flex items-center gap-1 bg-gray-100 dark:bg-surface-800 rounded-xl p-1">
        <button
          v-for="tab in tabs"
          :key="tab.key"
          @click="activeTab = tab.key"
          :class="[
            'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all',
            activeTab === tab.key
              ? 'bg-white dark:bg-surface-700 text-gray-900 dark:text-white shadow-sm'
              : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
          ]"
        >
          <component :is="tab.icon" :size="16" />
          {{ tab.label }}
        </button>
      </div>
    </div>

    <!-- Results -->
    <div v-if="query.trim()">
      <p class="text-sm text-gray-500 mb-4">
        Kết quả tìm kiếm cho "<span class="font-semibold text-gray-900 dark:text-white">{{ query }}</span>"
      </p>
    </div>

    <!-- Posts Tab -->
    <div v-if="activeTab === 'posts'">
      <div v-if="isLoading" class="space-y-4">
        <Skeleton v-for="i in 3" :key="i" type="image" class="w-full h-48 rounded-2xl" />
      </div>
      <div v-else-if="filteredPosts.length > 0" class="space-y-4">
        <PostCard v-for="post in filteredPosts" :key="post.id" :post="post" />
      </div>
      <div v-else class="text-center py-16 text-gray-500">
        <SearchIcon :size="48" class="mx-auto mb-4 opacity-30" />
        <p class="text-lg font-medium">Không tìm thấy bài viết nào</p>
        <p class="text-sm mt-1">Thử tìm với từ khóa khác</p>
      </div>
    </div>

    <!-- Users Tab -->
    <div v-else-if="activeTab === 'users'">
      <div v-if="filteredUsers.length > 0" class="space-y-3">
        <div
          v-for="u in filteredUsers"
          :key="u.id"
          @click="router.push(`/profile/${u.id}`)"
          class="flex items-center gap-4 p-4 bg-white dark:bg-surface-800 rounded-2xl border border-gray-200 dark:border-surface-700 hover:border-primary-500/30 cursor-pointer transition-all"
        >
          <UserAvatar :user="u" size="lg" />
          <div class="flex-1">
            <p class="font-semibold text-gray-900 dark:text-white">{{ u.name }}</p>
            <p class="text-sm text-gray-500">{{ u.bio }}</p>
            <div class="flex items-center gap-3 mt-1 text-xs text-gray-400">
              <span>{{ u.postsCount }} bài viết</span>
              <span>{{ u.followersCount }} followers</span>
            </div>
          </div>
          <button class="px-4 py-1.5 rounded-xl text-sm font-medium text-primary-500 border border-primary-500/30 hover:bg-primary-50 dark:hover:bg-primary-500/10 transition-all">
            Theo dõi
          </button>
        </div>
      </div>
      <div v-else class="text-center py-16 text-gray-500">
        <Users :size="48" class="mx-auto mb-4 opacity-30" />
        <p class="text-lg font-medium">Không tìm thấy người dùng nào</p>
      </div>
    </div>

    <!-- Tags Tab -->
    <div v-else-if="activeTab === 'tags'">
      <div v-if="filteredTags.length > 0" class="flex flex-wrap gap-3">
        <button
          v-for="tag in filteredTags"
          :key="tag"
          @click="router.push(`/tags/${tag}`)"
          class="flex items-center gap-2 px-5 py-3 bg-white dark:bg-surface-800 rounded-2xl border border-gray-200 dark:border-surface-700 hover:border-primary-500/30 hover:bg-primary-50 dark:hover:bg-primary-500/10 transition-all"
        >
          <Tag :size="16" class="text-primary-500" />
          <span class="font-medium text-gray-900 dark:text-white">#{{ tag }}</span>
        </button>
      </div>
      <div v-else class="text-center py-16 text-gray-500">
        <Tag :size="48" class="mx-auto mb-4 opacity-30" />
        <p class="text-lg font-medium">Không tìm thấy tag nào</p>
      </div>
    </div>
  </div>
</template>
