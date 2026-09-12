import { ref, computed, onMounted } from 'vue'
import { usePosts } from './usePosts'
import { useUsers } from './useUsers'

export function useTrendingPosts() {
  const { posts, isLoading, fetchPosts, tags, fetchPopularTags, toggleBookmark: apiToggleBookmark } = usePosts()
  const { users, fetchUsers } = useUsers()
  
  const selectedCategory = ref('all')
  const visibleCount = ref(4)
  const loadingMore = ref(false)
  const sidebarLoading = ref(true)

  const allTrendingPosts = computed(() => {
    let sorted = [...posts.value].sort((a, b) => {
      const scoreA = a.upvotesCount * 3 + a.viewsCount + a.commentsCount * 2
      const scoreB = b.upvotesCount * 3 + b.viewsCount + b.commentsCount * 2
      return scoreB - scoreA
    })
    if (selectedCategory.value !== 'all') {
      sorted = sorted.filter(p => p.category.slug === selectedCategory.value)
    }
    return sorted
  })

  const trendingPosts = computed(() => allTrendingPosts.value.slice(0, visibleCount.value))
  const hasMore = computed(() => visibleCount.value < allTrendingPosts.value.length)

  const totalViews = computed(() =>
    posts.value.reduce((sum, p) => sum + p.viewsCount, 0)
  )
  const totalUpvotes = computed(() =>
    posts.value.reduce((sum, p) => sum + p.upvotesCount, 0)
  )

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
    fetchPosts({ sort: 'trending' })
    sidebarLoading.value = true
    await Promise.all([fetchUsers(), fetchPopularTags()])
    sidebarLoading.value = false
  }

  onMounted(() => {
    initData()
  })

  return {
    tags,
    users,
    isLoading,
    sidebarLoading,
    selectedCategory,
    loadingMore,
    trendingPosts,
    hasMore,
    totalViews,
    totalUpvotes,
    loadMore,
    toggleBookmark,
    initData
  }
}
