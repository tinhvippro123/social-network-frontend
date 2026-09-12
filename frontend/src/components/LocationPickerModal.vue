<script setup lang="ts">

import { X, MapPin, Search as SearchIcon, Navigation, Check, Loader2 } from '@lucide/vue'
import { useLocationPickerModal } from '@/composables/useLocationPickerModal'

interface LocationData {
  lat: number
  lng: number
  address?: string
}

const props = defineProps<{
  modelValue: boolean
  initialLocation?: LocationData | null
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'confirm': [location: LocationData]
}>()

const {
  selectedLat,
  selectedLng,
  selectedAddress,
  searchQuery,
  searchResults,
  isSearching,
  isReverseGeocoding,
  showSearchResults,
  searchPlace,
  selectSearchResult,
  getCurrentLocation,
  close,
  confirm,
  mapContainer
} = useLocationPickerModal(props, emit)
</script>

<template>
  <Teleport to="body">
    <Transition name="modal-fade">
      <div v-if="modelValue" class="fixed inset-0 z-9999 flex items-center justify-center p-4">
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="close" />

        <!-- Modal -->
        <div class="relative w-full max-w-3xl bg-white dark:bg-surface-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-surface-700 overflow-hidden flex flex-col" style="max-height: 85vh;">
          <!-- Header -->
          <div class="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-surface-700 shrink-0">
            <div class="flex items-center gap-2.5">
              <div class="w-9 h-9 rounded-xl bg-linear-to-br from-red-500 to-orange-500 flex items-center justify-center">
                <MapPin :size="18" class="text-white" />
              </div>
              <div>
                <h3 class="text-base font-bold text-gray-900 dark:text-white">Ghim vị trí</h3>
                <p class="text-xs text-gray-400">Click vào bản đồ hoặc tìm kiếm địa điểm</p>
              </div>
            </div>
            <button @click="close" class="p-2 rounded-xl text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-surface-700 transition-colors">
              <X :size="18" />
            </button>
          </div>

          <!-- Search Bar -->
          <div class="px-5 py-3 border-b border-gray-100 dark:border-surface-700/50 shrink-0">
            <div class="relative">
              <div class="flex items-center gap-2 bg-gray-100 dark:bg-surface-700 rounded-xl px-4 py-2.5">
                <SearchIcon :size="16" class="text-gray-400 shrink-0" />
                <input
                  v-model="searchQuery"
                  @input="searchPlace"
                  type="text"
                  placeholder="Tìm kiếm địa điểm, quán ăn, đường phố..."
                  class="bg-transparent border-none outline-none text-sm w-full text-gray-700 dark:text-gray-300 placeholder-gray-400"
                />
                <Loader2 v-if="isSearching" :size="16" class="text-primary-500 animate-spin shrink-0" />
              </div>

              <!-- Search Results Dropdown -->
              <div v-if="showSearchResults && searchResults.length > 0" class="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-surface-800 rounded-xl shadow-xl border border-gray-200 dark:border-surface-700 overflow-hidden z-50">
                <button
                  v-for="(result, i) in searchResults"
                  :key="i"
                  @click="selectSearchResult(result)"
                  class="w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-surface-700/50 transition-colors border-b border-gray-100 dark:border-surface-700/50 last:border-0"
                >
                  <MapPin :size="14" class="text-red-500 mt-0.5 shrink-0" />
                  <span class="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">{{ result.display_name }}</span>
                </button>
              </div>
            </div>
          </div>

          <!-- Map -->
          <div class="flex-1 relative min-h-87.5">
            <div ref="mapContainer" class="absolute inset-0" />

            <!-- Get Current Location Button -->
            <button
              @click="getCurrentLocation"
              class="absolute bottom-4 right-4 z-1000 flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-surface-800 rounded-xl shadow-lg border border-gray-200 dark:border-surface-700 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-primary-500 hover:border-primary-300 transition-all"
            >
              <Navigation :size="14" />
              Vị trí hiện tại
            </button>
          </div>

          <!-- Selected Location Info & Confirm -->
          <div class="px-5 py-4 border-t border-gray-200 dark:border-surface-700 shrink-0">
            <div v-if="selectedLat !== null && selectedLng !== null" class="flex items-center gap-3">
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2 mb-1">
                  <MapPin :size="14" class="text-red-500 shrink-0" />
                  <span class="text-xs font-medium text-gray-500 dark:text-gray-400">Vị trí đã chọn</span>
                  <Loader2 v-if="isReverseGeocoding" :size="12" class="text-primary-500 animate-spin" />
                </div>
                <p class="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {{ selectedAddress || `${selectedLat?.toFixed(6)}, ${selectedLng?.toFixed(6)}` }}
                </p>
              </div>
              <button
                @click="confirm"
                class="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white gradient-primary hover:opacity-90 transition-all shadow-lg shadow-primary-500/25 shrink-0"
              >
                <Check :size="16" />
                Xác nhận
              </button>
            </div>
            <div v-else class="text-center">
              <p class="text-sm text-gray-400">Click vào bản đồ để chọn vị trí, hoặc sử dụng thanh tìm kiếm ở trên</p>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.modal-fade-enter-active {
  transition: all 0.3s ease-out;
}
.modal-fade-leave-active {
  transition: all 0.2s ease-in;
}
.modal-fade-enter-from {
  opacity: 0;
}
.modal-fade-enter-from > div:last-child {
  transform: scale(0.95) translateY(10px);
}
.modal-fade-leave-to {
  opacity: 0;
}
.modal-fade-leave-to > div:last-child {
  transform: scale(0.95) translateY(10px);
}

/* Override leaflet z-index */
:deep(.leaflet-pane) {
  z-index: 1 !important;
}
:deep(.leaflet-control) {
  z-index: 2 !important;
}
</style>
