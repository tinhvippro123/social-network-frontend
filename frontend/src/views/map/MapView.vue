<script setup lang="ts">
import { ref } from 'vue'
import { Navigation, Minus, Plus, Loader2, X } from '@lucide/vue'
import { useMapView } from '@/composables/core/useMapView'
import MapSidebar from './components/MapSidebar.vue'
import MapSelectedPostCard from './components/MapSelectedPostCard.vue'
import MapControlButton from './components/MapControlButton.vue'

const mapContainer = ref<HTMLElement | null>(null)

const {
  searchRadius,
  searchLocation,
  selectedPost,
  categoryFilters,
  selectedFilter,
  postsWithLocation,
  searchCenter,
  isNearbyLoading,
  isLocating,
  regionLabel,
  distanceTo,
  selectPostFromList,
  zoomIn,
  zoomOut,
  formatEventTime,
  goToCurrentLocation,
  clearNearby
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
      :searchCenter="searchCenter"
      :isNearbyLoading="isNearbyLoading"
      :isLocating="isLocating"
      :distanceTo="distanceTo"
      :formatEventTime="formatEventTime"
      @goToCurrentLocation="goToCurrentLocation"
      @clearNearby="clearNearby"
      @selectPostFromList="selectPostFromList"
    />

    <!-- Map Area -->
    <div class="flex-1 relative bg-gray-200 dark:bg-surface-900">
      <!-- Map Container -->
      <div ref="mapContainer" class="absolute inset-0 z-0"></div>

      <!-- Map Controls -->
      <div class="absolute top-4 right-4 flex flex-col gap-2 z-1000">
        <MapControlButton :icon="Plus" @click="zoomIn" title="Phóng to" />
        <MapControlButton :icon="Minus" @click="zoomOut" title="Thu nhỏ" />
        <MapControlButton :icon="Navigation" @click="goToCurrentLocation" title="Tìm quanh vị trí của tôi" />
      </div>

      <!-- Selected Post Card -->
      <MapSelectedPostCard
        v-model:selectedPost="selectedPost"
        :distanceTo="distanceTo"
        :formatEventTime="formatEventTime"
      />

      <!-- Info badge -->
      <div class="absolute top-4 left-4 right-20 sm:right-auto max-w-md bg-white/90 dark:bg-surface-800/90 backdrop-blur-sm rounded-xl px-4 py-2 shadow-lg border border-gray-200 dark:border-surface-700 z-1000 flex items-center gap-2">
        <p class="text-xs font-medium text-gray-600 dark:text-gray-400 flex items-center gap-1.5 min-w-0">
          <Loader2 v-if="isNearbyLoading" :size="12" class="animate-spin text-primary-500 shrink-0" />
          <span class="shrink-0">📍</span>
          <span class="truncate">{{ regionLabel }} · {{ postsWithLocation.length }} bài viết</span>
          <span v-if="selectedFilter !== 'all'" class="text-primary-500 whitespace-nowrap shrink-0">
            · {{ categoryFilters.find(c => c.slug === selectedFilter)?.label }}
          </span>
        </p>
        <button
          v-if="searchCenter"
          type="button"
          @click="clearNearby"
          title="Tắt vòng bán kính"
          class="p-1 -mr-1 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-surface-700 transition-colors shrink-0 cursor-pointer"
        >
          <X :size="13" />
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Custom emoji marker - remove default leaflet icon styling */
:deep(.emoji-marker) {
  background: none !important;
  border: none !important;
}

/* Prevent floating ChatPopup button (bottom-right) from overlapping Leaflet attribution */
:deep(.leaflet-bottom.leaflet-right) {
  margin-right: 4.5rem;
  margin-bottom: 0.25rem;
}
</style>
