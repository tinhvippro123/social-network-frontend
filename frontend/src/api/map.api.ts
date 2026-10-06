import { MAP_CONFIG } from '@/constants/map'

export const mapApi = {
  /**
   * Reverse geocoding: convert lat, lng to address string
   */
  async reverseGeocode(lat: number, lng: number) {
    const res = await fetch(
      `${MAP_CONFIG.NOMINATIM_BASE_URL}/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
      { headers: { 'Accept-Language': 'vi' } }
    )
    if (!res.ok) throw new Error('Failed to fetch address')
    return res.json()
  },

  /**
   * Search for locations by text query
   */
  async searchAddress(query: string) {
    const res = await fetch(
      `${MAP_CONFIG.NOMINATIM_BASE_URL}/search?format=json&q=${encodeURIComponent(query)}&limit=5`,
      { headers: { 'Accept-Language': 'vi' } }
    )
    if (!res.ok) throw new Error('Failed to search locations')
    return res.json()
  }
}
