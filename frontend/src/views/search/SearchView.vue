<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  Search as SearchIcon,
  FileText,
  Users,
  Tag,
  Sparkles,
  Camera,
  Layers,
  ArrowRight,
  TrendingUp
} from '@lucide/vue'
import { useSearch } from '@/composables/core/useSearch'
import { usePosts } from '@/composables/posts/usePosts'
import { useUiStore } from '@/stores/ui.store'
import usersApi from '@/api/users.api'
import type { UserSummary } from '@/types'
import PostCard from '@/components/PostCard.vue'
import Skeleton from '@/components/ui/Skeleton.vue'
import SearchHeader from './components/SearchHeader.vue'
import SearchUserItem from './components/SearchUserItem.vue'

const route = useRoute()
const router = useRouter()
const uiStore = useUiStore()

// Omni-Search states
const query = ref((route.query.q as string) || '')
const textMode = ref<'keyword' | 'semantic'>((route.query.type as 'semantic' | 'keyword') || 'keyword')
const selectedFile = ref<File | null>(null)
const fileType = ref<'image' | 'document' | null>(null)
const activeTab = ref<'posts' | 'users' | 'tags'>('posts')

// Search Composable
const {
  results,
  isSearching,
  searchType,
  error,
  searchByKeyword,
  searchSemantic,
  searchByImage,
  searchByDocument,
  clearSearch
} = useSearch()

// Discover posts for initial recommendations
const { posts: initialPosts, isLoading: isLoadingInitial, fetchPosts } = usePosts()

// Recommended users
const recommendedUsers = ref<UserSummary[]>([])
const isLoadingUsers = ref(false)

// Trending search suggestion tags
const trendingSuggestions = [
  'Trí tuệ nhân tạo',
  'Spring Boot',
  'Vue 3',
  'Điện toán đám mây',
  'Clean Architecture',
  'An toàn thông tin'
]

function checkPendingFile(): boolean {
  if (uiStore.pendingSearchFile) {
    const pending = uiStore.consumePendingSearchFile()
    if (pending) {
      handleSelectFile(pending.file, pending.type)
      return true
    }
  }
  return false
}

onMounted(async () => {
  // Fetch initial posts & users in background
  fetchPosts()
  fetchUsers()

  // Prioritize pending file upload from navbar if any
  if (checkPendingFile()) {
    return
  }

  // Execute search if route has query
  if (route.query.q) {
    query.value = route.query.q as string
    if (route.query.type === 'semantic') {
      textMode.value = 'semantic'
    }
    executeSearch()
  }
})

// Watch for pending file if user triggers image upload from navbar while already on /search
watch(() => uiStore.pendingSearchFile, (newFile) => {
  if (newFile) {
    checkPendingFile()
  }
})

// Watch query in URL
watch(() => route.query.q, (newQ) => {
  if (newQ && newQ !== query.value) {
    query.value = newQ as string
    executeSearch()
  }
})

// Re-search when switching text mode if query exists
watch(textMode, () => {
  if (query.value.trim() && !selectedFile.value) {
    executeSearch()
  }
})

async function fetchUsers() {
  try {
    isLoadingUsers.value = true
    const res = await usersApi.getAll(20)
    recommendedUsers.value = res.data?.data || []
  } catch (err) {
    console.error('Failed to fetch recommended users:', err)
  } finally {
    isLoadingUsers.value = false
  }
}

// Handle file selection from header
function handleSelectFile(file: File, type: 'image' | 'document') {
  selectedFile.value = file
  fileType.value = type
  activeTab.value = 'posts'
  executeSearch()
}

// Handle file removal
function handleRemoveFile() {
  selectedFile.value = null
  fileType.value = null
  clearSearch()
}

// Quick click on search suggestion chip
function applySuggestion(keyword: string) {
  query.value = keyword
  selectedFile.value = null
  fileType.value = null
  executeSearch()
}

// Main execution function
async function executeSearch() {
  if (selectedFile.value) {
    if (fileType.value === 'image') {
      await searchByImage(selectedFile.value)
    } else if (fileType.value === 'document') {
      await searchByDocument(selectedFile.value)
    }
    return
  }

  const q = query.value.trim()
  if (!q) {
    clearSearch()
    return
  }

  router.replace({
    query: {
      q,
      type: textMode.value
    }
  })

  if (textMode.value === 'semantic') {
    await searchSemantic(q)
  } else {
    await searchByKeyword(q)
  }
}

// Filter users based on query
const filteredUsers = computed(() => {
  if (!query.value.trim()) return recommendedUsers.value
  const q = query.value.toLowerCase()
  return recommendedUsers.value.filter(u =>
    u.name.toLowerCase().includes(q) || (u.bio && u.bio.toLowerCase().includes(q))
  )
})

// Available tags from initial posts
const allTags = computed(() => {
  const tagSet = new Set<string>()
  initialPosts.value.forEach(p => p.tags?.forEach(t => tagSet.add(t)))
  return Array.from(tagSet)
})

const filteredTags = computed(() => {
  if (!query.value.trim()) return allTags.value
  const q = query.value.toLowerCase()
  return allTags.value.filter(t => t.toLowerCase().includes(q))
})

// Has active query or file search
const hasActiveSearch = computed(() => {
  return !!query.value.trim() || !!selectedFile.value
})

const tabs = [
  { key: 'posts', label: 'Bài viết', icon: FileText },
  { key: 'users', label: 'Tác giả', icon: Users },
  { key: 'tags', label: 'Chủ đề', icon: Tag },
]
</script>

<template>
  <div class="mx-auto w-full max-w-5xl px-4 sm:px-6 lg:px-8 py-6">
    <!-- Omni-Search Header Component -->
    <SearchHeader
      :query="query"
      :text-mode="textMode"
      :selected-file="selectedFile"
      :file-type="fileType"
      :is-searching="isSearching"
      :active-tab="activeTab"
      :tabs="tabs"
      @update:query="val => query = val"
      @update:text-mode="val => textMode = val"
      @update:active-tab="val => activeTab = val as 'posts' | 'users' | 'tags'"
      @select-file="handleSelectFile"
      @remove-file="handleRemoveFile"
      @search="executeSearch"
    />

    <!-- Clean, Natural Search Summary Status (Production Grade) -->
    <div
      v-if="hasActiveSearch"
      class="mb-6 flex flex-wrap items-center justify-between gap-3 px-1"
    >
      <div class="flex items-center gap-2.5 flex-wrap">
        <span class="text-sm text-gray-500 dark:text-gray-400">Kết quả cho:</span>
        <span class="text-base font-bold text-gray-900 dark:text-white">
          "{{ selectedFile ? selectedFile.name : query }}"
        </span>

        <!-- Elegant AI Badge -->
        <span
          v-if="textMode === 'semantic' && !selectedFile"
          class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-200 dark:border-purple-800 shadow-2xs"
        >
          <Sparkles :size="12" /> AI Search
        </span>

        <!-- Elegant Image Badge -->
        <span
          v-else-if="selectedFile && fileType === 'image'"
          class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary-100 text-primary-700 dark:bg-primary-950/60 dark:text-primary-300 border border-primary-200 dark:border-primary-800 shadow-2xs"
        >
          <Camera :size="12" /> Tìm bằng ảnh
        </span>

        <!-- Elegant Document Badge -->
        <span
          v-else-if="selectedFile && fileType === 'document'"
          class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 shadow-2xs"
        >
          <FileText :size="12" /> Tìm bằng tài liệu
        </span>
      </div>

      <!-- Result count -->
      <span v-if="!isSearching" class="text-xs text-gray-500 dark:text-gray-400 font-medium">
        {{ results.length }} bài viết tìm thấy
      </span>
    </div>

    <!-- Error notice -->
    <div
      v-if="error"
      class="mb-6 p-4 rounded-2xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 text-sm flex items-center justify-between"
    >
      <span>{{ error }}</span>
      <button @click="clearSearch" class="text-xs font-semibold hover:underline cursor-pointer">
        Thử lại
      </button>
    </div>

    <!-- TAB 1: POSTS -->
    <div v-if="activeTab === 'posts'">
      <!-- Loading Skeleton -->
      <div v-if="isSearching" class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div v-for="i in 4" :key="i" class="p-6 bg-white dark:bg-surface-800 rounded-3xl border border-gray-100 dark:border-surface-700 space-y-4">
          <div class="flex items-center gap-3">
            <Skeleton type="avatar" size="md" />
            <div class="space-y-1.5 flex-1">
              <Skeleton type="text" class="w-32 h-4" />
              <Skeleton type="text" class="w-20 h-3" />
            </div>
          </div>
          <Skeleton type="text" class="w-3/4 h-6" />
          <Skeleton type="text" class="w-full h-16" />
        </div>
      </div>

      <!-- Results found from Search -->
      <div v-else-if="hasActiveSearch && results.length > 0" class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <PostCard v-for="post in results" :key="post.id" :post="post" />
      </div>

      <!-- No Results Found -->
      <div v-else-if="hasActiveSearch && results.length === 0" class="text-center py-16 px-4 bg-white dark:bg-surface-800 rounded-3xl border border-gray-100 dark:border-surface-700 shadow-xs">
        <SearchIcon :size="48" class="mx-auto mb-4 text-gray-300 dark:text-gray-600" />
        <h3 class="text-lg font-bold text-gray-900 dark:text-white">Không tìm thấy bài viết nào</h3>
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-1 max-w-md mx-auto">
          Không có bài viết nào phù hợp. Hãy thử từ khóa khác hoặc bật tính năng Tìm kiếm AI để tìm theo ý nghĩa câu hỏi.
        </p>

        <!-- Switch mode suggestion if keyword mode -->
        <div v-if="textMode === 'keyword' && !selectedFile" class="mt-5">
          <button
            @click="textMode = 'semantic'"
            class="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-linear-to-r from-purple-600 to-indigo-600 text-white font-medium text-sm shadow-sm hover:from-purple-700 hover:to-indigo-700 transition-all cursor-pointer"
          >
            <Sparkles :size="16" />
            <span>Thử tìm bằng Tìm kiếm AI</span>
          </button>
        </div>
      </div>

      <!-- Initial State (No search yet): Show Trending Suggestions & Recommended Posts -->
      <div v-else class="space-y-8">
        <!-- Quick Suggestions Section -->
        <div class="p-6 bg-linear-to-br from-primary-50/50 via-white to-indigo-50/30 dark:from-surface-800 dark:via-surface-850 dark:to-surface-800 rounded-3xl border border-primary-100 dark:border-surface-700">
          <div class="flex items-center gap-2 mb-3">
            <TrendingUp :size="18" class="text-primary-600 dark:text-primary-400" />
            <h3 class="font-bold text-gray-900 dark:text-white text-base">Từ khóa nổi bật & Gợi ý</h3>
          </div>
          <div class="flex flex-wrap gap-2">
            <button
              v-for="kw in trendingSuggestions"
              :key="kw"
              @click="applySuggestion(kw)"
              class="px-4 py-2 bg-white dark:bg-surface-700 hover:bg-primary-50 dark:hover:bg-primary-950/40 border border-gray-200 dark:border-surface-600 hover:border-primary-400 text-gray-700 dark:text-gray-200 text-xs sm:text-sm font-medium rounded-xl transition-all shadow-2xs cursor-pointer flex items-center gap-1.5"
            >
              <span>{{ kw }}</span>
              <ArrowRight :size="12" class="opacity-40" />
            </button>
          </div>
        </div>

        <!-- Latest Posts Section -->
        <div>
          <div class="flex items-center justify-between mb-4">
            <h3 class="font-bold text-gray-900 dark:text-white text-base flex items-center gap-2">
              <Layers :size="18" class="text-primary-500" />
              <span>Khám phá bài viết mới nhất</span>
            </h3>
          </div>

          <div v-if="isLoadingInitial" class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div v-for="i in 4" :key="i" class="p-6 bg-white dark:bg-surface-800 rounded-3xl border border-gray-100 dark:border-surface-700 space-y-4">
              <div class="flex items-center gap-3">
                <Skeleton type="avatar" size="md" />
                <div class="space-y-1.5 flex-1">
                  <Skeleton type="text" class="w-32 h-4" />
                </div>
              </div>
              <Skeleton type="text" class="w-3/4 h-5" />
            </div>
          </div>
          <div v-else-if="initialPosts.length > 0" class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <PostCard v-for="post in initialPosts" :key="post.id" :post="post" />
          </div>
        </div>
      </div>
    </div>

    <!-- TAB 2: USERS -->
    <div v-else-if="activeTab === 'users'">
      <div v-if="isLoadingUsers" class="space-y-3">
        <Skeleton v-for="i in 3" :key="i" type="card" class="h-20 rounded-2xl" />
      </div>
      <div v-else-if="filteredUsers.length > 0" class="space-y-3">
        <SearchUserItem
          v-for="u in filteredUsers"
          :key="u.id"
          :user="u"
          @click="router.push(`/profile/${u.id}`)"
        />
      </div>
      <div v-else class="text-center py-16 text-gray-500">
        <Users :size="48" class="mx-auto mb-4 opacity-30" />
        <p class="text-lg font-medium">Không tìm thấy tác giả nào</p>
      </div>
    </div>

    <!-- TAB 3: TAGS -->
    <div v-else-if="activeTab === 'tags'">
      <div v-if="filteredTags.length > 0" class="flex flex-wrap gap-3">
        <button
          v-for="tag in filteredTags"
          :key="tag"
          @click="router.push(`/tags/${tag}`)"
          class="flex items-center gap-2 px-5 py-3 bg-white dark:bg-surface-800 rounded-2xl border border-gray-200 dark:border-surface-700 hover:border-primary-500/30 hover:bg-primary-50 dark:hover:bg-primary-500/10 transition-all cursor-pointer"
        >
          <Tag :size="16" class="text-primary-500" />
          <span class="font-medium text-gray-900 dark:text-white">#{{ tag }}</span>
        </button>
      </div>
      <div v-else class="text-center py-16 text-gray-500">
        <Tag :size="48" class="mx-auto mb-4 opacity-30" />
        <p class="text-lg font-medium">Không tìm thấy chủ đề nào</p>
      </div>
    </div>
  </div>
</template>
