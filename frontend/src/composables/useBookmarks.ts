import { ref, computed, onMounted } from 'vue'
import { usePosts } from './usePosts'

export function useBookmarks() {
  const { posts, isLoading, fetchPosts, tags, fetchPopularTags, toggleBookmark: apiToggleBookmark } = usePosts()
  const sidebarLoading = ref(true)

  const bookmarkedPosts = computed(() =>
    posts.value.filter(p => p.bookmarked)
  )

  const suggestedPosts = computed(() =>
    posts.value
      .filter(p => !p.bookmarked)
      .sort((a, b) => b.upvotesCount - a.upvotesCount)
      .slice(0, 5)
  )

  const toggleBookmark = (postId: string) => {
    const post = posts.value.find(p => p.id === postId)
    if (post) {
      post.bookmarked = !post.bookmarked
      apiToggleBookmark(postId, !post.bookmarked)
    }
  }

  const initData = async () => {
    await fetchPosts()
    sidebarLoading.value = true
    await fetchPopularTags()
    sidebarLoading.value = false
  }

  onMounted(() => {
    initData()
  })

  return {
    tags,
    isLoading,
    sidebarLoading,
    bookmarkedPosts,
    suggestedPosts,
    toggleBookmark,
    initData
  }
}
