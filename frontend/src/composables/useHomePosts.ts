import { ref, computed, onMounted } from 'vue'
import { usePosts } from './usePosts'
import { useCategories } from './useCategories'

export function useHomePosts() {
  const { posts, isLoading, fetchPosts, toggleBookmark: apiToggleBookmark } = usePosts()
  const { categories, fetchCategories } = useCategories()

  const selectedCategory = ref('all')
  const visibleCount = ref(4)
  const loadingMore = ref(false)

  const filteredPosts = computed(() => {
    const all = selectedCategory.value === 'all'
      ? posts.value
      : posts.value.filter(p => p.category.slug === selectedCategory.value)
    return all.slice(0, visibleCount.value)
  })

  const totalFiltered = computed(() => {
    if (selectedCategory.value === 'all') return posts.value.length
    return posts.value.filter(p => p.category.slug === selectedCategory.value).length
  })

  const hasMore = computed(() => visibleCount.value < totalFiltered.value)

  const loadMore = async () => {
    loadingMore.value = true
    await new Promise(r => setTimeout(r, 800))
    visibleCount.value += 4
    loadingMore.value = false
  }

  const toggleBookmark = (postId: string) => {
    const post = posts.value.find(p => p.id === postId)
    if (post) {
      post.bookmarked = !post.bookmarked
      apiToggleBookmark(postId, !post.bookmarked)
    }
  }

  const initData = async () => {
    await Promise.all([fetchPosts(), fetchCategories()])
  }

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
