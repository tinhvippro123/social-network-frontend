<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import {
  MapPin, Navigation, Minus, Plus, Layers, Search as SearchIcon,
  Clock, Eye, ArrowUp, X, SlidersHorizontal
} from '@lucide/vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { usePosts } from '@/composables/usePosts'
import { formatDate, formatNumber } from '@/utils/formatters'
import UserAvatar from '@/components/UserAvatar.vue'
import type { Post } from '@/types'

// Fix leaflet default icon issue in Vue/Vite
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png'
import iconUrl from 'leaflet/dist/images/marker-icon.png'
import shadowUrl from 'leaflet/dist/images/marker-shadow.png'

L.Icon.Default.mergeOptions({
  iconRetinaUrl,
  iconUrl,
  shadowUrl,
})

const router = useRouter()
const searchRadius = ref(5)
const searchLocation = ref('')
const selectedPost = ref<Post | null>(null)
const showFilters = ref(false)
const mapContainer = ref<HTMLElement | null>(null)
let map: L.Map | null = null

const { posts, fetchPosts } = usePosts()
const postsWithLocation = computed(() => posts.value.filter(p => p.location))

const viewMode = ref('map')

onMounted(async () => {
  if (!mapContainer.value) return
  
  await fetchPosts()

  // Initialize map centered at Ho Chi Minh City
  map = L.map(mapContainer.value, {
    zoomControl: false // We will use our custom controls
  }).setView([10.762622, 106.660172], 13)

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
  }).addTo(map)

  // Add markers
  postsWithLocation.value.forEach(post => {
    if (!post.location) return
    const marker = L.marker([post.location.lat, post.location.lng]).addTo(map!)
    marker.on('click', () => {
      selectedPost.value = post
      map?.setView([post.location!.lat, post.location!.lng], 15, { animate: true })
    })
  })
})

onUnmounted(() => {
  if (map) {
    map.remove()
  }
})

const zoomIn = () => map?.zoomIn()
const zoomOut = () => map?.zoomOut()
</script>

<template>
  <div class="flex h-[calc(100vh-4rem)] overflow-hidden">
    <!-- Sidebar -->
    <div class="w-full sm:w-80 lg:w-96 shrink-0 flex flex-col bg-white dark:bg-surface-800 border-r border-gray-200 dark:border-surface-700 z-10"
      :class="selectedPost ? 'hidden sm:flex' : 'flex'">
      <!-- Header -->
      <div class="p-4 border-b border-gray-200 dark:border-surface-700">
        <h2 class="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-3">
          <MapPin :size="18" class="text-primary-500" />
          Bản đồ bài viết
        </h2>
        <div class="flex items-center gap-2 bg-gray-100 dark:bg-surface-700 rounded-xl px-3 py-2 mb-3">
          <SearchIcon :size="16" class="text-gray-400" />
          <input
            v-model="searchLocation"
            type="text"
            placeholder="Tìm kiếm địa điểm..."
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
          class="w-full mt-3 flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-medium text-white gradient-primary hover:opacity-90 transition-all"
        >
          <Navigation :size="14" />
          Tìm quanh vị trí hiện tại
        </button>
      </div>

      <!-- Posts with Location -->
      <div class="flex-1 overflow-y-auto">
        <div class="px-4 py-2">
          <p class="text-xs font-medium text-gray-400">{{ postsWithLocation.length }} bài viết có vị trí</p>
        </div>
        <div
          v-for="post in postsWithLocation"
          :key="post.id"
          @click="selectedPost = post"
          :class="[
            'flex items-start gap-3 px-4 py-3 cursor-pointer transition-all border-b border-gray-100 dark:border-surface-700/50',
            selectedPost?.id === post.id
              ? 'bg-primary-50 dark:bg-primary-900/10 border-l-2 border-l-primary-500'
              : 'hover:bg-gray-50 dark:hover:bg-surface-700/50'
          ]"
        >
          <img :src="post.coverImage" class="w-16 h-12 rounded-lg object-cover shrink-0" />
          <div class="flex-1 min-w-0">
            <h4 class="text-sm font-semibold text-gray-900 dark:text-white line-clamp-2 group-hover:text-primary-500">
              {{ post.title }}
            </h4>
            <div class="flex items-center gap-2 mt-1 text-xs text-gray-400">
              <MapPin :size="10" class="text-primary-500" />
              <span>{{ post.location?.address }}</span>
            </div>
            <div class="flex items-center gap-3 mt-1 text-xs text-gray-400">
              <span class="flex items-center gap-0.5"><Eye :size="10" /> {{ formatNumber(post.viewsCount) }}</span>
              <span class="flex items-center gap-0.5"><ArrowUp :size="10" /> {{ post.upvotesCount }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Map Area -->
    <div class="flex-1 relative bg-gray-200 dark:bg-surface-900">
      <!-- Map Container -->
      <div ref="mapContainer" class="absolute inset-0 z-0"></div>

      <!-- Map Controls -->
      <div class="absolute top-4 right-4 flex flex-col gap-2 z-1000">
        <button @click="zoomIn" class="p-2.5 bg-white dark:bg-surface-800 rounded-xl shadow-lg border border-gray-200 dark:border-surface-700 text-gray-600 dark:text-gray-400 hover:text-primary-500 transition-colors">
          <Plus :size="18" />
        </button>
        <button @click="zoomOut" class="p-2.5 bg-white dark:bg-surface-800 rounded-xl shadow-lg border border-gray-200 dark:border-surface-700 text-gray-600 dark:text-gray-400 hover:text-primary-500 transition-colors">
          <Minus :size="18" />
        </button>
        <button class="p-2.5 bg-white dark:bg-surface-800 rounded-xl shadow-lg border border-gray-200 dark:border-surface-700 text-gray-600 dark:text-gray-400 hover:text-primary-500 transition-colors">
          <Navigation :size="18" />
        </button>
        <button class="p-2.5 bg-white dark:bg-surface-800 rounded-xl shadow-lg border border-gray-200 dark:border-surface-700 text-gray-600 dark:text-gray-400 hover:text-primary-500 transition-colors">
          <Layers :size="18" />
        </button>
      </div>

      <!-- Selected Post Card -->
      <transition name="slide-up">
        <div
          v-if="selectedPost"
          class="absolute bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-80 bg-white dark:bg-surface-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-surface-700 overflow-hidden z-1000"
        >
          <div class="relative">
            <img :src="selectedPost.coverImage" class="w-full h-32 object-cover" />
            <button
              @click="selectedPost = null"
              class="absolute top-2 right-2 p-1.5 rounded-lg bg-black/50 text-white hover:bg-black/70 transition-colors"
            >
              <X :size="14" />
            </button>
          </div>
          <div class="p-4">
            <h4 class="font-bold text-gray-900 dark:text-white line-clamp-2 mb-2">{{ selectedPost.title }}</h4>
            <div class="flex items-center gap-2 mb-2">
              <UserAvatar :user="selectedPost.author" size="sm" />
              <span class="text-sm text-gray-600 dark:text-gray-400">{{ selectedPost.author.name }}</span>
            </div>
            <div class="flex items-center gap-2 text-xs text-gray-400 mb-3">
              <MapPin :size="12" class="text-primary-500" />
              <span>{{ selectedPost.location?.address }}</span>
            </div>
            <button
              @click="router.push(`/posts/${selectedPost.id}`)"
              class="w-full py-2 rounded-xl text-sm font-medium text-white gradient-primary hover:opacity-90 transition-all"
            >
              Xem bài viết
            </button>
          </div>
        </div>
      </transition>

      <!-- Info badge -->
      <div class="absolute top-4 left-4 sm:left-auto bg-white/90 dark:bg-surface-800/90 backdrop-blur-sm rounded-xl px-4 py-2 shadow-lg border border-gray-200 dark:border-surface-700 z-20">
        <p class="text-xs font-medium text-gray-600 dark:text-gray-400">
          📍 TP. Hồ Chí Minh · {{ postsWithLocation.length }} bài viết gần đây
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.slide-up-enter-active, .slide-up-leave-active {
  transition: all 0.3s ease;
}
.slide-up-enter-from, .slide-up-leave-to {
  opacity: 0;
  transform: translateY(20px);
}
</style>
