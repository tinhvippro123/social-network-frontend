import { ref, computed, watch, onMounted, onUnmounted, type Ref } from 'vue'
import { useRoute } from 'vue-router'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { usePosts, normalizePost } from '../posts/usePosts'
import postsApi from '@/api/posts.api'
import { useToast } from '@/composables/ui/useToast'
import type { Post } from '@/types'

// Fix leaflet default icon issue in Vue/Vite
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png'
import iconUrl from 'leaflet/dist/images/marker-icon.png'
import shadowUrl from 'leaflet/dist/images/marker-shadow.png'

L.Icon.Default.mergeOptions({ iconRetinaUrl, iconUrl, shadowUrl })

export interface SearchCenter {
  lat: number
  lng: number
  label: string
}

/** Tọa độ mặc định: Trường ĐH Tài nguyên và Môi trường TP.HCM (236B Lê Văn Sỹ). */
export const HCMUNRE_CENTER: SearchCenter = {
  lat: 10.7965,
  lng: 106.6668,
  label: 'Trường ĐH Tài nguyên và Môi trường TP.HCM'
}

const CATEGORY_META: Record<string, { label: string; icon: string }> = {
  'cong-nghe': { label: 'Công nghệ', icon: '💻' },
  'doi-song': { label: 'Đời sống', icon: '🌿' },
  'du-lich': { label: 'Du lịch', icon: '✈️' },
  'am-thuc': { label: 'Ẩm thực', icon: '🍜' },
  'su-kien': { label: 'Sự kiện', icon: '🎉' }
}

/**
 * Haversine — chỉ dùng để HIỂN THỊ khoảng cách bên cạnh mỗi bài viết.
 * Việc lọc bài viết trong bán kính được thực hiện ở Backend (GeoAlgorithms.distanceKm).
 */
export function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371.0088
  const toRad = (d: number) => (d * Math.PI) / 180
  const dLat = toRad(lat2 - lat1)
  const dLng = toRad(lng2 - lng1)
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(a)))
}

export function formatDistance(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)} m`
  return `${km < 10 ? km.toFixed(1) : Math.round(km)} km`
}

export function useMapView(mapContainer: Ref<HTMLElement | null>) {
  const route = useRoute()
  const toast = useToast()
  const searchRadius = ref(5)
  const searchLocation = ref('')
  const selectedPost = ref<Post | null>(null)
  const selectedFilter = ref('all')

  // null = chế độ "Tất cả bài viết có vị trí"; có giá trị = chế độ "Tìm quanh một điểm"
  const searchCenter = ref<SearchCenter | null>(null)
  const nearbyPosts = ref<Post[]>([])
  const isNearbyLoading = ref(false)
  const isLocating = ref(false)

  let map: L.Map | null = null
  let markersLayer: L.LayerGroup | null = null
  let radiusLayer: L.LayerGroup | null = null
  let radiusTimer: ReturnType<typeof setTimeout> | null = null

  const { posts, fetchPosts } = usePosts()

  const categoryFilters = [
    { slug: 'all', label: 'Tất cả', icon: '📍' },
    ...Object.entries(CATEGORY_META).map(([slug, meta]) => ({ slug, ...meta }))
  ]

  const sourcePosts = computed(() => (searchCenter.value ? nearbyPosts.value : posts.value))

  const postsWithLocation = computed(() => {
    let filtered = sourcePosts.value.filter(p => p.location)

    if (selectedFilter.value !== 'all') {
      filtered = filtered.filter(p => p.category?.slug === selectedFilter.value)
    }

    if (searchLocation.value.trim()) {
      const q = searchLocation.value.trim().toLowerCase()
      filtered = filtered.filter(p =>
        p.title.toLowerCase().includes(q) ||
        p.location?.address?.toLowerCase().includes(q)
      )
    }

    return filtered
  })

  const distanceTo = (post: Post): number | null => {
    if (!searchCenter.value || !post.location) return null
    return haversineKm(searchCenter.value.lat, searchCenter.value.lng, post.location.lat, post.location.lng)
  }

  const regionLabel = computed(() =>
    searchCenter.value
      ? `Trong bán kính ${searchRadius.value} km quanh ${searchCenter.value.label}`
      : 'Toàn quốc'
  )

  const getCategoryEmoji = (slug: string, customIcon?: string) => {
    if (customIcon && /[^\u0000-\u007F]/.test(customIcon)) return customIcon
    return CATEGORY_META[slug]?.icon || '📌'
  }

  const createEmojiIcon = (_emoji: string, active = false) => {
    const size = active ? 36 : 30
    const color = active ? '#0f766e' : '#0d9488'
    return L.divIcon({
      html: `<div style="width:${size}px;height:${size}px;display:flex;align-items:center;justify-content:center;filter:drop-shadow(0 3px 6px rgba(13,148,136,0.35));cursor:pointer;transition:transform 0.15s ease;">
        <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="${color}" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
          <circle cx="12" cy="10" r="3" fill="#ffffff"/>
        </svg>
      </div>`,
      iconSize: [size, size],
      iconAnchor: [size / 2, size],
      popupAnchor: [0, -size + 4],
      className: 'emoji-marker'
    })
  }

  const centerIcon = L.divIcon({
    html: '<div style="width:18px;height:18px;border-radius:9999px;background:#14b8a6;border:3px solid #fff;box-shadow:0 0 0 6px rgba(20,184,166,0.25);"></div>',
    iconSize: [18, 18],
    iconAnchor: [9, 9],
    className: 'emoji-marker'
  })

  const formatEventTime = (start?: string, end?: string) => {
    if (!start) return ''
    const s = new Date(start)
    const e = end ? new Date(end) : null
    const dateStr = s.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
    const startTime = s.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
    const endTime = e ? e.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : ''
    return `${dateStr} · ${startTime}${endTime ? ' - ' + endTime : ''}`
  }

  const escapeHtml = (value: string) =>
    value.replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch] as string))

  /**
   * Nhiều bài viết có thể trùng một tọa độ (ví dụ cùng tại HCMUNRE).
   * Xếp chúng thành một vòng nhỏ quanh điểm gốc để ghim nào cũng bấm được.
   */
  const displayPositions = computed(() => {
    const groups = new Map<string, Post[]>()
    postsWithLocation.value.forEach(post => {
      const key = `${post.location!.lat.toFixed(4)},${post.location!.lng.toFixed(4)}`
      if (!groups.has(key)) groups.set(key, [])
      groups.get(key)!.push(post)
    })
    const positions = new Map<string, [number, number]>()
    groups.forEach(group => {
      group.forEach((post, index) => {
        const { lat, lng } = post.location!
        if (group.length === 1) {
          positions.set(post.id, [lat, lng])
          return
        }
        const angle = (2 * Math.PI * index) / group.length
        const offset = 0.0007
        positions.set(post.id, [lat + offset * Math.sin(angle), lng + offset * Math.cos(angle)])
      })
    })
    return positions
  })

  const renderRadius = () => {
    if (!map) return
    if (!radiusLayer) radiusLayer = L.layerGroup().addTo(map)
    radiusLayer.clearLayers()
    if (!searchCenter.value) return
    const { lat, lng, label } = searchCenter.value
    L.circle([lat, lng], {
      radius: searchRadius.value * 1000,
      color: '#14b8a6',
      weight: 2,
      fillColor: '#14b8a6',
      fillOpacity: 0.08,
      dashArray: '6 6'
    }).addTo(radiusLayer)
    L.marker([lat, lng], { icon: centerIcon, zIndexOffset: 1000 })
      .bindTooltip(`Tâm tìm kiếm: ${escapeHtml(label)}`, { direction: 'top', offset: [0, -10] })
      .addTo(radiusLayer)
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
      const emoji = getCategoryEmoji(post.category?.slug || '')
      const position = displayPositions.value.get(post.id) || [post.location.lat, post.location.lng]
      const marker = L.marker(position, {
        icon: createEmojiIcon(emoji, selectedPost.value?.id === post.id)
      }).addTo(markersLayer!)

      const distance = distanceTo(post)
      const popupContent = `
        <div style="min-width: 200px; font-family: system-ui, sans-serif;">
          <div style="font-weight: 700; font-size: 13px; margin-bottom: 4px; line-height: 1.3;">${escapeHtml(post.title)}</div>
          <div style="font-size: 11px; color: #888; display: flex; align-items: center; gap: 4px;">
            ${escapeHtml(post.category?.name || 'Chưa phân loại')}
            ${distance !== null ? ` · <span style="color:#0d9488;font-weight:600;">cách ${formatDistance(distance)}</span>` : ''}
          </div>
          ${post.eventStartTime ? `<div style="font-size: 11px; color: #d97706; margin-top: 4px;">${formatEventTime(post.eventStartTime, post.eventEndTime)}</div>` : ''}
        </div>
      `
      marker.bindPopup(popupContent, { className: 'custom-popup' })

      if (selectedPost.value?.id === post.id) {
        setTimeout(() => marker.openPopup(), 0)
      }

      marker.on('click', () => {
        selectedPost.value = post
        map?.setView(position, Math.max(map.getZoom(), 15), { animate: true })
      })
    })
  }

  /** Gọi API Haversine của Backend: GET /api/posts/nearby?lat&lng&radius */
  const searchNearby = async (center: SearchCenter, fit = true) => {
    searchCenter.value = center
    selectedPost.value = null
    isNearbyLoading.value = true
    try {
      const { data } = await postsApi.getNearby(center.lat, center.lng, searchRadius.value, 100)
      nearbyPosts.value = Array.isArray(data.data) ? data.data.map(normalizePost) : []
    } catch {
      nearbyPosts.value = []
      toast.error('Không thể tìm bài viết quanh vị trí này')
    } finally {
      isNearbyLoading.value = false
    }
    renderRadius()
    renderMarkers()
    if (fit && map) {
      const bounds = L.latLng(center.lat, center.lng).toBounds(searchRadius.value * 2000)
      map.fitBounds(bounds, { padding: [24, 24], animate: true })
    }
  }

  const goToCurrentLocation = () => {
    if (!('geolocation' in navigator)) {
      toast.info('Trình duyệt không hỗ trợ định vị. Đang tìm quanh HCMUNRE.')
      searchNearby(HCMUNRE_CENTER)
      return
    }
    isLocating.value = true
    navigator.geolocation.getCurrentPosition(
      pos => {
        isLocating.value = false
        searchNearby({ lat: pos.coords.latitude, lng: pos.coords.longitude, label: 'vị trí của bạn' })
      },
      () => {
        isLocating.value = false
        toast.info('Chưa được cấp quyền vị trí. Đang tìm quanh HCMUNRE.')
        searchNearby(HCMUNRE_CENTER)
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 60_000 }
    )
  }

  const searchAroundCampus = () => searchNearby(HCMUNRE_CENTER)

  const clearNearby = () => {
    if (radiusTimer) {
      clearTimeout(radiusTimer)
      radiusTimer = null
    }
    searchCenter.value = null
    nearbyPosts.value = []
    selectedPost.value = null
    renderRadius()
    renderMarkers()
    map?.setView([10.775, 106.69], 12, { animate: true })
  }

  watch([selectedFilter, searchLocation], () => renderMarkers())
  watch(selectedPost, () => renderMarkers())

  // Kéo thanh bán kính → gọi lại API (debounce để không spam request khi đang kéo)
  watch(searchRadius, () => {
    if (!searchCenter.value) {
      if (map) {
        const c = map.getCenter()
        searchCenter.value = { lat: c.lat, lng: c.lng, label: 'tâm bản đồ hiện tại' }
      } else {
        searchCenter.value = HCMUNRE_CENTER
      }
    }
    renderRadius()
    if (radiusTimer) clearTimeout(radiusTimer)
    radiusTimer = setTimeout(() => {
      if (searchCenter.value) searchNearby(searchCenter.value)
    }, 400)
  })

  const selectPostFromList = (post: Post) => {
    selectedPost.value = post
    if (post.location && map) {
      const position = displayPositions.value.get(post.id) || [post.location.lat, post.location.lng]
      map.setView(position, 15, { animate: true })
    }
  }

  const focusPostById = async (postId: string) => {
    let targetPost = postsWithLocation.value.find(p => p.id === postId)
    if (!targetPost) {
      try {
        const res = await postsApi.getById(postId)
        const raw = res.data?.data
        if (raw) {
          const normalized = normalizePost(raw)
          if (normalized.location) {
            if (!posts.value.some(p => p.id === normalized.id)) {
              posts.value.unshift(normalized)
            }
            if (selectedFilter.value !== 'all' && normalized.category?.slug !== selectedFilter.value) {
              selectedFilter.value = 'all'
            }
            if (searchCenter.value && !nearbyPosts.value.some(p => p.id === normalized.id)) {
              searchCenter.value = null
              nearbyPosts.value = []
              renderRadius()
            }
            renderMarkers()
            targetPost = normalized
          }
        }
      } catch {
        // ignore if post not found
      }
    }
    if (targetPost) {
      selectPostFromList(targetPost)
    }
  }

  const initMap = async () => {
    if (!mapContainer.value) return

    map = L.map(mapContainer.value, {
      zoomControl: false
    }).setView([10.775, 106.69], 12)

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 18
    }).addTo(map)

    // Bấm vào một điểm bất kỳ trên bản đồ để chọn làm tâm tìm kiếm
    map.on('click', (e: L.LeafletMouseEvent) => {
      searchNearby({ lat: e.latlng.lat, lng: e.latlng.lng, label: 'điểm đã chọn' }, false)
    })

    await fetchPosts({ limit: 100 })
    if (!map) return

    renderMarkers()

    const queryPostId = route.query.postId as string | undefined
    if (queryPostId) {
      await focusPostById(queryPostId)
    }
  }

  watch(() => route.query.postId, (newId) => {
    if (!newId) return
    focusPostById(newId as string)
  })

  const destroyMap = () => {
    if (radiusTimer) clearTimeout(radiusTimer)
    if (map) {
      map.remove()
      map = null
      markersLayer = null
      radiusLayer = null
    }
  }

  const zoomIn = () => map?.zoomIn()
  const zoomOut = () => map?.zoomOut()

  onMounted(() => {
    initMap()
  })

  onUnmounted(() => {
    destroyMap()
  })

  return {
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
    initMap,
    destroyMap,
    zoomIn,
    zoomOut,
    getCategoryEmoji,
    formatEventTime,
    goToCurrentLocation,
    searchAroundCampus,
    clearNearby
  }
}
