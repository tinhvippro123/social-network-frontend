import { ref, computed, onMounted } from 'vue'
import { usePosts } from '../posts/usePosts'

export function useBookmarks() {
  const { posts, isLoading, fetchPosts, tags, fetchPopularTags, toggleBookmark: apiToggleBookmark } = usePosts()
  const sidebarLoading = ref(true)

  const bookmarkedPosts = computed(() =>
    posts.value.filter(p => p.bookmarked)
  )

  const suggestedPosts = computed(() => {
    const getReactionTotal = (p: any) => p.reactions?.reduce((acc: number, r: any) => acc + r.count, 0) || 0
    return posts.value
      .filter(p => !p.bookmarked)
      .sort((a, b) => getReactionTotal(b) - getReactionTotal(a))
      .slice(0, 5)
  })

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
    sidebarLoading.value = true
    await Promise.all([
      fetchPosts(),
      fetchPopularTags()
    ])
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
