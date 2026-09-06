<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import {
  MapPin, Navigation, Minus, Plus, Search as SearchIcon,
  Clock, Eye, ArrowUp, X, CalendarDays, Filter
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

L.Icon.Default.mergeOptions({ iconRetinaUrl, iconUrl, shadowUrl })

const router = useRouter()
const searchRadius = ref(5)
const searchLocation = ref('')
const selectedPost = ref<Post | null>(null)
const mapContainer = ref<HTMLElement | null>(null)
let map: L.Map | null = null
let markersLayer: L.LayerGroup | null = null

const { posts, fetchPosts } = usePosts()

// Category filter
const categoryFilters = [
  { slug: 'all', label: 'Tất cả', icon: '📍' },
  { slug: 'tim-tro', label: 'Tìm trọ', icon: '🏠' },
  { slug: 'pass-do', label: 'Pass đồ', icon: '🛒' },
  { slug: 'review-dia-diem', label: 'Review', icon: '📍' },
  { slug: 'su-kien', label: 'Sự kiện', icon: '🎉' },
]
const selectedFilter = ref('all')

// Filtered posts
const postsWithLocation = computed(() => {
  let filtered = posts.value.filter(p => p.location)
  
  // Filter by category
  if (selectedFilter.value !== 'all') {
    filtered = filtered.filter(p => p.category.slug === selectedFilter.value)
  }
  
  // Filter by search text
  if (searchLocation.value.trim()) {
    const q = searchLocation.value.toLowerCase()
    filtered = filtered.filter(p =>
      p.title.toLowerCase().includes(q) ||
      p.location?.address?.toLowerCase().includes(q)
    )
  }
  
  return filtered
})

// Category icon mapping for markers
const getCategoryEmoji = (slug: string) => {
  const map: Record<string, string> = {
    'tim-tro': '🏠',
    'pass-do': '🛒',
    'review-dia-diem': '📍',
    'su-kien': '🎉',
    'review': '⭐',
  }
  return map[slug] || '📌'
}

// Create custom div icon with emoji
const createEmojiIcon = (emoji: string) => {
  return L.divIcon({
    html: `<div style="font-size: 24px; line-height: 1; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3)); cursor: pointer;">${emoji}</div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
    className: 'emoji-marker'
  })
}

// Format event time
const formatEventTime = (start?: string, end?: string) => {
  if (!start) return ''
  const s = new Date(start)
  const e = end ? new Date(end) : null
  const dateStr = s.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
  const startTime = s.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
  const endTime = e ? e.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : ''
  return `${dateStr} · ${startTime}${endTime ? ' - ' + endTime : ''}`
}

// Render markers on map
const renderMarkers = () => {
  if (!map) return
  if (markersLayer) {
    markersLayer.clearLayers()
  } else {
    markersLayer = L.layerGroup().addTo(map)
  }

  postsWithLocation.value.forEach(post => {
    if (!post.location) return
    const emoji = getCategoryEmoji(post.category.slug)
    const icon = createEmojiIcon(emoji)
    const marker = L.marker([post.location.lat, post.location.lng], { icon }).addTo(markersLayer!)
    
    // Create popup content
    const popupContent = `
      <div style="min-width: 200px; font-family: system-ui, sans-serif;">
        <div style="font-weight: 700; font-size: 13px; margin-bottom: 4px; line-height: 1.3;">${post.title}</div>
        <div style="font-size: 11px; color: #888; display: flex; align-items: center; gap: 4px;">
          <span>${emoji}</span> ${post.category.name}
        </div>
        ${post.eventStartTime ? `<div style="font-size: 11px; color: #7c3aed; margin-top: 4px;">🕐 ${formatEventTime(post.eventStartTime, post.eventEndTime)}</div>` : ''}
      </div>
    `
    marker.bindPopup(popupContent, { className: 'custom-popup' })
    
    marker.on('click', () => {
      selectedPost.value = post
      map?.setView([post.location!.lat, post.location!.lng], 15, { animate: true })
    })
  })
}

// Watch filter changes
watch([selectedFilter, searchLocation], () => {
  renderMarkers()
})

const selectPostFromList = (post: Post) => {
  selectedPost.value = post
  if (post.location && map) {
    map.setView([post.location.lat, post.location.lng], 15, { animate: true })
  }
}

onMounted(async () => {
  if (!mapContainer.value) return
  await fetchPosts()

  map = L.map(mapContainer.value, {
    zoomControl: false
  }).setView([10.775, 106.690], 13)

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
  }).addTo(map)

  renderMarkers()
})

onUnmounted(() => {
  if (map) {
    map.remove()
    map = null
  }
})

const zoomIn = () => map?.zoomIn()
const zoomOut = () => map?.zoomOut()

const goToCurrentLocation = () => {
  if (!navigator.geolocation) return
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      map?.setView([pos.coords.latitude, pos.coords.longitude], 15, { animate: true })
    }
  )
}
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
          @click="goToCurrentLocation"
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
          @click="selectPostFromList(post)"
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
        <button @click="goToCurrentLocation" class="p-2.5 bg-white dark:bg-surface-800 rounded-xl shadow-lg border border-gray-200 dark:border-surface-700 text-gray-600 dark:text-gray-400 hover:text-primary-500 transition-colors">
          <Navigation :size="18" />
        </button>
      </div>

      <!-- Selected Post Card -->
      <transition name="slide-up">
        <div
          v-if="selectedPost"
          class="absolute bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-96 bg-white dark:bg-surface-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-surface-700 overflow-hidden z-1000"
        >
          <div class="relative">
            <img :src="selectedPost.coverImage" class="w-full h-36 object-cover" />
            <button
              @click="selectedPost = null"
              class="absolute top-2 right-2 p-1.5 rounded-lg bg-black/50 text-white hover:bg-black/70 transition-colors"
            >
              <X :size="14" />
            </button>
            <!-- Category badge -->
            <div class="absolute bottom-2 left-2 px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-sm text-xs font-medium text-white">
              {{ getCategoryEmoji(selectedPost.category.slug) }} {{ selectedPost.category.name }}
            </div>
          </div>
          <div class="p-4">
            <h4 class="font-bold text-gray-900 dark:text-white line-clamp-2 mb-2">{{ selectedPost.title }}</h4>
            <p class="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mb-3">{{ selectedPost.excerpt }}</p>
            <div class="flex items-center gap-2 mb-2">
              <UserAvatar :user="selectedPost.author" size="sm" />
              <span class="text-sm text-gray-600 dark:text-gray-400">{{ selectedPost.author.name }}</span>
            </div>
            <div class="flex items-center gap-2 text-xs text-gray-400 mb-2">
              <MapPin :size="12" class="text-primary-500" />
              <span class="truncate">{{ selectedPost.location?.address }}</span>
            </div>
            <!-- Event time -->
            <div v-if="selectedPost.eventStartTime" class="flex items-center gap-2 text-xs text-purple-500 mb-3 px-2.5 py-1.5 rounded-lg bg-purple-50 dark:bg-purple-900/10">
              <CalendarDays :size="12" />
              <span class="font-medium">{{ formatEventTime(selectedPost.eventStartTime, selectedPost.eventEndTime) }}</span>
            </div>
            <button
              @click="router.push(`/posts/${selectedPost.id}`)"
              class="w-full py-2.5 rounded-xl text-sm font-medium text-white gradient-primary hover:opacity-90 transition-all"
            >
              Xem bài viết
            </button>
          </div>
        </div>
      </transition>

      <!-- Info badge -->
      <div class="absolute top-4 left-4 sm:left-auto bg-white/90 dark:bg-surface-800/90 backdrop-blur-sm rounded-xl px-4 py-2 shadow-lg border border-gray-200 dark:border-surface-700 z-20">
        <p class="text-xs font-medium text-gray-600 dark:text-gray-400">
          📍 TP. Hồ Chí Minh · {{ postsWithLocation.length }} bài viết
          <span v-if="selectedFilter !== 'all'" class="text-primary-500">
            · {{ categoryFilters.find(c => c.slug === selectedFilter)?.label }}
          </span>
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

/* Hide scrollbar for filter chips */
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

/* Custom emoji marker - remove default leaflet icon styling */
:deep(.emoji-marker) {
  background: none !important;
  border: none !important;
}
</style>
