// ==========================================
// Composable — useSearch
// Tìm kiếm bài viết (keyword, semantic, image)
// ==========================================
import { ref } from 'vue'
import postsApi from '@/api/posts.api'
import type { Post } from '@/types'

export function useSearch() {
  const results = ref<Post[]>([])
  const isSearching = ref(false)
  const searchQuery = ref('')
  const searchType = ref<'keyword' | 'semantic' | 'image'>('keyword')
  const error = ref<string | null>(null)

  /** Tìm kiếm theo từ khóa */
  async function searchByKeyword(query: string) {
    if (!query.trim()) {
      results.value = []
      return
    }
    isSearching.value = true
    error.value = null
    searchQuery.value = query
    searchType.value = 'keyword'
    try {
      const { data } = await postsApi.getAll({ search: query })
      results.value = data.data
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Lỗi tìm kiếm'
    } finally {
      isSearching.value = false
    }
  }

  /** Tìm kiếm ngữ nghĩa (Semantic Search — pgvector + Cosine Similarity) */
  async function searchSemantic(query: string) {
    if (!query.trim()) {
      results.value = []
      return
    }
    isSearching.value = true
    error.value = null
    searchQuery.value = query
    searchType.value = 'semantic'
    try {
      const { data } = await postsApi.searchSemantic(query)
      results.value = data.data
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Lỗi tìm kiếm ngữ nghĩa'
    } finally {
      isSearching.value = false
    }
  }

  /** Tìm kiếm theo hình ảnh (Image → Vector → Search) */
  async function searchByImage(file: File) {
    isSearching.value = true
    error.value = null
    searchType.value = 'image'
    try {
      const formData = new FormData()
      formData.append('image', file)
      const { data } = await postsApi.searchByImage(formData)
      results.value = data.data
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Lỗi tìm kiếm hình ảnh'
    } finally {
      isSearching.value = false
    }
  }

  /** Xóa kết quả */
  function clearSearch() {
    results.value = []
    searchQuery.value = ''
    error.value = null
  }

  return {
    results,
    isSearching,
    searchQuery,
    searchType,
    error,
    searchByKeyword,
    searchSemantic,
    searchByImage,
    clearSearch,
  }
}
