<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import {
  MapPin, Navigation, Minus, Plus, Search as SearchIcon,
  Clock, Eye, ArrowUp, X, CalendarDays, Filter
} from '@lucide/vue'
import { useMapView } from '@/composables/core/useMapView'
import { formatDate, formatNumber } from '@/utils/formatters'
import MapSidebar from './components/MapSidebar.vue'
import MapSelectedPostCard from './components/MapSelectedPostCard.vue'
import type { Post } from '@/types'

const router = useRouter()
const mapContainer = ref<HTMLElement | null>(null)

const {
  searchRadius,
  searchLocation,
  selectedPost,
  categoryFilters,
  selectedFilter,
  postsWithLocation,
  selectPostFromList,
  initMap,
  destroyMap,
  zoomIn,
  zoomOut,
  locateUser,
  getCategoryEmoji,
  formatEventTime,
  goToCurrentLocation
} = useMapView(mapContainer)
</script>

<template>
  <div class="flex h-[calc(100vh-4rem)] overflow-hidden">
    <!-- Sidebar -->
    <MapSidebar
      v-model:searchLocation="searchLocation"
      v-model:searchRadius="searchRadius"
      v-model:selectedFilter="selectedFilter"
      :selectedPost="selectedPost"
      :categoryFilters="categoryFilters"
      :postsWithLocation="postsWithLocation"
      :getCategoryEmoji="getCategoryEmoji"
      :formatEventTime="formatEventTime"
      @goToCurrentLocation="goToCurrentLocation"
      @selectPostFromList="selectPostFromList"
    />

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
      <MapSelectedPostCard
        v-model:selectedPost="selectedPost"
        :getCategoryEmoji="getCategoryEmoji"
        :formatEventTime="formatEventTime"
      />

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
