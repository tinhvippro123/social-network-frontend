import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { usePosts } from './usePosts'
import { useCategories } from '../core/useCategories'
import { useAuthStore } from '@/stores/auth.store'

export function useHomePosts() {
  const route = useRoute()
  const router = useRouter()
  const authStore = useAuthStore()
  const { posts, isLoading, fetchPosts, toggleBookmark: apiToggleBookmark } = usePosts()
  const { categories, fetchCategories } = useCategories()

  const selectedCategory = ref((route.query.category as string) || 'all')
  const visibleCount = ref(4)
  const loadingMore = ref(false)

  watch(() => route.query.category, (newCat) => {
    const normalized = (newCat as string) || 'all'
    if (selectedCategory.value !== normalized) {
      selectedCategory.value = normalized
    }
  })

  watch(selectedCategory, (newCat) => {
    visibleCount.value = 4
    const currentQueryCat = (route.query.category as string) || 'all'
    if (newCat !== currentQueryCat) {
      const nextQuery = { ...route.query }
      if (newCat === 'all') {
        delete nextQuery.category
      } else {
        nextQuery.category = newCat
      }
      router.replace({ query: nextQuery })
    }
  })

  const filteredPosts = computed(() => {
    const all = selectedCategory.value === 'all'
      ? posts.value
      : posts.value.filter(p => p.category?.slug === selectedCategory.value || p.category?.name === selectedCategory.value)
    return all.slice(0, visibleCount.value)
  })

  const totalFiltered = computed(() => {
    if (selectedCategory.value === 'all') return posts.value.length
    return posts.value.filter(p => p.category?.slug === selectedCategory.value || p.category?.name === selectedCategory.value).length
  })

  const hasMore = computed(() => visibleCount.value < totalFiltered.value)

  const loadMore = async () => {
    loadingMore.value = true
    visibleCount.value += 4
    loadingMore.value = false
  }

  const toggleBookmark = async (postId: string) => {
    const post = posts.value.find(p => p.id === postId)
    if (post) {
      const prev = post.bookmarked
      post.bookmarked = !post.bookmarked
      try {
        const res = await apiToggleBookmark(postId)
        if (typeof res === 'boolean') {
          post.bookmarked = res
        }
      } catch {
        post.bookmarked = prev
      }
    }
  }

  const initData = async () => {
    await Promise.all([fetchPosts({ limit: 50 }), fetchCategories()])
  }

  watch(() => authStore.user?.id, () => {
    fetchPosts({ limit: 50 })
  })

  onMounted(() => {
    initData()
  })

  return {
    posts,
    categories,
    isLoading,
    selectedCategory,
    visibleCount,
    loadingMore,
    filteredPosts,
    hasMore,
    totalFiltered,
    loadMore,
    toggleBookmark,
    initData
  }
}
