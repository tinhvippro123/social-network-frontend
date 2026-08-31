import { ref } from 'vue'
import categoriesApi from '@/api/categories.api'

export function useCategories() {
  const categories = ref<any[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  async function fetchCategories() {
    isLoading.value = true
    error.value = null
    try {
      const { data } = await categoriesApi.getAll()
      categories.value = data.data
    } catch (err: any) {
      error.value = err.message || 'Không thể tải danh mục'
    } finally {
      isLoading.value = false
    }
  }

  return {
    categories,
    isLoading,
    error,
    fetchCategories,
  }
}
