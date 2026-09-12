import { ref, computed, watch, onMounted, onUnmounted, type Ref } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { usePosts } from './usePosts'
import type { Post } from '@/types'

// Fix leaflet default icon issue in Vue/Vite
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png'
import iconUrl from 'leaflet/dist/images/marker-icon.png'
import shadowUrl from 'leaflet/dist/images/marker-shadow.png'

L.Icon.Default.mergeOptions({ iconRetinaUrl, iconUrl, shadowUrl })

export function useMapView(mapContainer: Ref<HTMLElement | null>) {
  const searchRadius = ref(5)
  const searchLocation = ref('')
  const selectedPost = ref<Post | null>(null)
  
  let map: L.Map | null = null
  let markersLayer: L.LayerGroup | null = null

  const { posts, fetchPosts } = usePosts()

  const categoryFilters = [
    { slug: 'all', label: 'Tất cả', icon: '📍' },
    { slug: 'tim-tro', label: 'Tìm trọ', icon: '🏠' },
    { slug: 'pass-do', label: 'Pass đồ', icon: '🛒' },
    { slug: 'review-dia-diem', label: 'Review', icon: '📍' },
    { slug: 'su-kien', label: 'Sự kiện', icon: '🎉' },
  ]
  const selectedFilter = ref('all')

  const postsWithLocation = computed(() => {
    let filtered = posts.value.filter(p => p.location)
    
    if (selectedFilter.value !== 'all') {
      filtered = filtered.filter(p => p.category.slug === selectedFilter.value)
    }
    
    if (searchLocation.value.trim()) {
      const q = searchLocation.value.toLowerCase()
      filtered = filtered.filter(p =>
        p.title.toLowerCase().includes(q) ||
        p.location?.address?.toLowerCase().includes(q)
      )
    }
    
    return filtered
  })

  const getCategoryEmoji = (slug: string) => {
    const mapDict: Record<string, string> = {
      'tim-tro': '🏠',
      'pass-do': '🛒',
      'review-dia-diem': '📍',
      'su-kien': '🎉',
      'review': '⭐',
    }
    return mapDict[slug] || '📌'
  }

  const createEmojiIcon = (emoji: string) => {
    return L.divIcon({
      html: `<div style="font-size: 24px; line-height: 1; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3)); cursor: pointer;">${emoji}</div>`,
      iconSize: [30, 30],
      iconAnchor: [15, 15],
      className: 'emoji-marker'
    })
  }

  const formatEventTime = (start?: string, end?: string) => {
    if (!start) return ''
    const s = new Date(start)
    const e = end ? new Date(end) : null
    const dateStr = s.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
    const startTime = s.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
    const endTime = e ? e.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : ''
    return `${dateStr} · ${startTime}${endTime ? ' - ' + endTime : ''}`
  }

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

  watch([selectedFilter, searchLocation], () => {
    renderMarkers()
  })

  const selectPostFromList = (post: Post) => {
    selectedPost.value = post
    if (post.location && map) {
      map.setView([post.location.lat, post.location.lng], 15, { animate: true })
    }
  }

  const initMap = async () => {
    if (!mapContainer.value) return
    await fetchPosts()

    map = L.map(mapContainer.value, {
      zoomControl: false
    }).setView([10.775, 106.690], 13)

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 18
    }).addTo(map)

    renderMarkers()
  }

  const destroyMap = () => {
    if (map) {
      map.remove()
      map = null
      markersLayer = null
    }
  }

  const zoomIn = () => map?.zoomIn()
  const zoomOut = () => map?.zoomOut()
  const locateUser = () => {
    map?.locate({ setView: true, maxZoom: 16 })
  }

  onMounted(() => {
    initMap()
  })

  onUnmounted(() => {
    destroyMap()
  })

  const goToCurrentLocation = () => {
    locateUser()
  }

  return {
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
  }
}
