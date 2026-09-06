<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { X, MapPin, Search as SearchIcon, Navigation, Check, Loader2 } from '@lucide/vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Fix leaflet default icon issue
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png'
import iconUrl from 'leaflet/dist/images/marker-icon.png'
import shadowUrl from 'leaflet/dist/images/marker-shadow.png'

L.Icon.Default.mergeOptions({ iconRetinaUrl, iconUrl, shadowUrl })

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

const mapContainer = ref<HTMLElement | null>(null)
let map: L.Map | null = null
let marker: L.Marker | null = null

const selectedLat = ref<number | null>(null)
const selectedLng = ref<number | null>(null)
const selectedAddress = ref('')
const searchQuery = ref('')
const searchResults = ref<any[]>([])
const isSearching = ref(false)
const isReverseGeocoding = ref(false)
const showSearchResults = ref(false)

// Custom red marker icon
const redIcon = L.icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
})

// Reverse geocode: convert lat/lng to address
const reverseGeocode = async (lat: number, lng: number) => {
  isReverseGeocoding.value = true
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
      { headers: { 'Accept-Language': 'vi' } }
    )
    const data = await res.json()
    if (data.display_name) {
      selectedAddress.value = data.display_name
    } else {
      selectedAddress.value = `${lat.toFixed(6)}, ${lng.toFixed(6)}`
    }
  } catch {
    selectedAddress.value = `${lat.toFixed(6)}, ${lng.toFixed(6)}`
  } finally {
    isReverseGeocoding.value = false
  }
}

// Search for a place by name
let searchTimeout: ReturnType<typeof setTimeout> | null = null
const searchPlace = () => {
  if (searchTimeout) clearTimeout(searchTimeout)
  if (!searchQuery.value.trim()) {
    searchResults.value = []
    showSearchResults.value = false
    return
  }
  searchTimeout = setTimeout(async () => {
    isSearching.value = true
    showSearchResults.value = true
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery.value)}&limit=5&countrycodes=vn&addressdetails=1`,
        { headers: { 'Accept-Language': 'vi' } }
      )
      searchResults.value = await res.json()
    } catch {
      searchResults.value = []
    } finally {
      isSearching.value = false
    }
  }, 400)
}

// Select a search result
const selectSearchResult = (result: any) => {
  const lat = parseFloat(result.lat)
  const lng = parseFloat(result.lon)
  selectedLat.value = lat
  selectedLng.value = lng
  selectedAddress.value = result.display_name
  searchQuery.value = ''
  searchResults.value = []
  showSearchResults.value = false

  if (map) {
    map.setView([lat, lng], 16, { animate: true })
    if (marker) {
      marker.setLatLng([lat, lng])
    } else {
      marker = L.marker([lat, lng], { icon: redIcon, draggable: true }).addTo(map)
      marker.on('dragend', async () => {
        const pos = marker!.getLatLng()
        selectedLat.value = pos.lat
        selectedLng.value = pos.lng
        await reverseGeocode(pos.lat, pos.lng)
      })
    }
  }
}

// Get user's current location
const getCurrentLocation = () => {
  if (!navigator.geolocation) return
  navigator.geolocation.getCurrentPosition(
    async (pos) => {
      const lat = pos.coords.latitude
      const lng = pos.coords.longitude
      selectedLat.value = lat
      selectedLng.value = lng

      if (map) {
        map.setView([lat, lng], 16, { animate: true })
        if (marker) {
          marker.setLatLng([lat, lng])
        } else {
          marker = L.marker([lat, lng], { icon: redIcon, draggable: true }).addTo(map)
          marker.on('dragend', async () => {
            const p = marker!.getLatLng()
            selectedLat.value = p.lat
            selectedLng.value = p.lng
            await reverseGeocode(p.lat, p.lng)
          })
        }
      }
      await reverseGeocode(lat, lng)
    },
    () => {
      // If user denies location, stay on default view
    },
    { enableHighAccuracy: true }
  )
}

// Initialize map
const initMap = async () => {
  await nextTick()
  if (!mapContainer.value || map) return

  const initLat = props.initialLocation?.lat ?? 10.762622
  const initLng = props.initialLocation?.lng ?? 106.660172
  const initZoom = props.initialLocation ? 16 : 13

  map = L.map(mapContainer.value, {
    zoomControl: false
  }).setView([initLat, initLng], initZoom)

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
  }).addTo(map)

  // If there's an initial location, place a marker
  if (props.initialLocation) {
    selectedLat.value = props.initialLocation.lat
    selectedLng.value = props.initialLocation.lng
    selectedAddress.value = props.initialLocation.address ?? ''
    marker = L.marker([props.initialLocation.lat, props.initialLocation.lng], { icon: redIcon, draggable: true }).addTo(map)
    marker.on('dragend', async () => {
      const pos = marker!.getLatLng()
      selectedLat.value = pos.lat
      selectedLng.value = pos.lng
      await reverseGeocode(pos.lat, pos.lng)
    })
  }

  // Click on map to place/move marker
  map.on('click', async (e: L.LeafletMouseEvent) => {
    selectedLat.value = e.latlng.lat
    selectedLng.value = e.latlng.lng

    if (marker) {
      marker.setLatLng(e.latlng)
    } else {
      marker = L.marker(e.latlng, { icon: redIcon, draggable: true }).addTo(map!)
      marker.on('dragend', async () => {
        const pos = marker!.getLatLng()
        selectedLat.value = pos.lat
        selectedLng.value = pos.lng
        await reverseGeocode(pos.lat, pos.lng)
      })
    }
    await reverseGeocode(e.latlng.lat, e.latlng.lng)
  })
}

const close = () => {
  emit('update:modelValue', false)
}

const confirm = () => {
  if (selectedLat.value !== null && selectedLng.value !== null) {
    emit('confirm', {
      lat: selectedLat.value,
      lng: selectedLng.value,
      address: selectedAddress.value
    })
    close()
  }
}

// Watch for modal open/close to init/destroy map
watch(() => props.modelValue, async (val) => {
  if (val) {
    await nextTick()
    // Small delay for the DOM to fully render before initializing map
    setTimeout(() => initMap(), 100)
  } else {
    if (map) {
      map.remove()
      map = null
      marker = null
    }
  }
})

onUnmounted(() => {
  if (map) {
    map.remove()
    map = null
  }
})
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
          <div class="flex-1 relative min-h-[350px]">
            <div ref="mapContainer" class="absolute inset-0" />

            <!-- Get Current Location Button -->
            <button
              @click="getCurrentLocation"
              class="absolute bottom-4 right-4 z-[1000] flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-surface-800 rounded-xl shadow-lg border border-gray-200 dark:border-surface-700 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-primary-500 hover:border-primary-300 transition-all"
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
