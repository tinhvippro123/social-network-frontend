import { ref, computed, onMounted, watch } from 'vue'
import { usePosts, normalizePost } from '../posts/usePosts'
import postsApi from '@/api/posts.api'
import { useAuthStore } from '@/stores/auth.store'
import type { Post } from '@/types'

export function useBookmarks() {
  const authStore = useAuthStore()
  const { posts, fetchPosts, tags, fetchPopularTags, toggleBookmark: apiToggleBookmark } = usePosts()
  const bookmarkedPosts = ref<Post[]>([])
  const isLoading = ref(true)
  const sidebarLoading = ref(true)

  const suggestedPosts = computed(() => {
    const bookmarkedIds = new Set(bookmarkedPosts.value.map(p => p.id))
    const getReactionTotal = (p: any) => p.reactions?.reduce((acc: number, r: any) => acc + r.count, 0) || (p.upvotesCount || 0)
    return posts.value
      .filter(p => !bookmarkedIds.has(p.id))
      .sort((a, b) => getReactionTotal(b) - getReactionTotal(a))
      .slice(0, 5)
  })

  async function fetchBookmarked() {
    if (!authStore.isLoggedIn) {
      bookmarkedPosts.value = []
      isLoading.value = false
      return
    }
    isLoading.value = true
    try {
      const { data } = await postsApi.getBookmarkedPosts(1, 50)
      const list = Array.isArray(data?.data) ? data.data : []
      bookmarkedPosts.value = list.map(dto => ({
        ...normalizePost(dto),
        bookmarked: true
      }))
    } catch {
      bookmarkedPosts.value = []
    } finally {
      isLoading.value = false
    }
  }

  const toggleBookmark = async (postId: string) => {
    try {
      const res = await apiToggleBookmark(postId)
      if (res === false) {
        bookmarkedPosts.value = bookmarkedPosts.value.filter(p => p.id !== postId)
      } else {
        await fetchBookmarked()
      }
    } catch {
      // ignore
    }
  }

  const initData = async () => {
    sidebarLoading.value = true
    await Promise.all([
      fetchBookmarked(),
      fetchPosts({ limit: 50 }),
      fetchPopularTags()
    ])
    sidebarLoading.value = false
  }

  onMounted(() => {
    initData()
  })

  watch(() => authStore.user?.id, (newUserId) => {
    if (!newUserId) {
      bookmarkedPosts.value = []
      return
    }
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
