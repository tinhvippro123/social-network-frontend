export const MAP_CONFIG = {
  NOMINATIM_BASE_URL: 'https://nominatim.openstreetmap.org',
  DEFAULT_LAT: 10.762622,
  DEFAULT_LNG: 106.660172,
  DEFAULT_ZOOM: 13,
  MAX_ZOOM: 18,
} as const

export const MAP_MARKERS = {
  RED_ICON: {
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
    iconSize: [25, 41] as [number, number],
    iconAnchor: [12, 41] as [number, number],
    popupAnchor: [1, -34] as [number, number],
    shadowSize: [41, 41] as [number, number],
  }
}
