import { ref, watch, onUnmounted, type Ref } from 'vue'
import { useLocationMap } from './useLocationMap'

interface LocationData {
  lat: number
  lng: number
  address?: string
}

interface LocationPickerProps {
  modelValue: boolean
  initialLocation?: LocationData | null
}

export function useLocationPickerModal(
  props: LocationPickerProps,
  emit: any
) {
  const mapContainer = ref<HTMLElement | null>(null)
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
    initMap,
    destroyMap
  } = useLocationMap(mapContainer)

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

  watch(() => props.modelValue, async (val) => {
    if (val) {
      if (props.initialLocation) {
        await initMap(props.initialLocation.lat, props.initialLocation.lng)
      } else {
        await initMap()
      }
    } else {
      destroyMap()
    }
  })

  onUnmounted(() => {
    destroyMap()
  })

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
    close,
    confirm,
    mapContainer
  }
}
