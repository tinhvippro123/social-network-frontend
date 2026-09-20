import { ref } from 'vue'
import categoriesApi from '@/api/categories.api'

import { useAsyncState } from './useAsyncState'

export function useCategories() {
  const categories = ref<any[]>([])
  const { isLoading, error, execute } = useAsyncState()

  async function fetchCategories() {
    await execute(async () => {
      const { data } = await categoriesApi.getAll()
      categories.value = data.data
    }, 'Không thể tải danh mục')
  }

  return {
    categories,
    isLoading,
    error,
    fetchCategories,
  }
}
