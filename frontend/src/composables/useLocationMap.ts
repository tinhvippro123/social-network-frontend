import { ref, type Ref, nextTick } from 'vue'
import L from 'leaflet'
import { MAP_CONFIG, MAP_MARKERS } from '@/constants/map'
import { mapApi } from '@/api/map.api'

// Fix leaflet default icon issue
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png'
import iconUrl from 'leaflet/dist/images/marker-icon.png'
import shadowUrl from 'leaflet/dist/images/marker-shadow.png'

L.Icon.Default.mergeOptions({ iconRetinaUrl, iconUrl, shadowUrl })

export function useLocationMap(mapContainer: Ref<HTMLElement | null>) {
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

  const redIcon = L.icon(MAP_MARKERS.RED_ICON)

  const reverseGeocode = async (lat: number, lng: number) => {
    isReverseGeocoding.value = true
    try {
      const data = await mapApi.reverseGeocode(lat, lng)
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
        searchResults.value = await mapApi.searchAddress(searchQuery.value)
      } catch {
        searchResults.value = []
      } finally {
        isSearching.value = false
      }
    }, 400)
  }

  const setMapMarker = (lat: number, lng: number) => {
    if (!map) return
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

  const selectSearchResult = (result: any) => {
    const lat = parseFloat(result.lat)
    const lng = parseFloat(result.lon)
    selectedLat.value = lat
    selectedLng.value = lng
    selectedAddress.value = result.display_name
    searchQuery.value = ''
    searchResults.value = []
    showSearchResults.value = false
    setMapMarker(lat, lng)
  }

  const getCurrentLocation = () => {
    if (!navigator.geolocation) return
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude
        const lng = pos.coords.longitude
        selectedLat.value = lat
        selectedLng.value = lng
        setMapMarker(lat, lng)
        await reverseGeocode(lat, lng)
      },
      () => {
        // If user denies location, stay on default view
      },
      { enableHighAccuracy: true }
    )
  }

  const initMap = async (initialLat?: number, initialLng?: number) => {
    await nextTick()
    if (!mapContainer.value || map) return

    map = L.map(mapContainer.value, {
      zoomControl: false,
      attributionControl: false
    })

    L.tileLayer(MAP_CONFIG.TILE_LAYER_URL, {
      maxZoom: MAP_CONFIG.MAX_ZOOM,
    }).addTo(map)

    L.control.zoom({ position: 'bottomright' }).addTo(map)

    if (initialLat && initialLng) {
      selectedLat.value = initialLat
      selectedLng.value = initialLng
      setMapMarker(initialLat, initialLng)
      await reverseGeocode(initialLat, initialLng)
    } else {
      map.setView(MAP_CONFIG.DEFAULT_CENTER as [number, number], MAP_CONFIG.DEFAULT_ZOOM)
      getCurrentLocation()
    }

    map.on('click', async (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng
      selectedLat.value = lat
      selectedLng.value = lng
      setMapMarker(lat, lng)
      await reverseGeocode(lat, lng)
    })
  }

  const destroyMap = () => {
    if (map) {
      map.remove()
      map = null
      marker = null
    }
  }

  return {
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
    initMap,
    destroyMap
  }
}
