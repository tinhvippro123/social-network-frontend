import { ref } from 'vue'
import categoriesApi from '@/api/categories.api'

import { useAsyncState } from './useAsyncState'

const CATEGORIES_CACHE_TTL_MS = 30_000
const categories = ref<any[]>([])
const { isLoading, error, execute } = useAsyncState()
let lastFetchedAt = 0
let inFlightPromise: Promise<void> | null = null

export function useCategories() {
  async function fetchCategories(force = false) {
    const now = Date.now()
    if (!force && categories.value.length > 0 && now - lastFetchedAt < CATEGORIES_CACHE_TTL_MS) {
      return
    }
    if (inFlightPromise && !force) {
      return inFlightPromise
    }
    if (inFlightPromise && force) {
      await inFlightPromise
    }

    const request = (async () => {
      await execute(async () => {
        const { data } = await categoriesApi.getAll()
        categories.value = data.data
        lastFetchedAt = Date.now()
      }, 'Không thể tải danh mục')
    })()

    inFlightPromise = request
    try {
      await request
    } finally {
      if (inFlightPromise === request) {
        inFlightPromise = null
      }
    }
  }

  return {
    categories,
    isLoading,
    error,
    fetchCategories,
  }
}
