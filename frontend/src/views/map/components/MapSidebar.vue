<script setup lang="ts">
import { ref } from 'vue'
import { MapPin, Search as SearchIcon, Navigation, Clock, Eye, ArrowUp, ChevronUp, ChevronDown, X, List } from '@lucide/vue'
import { formatNumber } from '@/utils/formatters'
import type { Post } from '@/types'

const searchLocation = defineModel<string>('searchLocation')
const searchRadius = defineModel<number>('searchRadius')
const selectedFilter = defineModel<string>('selectedFilter')

defineProps<{
  selectedPost: Post | null
  categoryFilters: any[]
  postsWithLocation: Post[]
  getCategoryEmoji: (slug: string) => string
  formatEventTime: (start: string, end?: string) => string
}>()

const emit = defineEmits<{
  (e: 'goToCurrentLocation'): void
  (e: 'selectPostFromList', post: Post): void
}>()

// Mobile bottom sheet state
const isMobileExpanded = ref(false)
const showMobileSidebar = ref(false)

function toggleMobileSheet() {
  isMobileExpanded.value = !isMobileExpanded.value
}

function toggleMobileSidebar() {
  showMobileSidebar.value = !showMobileSidebar.value
}

function selectPost(post: Post) {
  emit('selectPostFromList', post)
  // Collapse on mobile after selecting
  isMobileExpanded.value = false
  showMobileSidebar.value = false
}
</script>

<template>
  <!-- Desktop Sidebar (hidden on mobile) -->
  <div class="hidden sm:flex w-80 lg:w-96 shrink-0 flex-col bg-white dark:bg-surface-800 border-r border-gray-200 dark:border-surface-700 z-10"
    :class="selectedPost ? 'hidden lg:flex' : ''">
    <!-- Header -->
    <div class="p-4 border-b border-gray-200 dark:border-surface-700">
      <h2 class="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-3">
        <MapPin :size="18" class="text-primary-500" />
        Bản đồ cộng đồng
      </h2>

      <!-- Category Filter Chips -->
      <div class="flex flex-wrap items-center gap-2 mb-3">
        <button
          v-for="cat in categoryFilters"
          :key="cat.slug"
          @click="selectedFilter = cat.slug"
          :class="[
            'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all',
            selectedFilter === cat.slug
              ? 'bg-primary-500 text-white shadow-md shadow-primary-500/25'
              : 'bg-gray-100 dark:bg-surface-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-surface-600'
          ]"
        >
          <span>{{ cat.icon }}</span>
          {{ cat.label }}
        </button>
      </div>

      <!-- Search -->
      <div class="flex items-center gap-2 bg-gray-100 dark:bg-surface-700 rounded-xl px-3 py-2 mb-3">
        <SearchIcon :size="16" class="text-gray-400" />
        <input
          v-model="searchLocation"
          type="text"
          placeholder="Tìm kiếm bài viết, địa điểm..."
          class="bg-transparent border-none outline-none text-sm w-full text-gray-700 dark:text-gray-300 placeholder-gray-400"
        />
      </div>

      <!-- Radius Slider -->
      <div class="flex items-center justify-between mb-2">
        <span class="text-xs font-medium text-gray-500 dark:text-gray-400">Bán kính tìm kiếm</span>
        <span class="text-xs font-bold text-primary-500">{{ searchRadius }} km</span>
      </div>
      <input
        v-model="searchRadius"
        type="range"
        min="1"
        max="50"
        class="w-full h-1.5 bg-gray-200 dark:bg-surface-600 rounded-lg appearance-none cursor-pointer accent-primary-500"
      />

      <button
        @click="emit('goToCurrentLocation')"
        class="w-full mt-3 flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-medium text-white gradient-primary hover:opacity-90 transition-all"
      >
        <Navigation :size="14" />
        Tìm quanh vị trí hiện tại
      </button>
    </div>

    <!-- Posts with Location -->
    <div class="flex-1 overflow-y-auto">
      <div class="px-4 py-2 flex items-center justify-between">
        <p class="text-xs font-medium text-gray-400">{{ postsWithLocation.length }} bài viết có vị trí</p>
        <p v-if="selectedFilter !== 'all'" class="text-xs text-primary-500 font-medium">
          {{ categoryFilters.find(c => c.slug === selectedFilter)?.icon }} {{ categoryFilters.find(c => c.slug === selectedFilter)?.label }}
        </p>
      </div>

      <div v-if="postsWithLocation.length === 0" class="px-4 py-12 text-center">
        <MapPin :size="32" class="mx-auto text-gray-300 dark:text-surface-600 mb-3" />
        <p class="text-sm text-gray-400">Không tìm thấy bài viết nào</p>
      </div>

      <div
        v-for="post in postsWithLocation"
        :key="post.id"
        @click="emit('selectPostFromList', post)"
        :class="[
          'flex items-start gap-3 px-4 py-3 cursor-pointer transition-all border-b border-gray-100 dark:border-surface-700/50',
          selectedPost?.id === post.id
            ? 'bg-primary-50 dark:bg-primary-900/10 border-l-2 border-l-primary-500'
            : 'hover:bg-gray-50 dark:hover:bg-surface-700/50'
        ]"
      >
        <img :src="post.coverImage" class="w-16 h-12 rounded-lg object-cover shrink-0" />
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-1.5 mb-0.5">
            <span class="text-xs">{{ getCategoryEmoji(post.category.slug) }}</span>
            <span class="text-xs text-gray-400">{{ post.category.name }}</span>
          </div>
          <h4 class="text-sm font-semibold text-gray-900 dark:text-white line-clamp-2">
            {{ post.title }}
          </h4>
          <div class="flex items-center gap-2 mt-1 text-xs text-gray-400">
            <MapPin :size="10" class="text-primary-500" />
            <span class="truncate">{{ post.location?.address }}</span>
          </div>
          <div v-if="post.eventStartTime" class="flex items-center gap-1 mt-1 text-xs text-purple-500">
            <Clock :size="10" />
            <span>{{ formatEventTime(post.eventStartTime, post.eventEndTime) }}</span>
          </div>
          <div class="flex items-center gap-3 mt-1 text-xs text-gray-400">
            <span class="flex items-center gap-0.5"><Eye :size="10" /> {{ formatNumber(post.viewsCount) }}</span>
            <span class="flex items-center gap-0.5"><ArrowUp :size="10" /> {{ post.upvotesCount }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Mobile: Toggle Button (floating) -->
  <button
    @click="toggleMobileSidebar"
    class="sm:hidden absolute bottom-4 left-4 z-30 flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-surface-800 rounded-full shadow-xl border border-gray-200 dark:border-surface-700 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-surface-700 transition-all"
  >
    <List :size="16" class="text-primary-500" />
    {{ postsWithLocation.length }} bài viết
  </button>

  <!-- Mobile: Bottom Sheet Overlay -->
  <Teleport to="body">
    <Transition name="sheet">
      <div v-if="showMobileSidebar" class="sm:hidden fixed inset-0 z-50">
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" @click="showMobileSidebar = false" />

        <!-- Bottom Sheet -->
        <div
          :class="[
            'absolute left-0 right-0 bg-white dark:bg-surface-800 rounded-t-2xl shadow-2xl transition-all duration-300 flex flex-col',
            isMobileExpanded ? 'top-12 bottom-0' : 'bottom-0 max-h-[65vh]'
          ]"
        >
          <!-- Handle bar -->
          <div class="flex items-center justify-center py-2 cursor-pointer" @click="toggleMobileSheet">
            <div class="w-10 h-1 bg-gray-300 dark:bg-surface-600 rounded-full" />
          </div>

          <!-- Sheet Header -->
          <div class="flex items-center justify-between px-4 pb-2">
            <h3 class="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <MapPin :size="16" class="text-primary-500" />
              Bài viết gần đây
            </h3>
            <div class="flex items-center gap-1">
              <button @click="toggleMobileSheet" class="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-surface-700 transition-colors">
                <component :is="isMobileExpanded ? ChevronDown : ChevronUp" :size="18" />
              </button>
              <button @click="showMobileSidebar = false" class="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-surface-700 transition-colors">
                <X :size="18" />
              </button>
            </div>
          </div>

          <!-- Filter chips (scrollable) -->
          <div class="flex items-center gap-2 px-4 pb-3 overflow-x-auto scrollbar-hide">
            <button
              v-for="cat in categoryFilters"
              :key="cat.slug"
              @click="selectedFilter = cat.slug"
              :class="[
                'flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all shrink-0',
                selectedFilter === cat.slug
                  ? 'bg-primary-500 text-white'
                  : 'bg-gray-100 dark:bg-surface-700 text-gray-600 dark:text-gray-400'
              ]"
            >
              <span>{{ cat.icon }}</span>
              {{ cat.label }}
            </button>
          </div>

          <!-- Search (expanded mode) -->
          <div v-if="isMobileExpanded" class="px-4 pb-3">
            <div class="flex items-center gap-2 bg-gray-100 dark:bg-surface-700 rounded-xl px-3 py-2">
              <SearchIcon :size="14" class="text-gray-400" />
              <input
                v-model="searchLocation"
                type="text"
                placeholder="Tìm kiếm..."
                class="bg-transparent border-none outline-none text-sm w-full text-gray-700 dark:text-gray-300 placeholder-gray-400"
              />
            </div>
          </div>

          <!-- Location button -->
          <div class="px-4 pb-3">
            <button
              @click="emit('goToCurrentLocation')"
              class="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium text-white gradient-primary hover:opacity-90 transition-all"
            >
              <Navigation :size="14" />
              Tìm quanh vị trí hiện tại
            </button>
          </div>

          <!-- Posts list -->
          <div class="flex-1 overflow-y-auto border-t border-gray-100 dark:border-surface-700">
            <div class="px-4 py-2">
              <p class="text-xs font-medium text-gray-400">{{ postsWithLocation.length }} bài viết có vị trí</p>
            </div>

            <div v-if="postsWithLocation.length === 0" class="px-4 py-8 text-center">
              <MapPin :size="24" class="mx-auto text-gray-300 dark:text-surface-600 mb-2" />
              <p class="text-sm text-gray-400">Không tìm thấy bài viết nào</p>
            </div>

            <div
              v-for="post in postsWithLocation"
              :key="post.id"
              @click="selectPost(post)"
              :class="[
                'flex items-start gap-3 px-4 py-3 cursor-pointer transition-all border-b border-gray-100 dark:border-surface-700/50',
                selectedPost?.id === post.id
                  ? 'bg-primary-50 dark:bg-primary-900/10 border-l-2 border-l-primary-500'
                  : 'hover:bg-gray-50 dark:hover:bg-surface-700/50'
              ]"
            >
              <img :src="post.coverImage" class="w-14 h-10 rounded-lg object-cover shrink-0" />
              <div class="flex-1 min-w-0">
                <h4 class="text-sm font-semibold text-gray-900 dark:text-white line-clamp-1">
                  {{ post.title }}
                </h4>
                <div class="flex items-center gap-2 mt-0.5 text-xs text-gray-400">
                  <MapPin :size="10" class="text-primary-500" />
                  <span class="truncate">{{ post.location?.address }}</span>
                </div>
                <div class="flex items-center gap-3 mt-0.5 text-xs text-gray-400">
                  <span class="flex items-center gap-0.5"><Eye :size="10" /> {{ formatNumber(post.viewsCount) }}</span>
                  <span class="flex items-center gap-0.5"><ArrowUp :size="10" /> {{ post.upvotesCount }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
/* Hide scrollbar for filter chips */
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.sheet-enter-active {
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.sheet-leave-active {
  transition: all 0.2s ease-in;
}
.sheet-enter-from {
  opacity: 0;
}
.sheet-enter-from > div:last-child {
  transform: translateY(100%);
}
.sheet-leave-to {
  opacity: 0;
}
</style>
