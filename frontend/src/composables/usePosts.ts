// ==========================================
// Composable — usePosts
// Fetch, filter, paginate bài viết
// ==========================================
import { ref, reactive } from 'vue'
import postsApi from '@/api/posts.api'
import type { PostsQuery } from '@/api/posts.api'
import type { Post } from '@/types'
import { mockComments } from '@/data/mockData'

export function usePosts() {
  const posts = ref<Post[]>([])
  const currentPost = ref<Post | null>(null)
  const comments = ref<any[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const pagination = reactive({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  })

  /** Lấy danh sách bài viết (có filter + pagination) */
  async function fetchPosts(params?: PostsQuery) {
    isLoading.value = true
    error.value = null
    try {
      const { data } = await postsApi.getAll({
        page: pagination.page,
        limit: pagination.limit,
        ...params,
      })
      posts.value = data.data
      if (data.meta) {
        pagination.page = data.meta.page
        pagination.total = data.meta.total
        pagination.totalPages = data.meta.totalPages
      }
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Không thể tải bài viết'
    } finally {
      isLoading.value = false
    }
  }

  /** Lấy chi tiết 1 bài viết */
  async function fetchPost(id: string) {
    isLoading.value = true
    error.value = null
    try {
      const { data } = await postsApi.getById(id)
      currentPost.value = data.data
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Không tìm thấy bài viết'
    } finally {
      isLoading.value = false
    }
  }

  /** Lấy bài viết trending */
  async function fetchTrending(limit = 10) {
    try {
      const { data } = await postsApi.getTrending(limit)
      return data.data
    } catch {
      return []
    }
  }

  /** Lấy bình luận */
  async function fetchComments(postId: string) {
    // Fake delay
    await new Promise(resolve => setTimeout(resolve, 500))
    comments.value = mockComments
  }

  /** Vote */
  async function upvote(postId: string) {
    await postsApi.upvote(postId)
  }

  async function downvote(postId: string) {
    await postsApi.downvote(postId)
  }

  /** Bookmark */
  async function toggleBookmark(postId: string, isBookmarked: boolean) {
    if (isBookmarked) {
      await postsApi.removeBookmark(postId)
    } else {
      await postsApi.bookmark(postId)
    }
  }

  /** Chuyển trang */
  function goToPage(page: number) {
    pagination.page = page
    fetchPosts()
  }

  return {
    posts,
    currentPost,
    comments,
    isLoading,
    error,
    pagination,
    fetchPosts,
    fetchPost,
    fetchTrending,
    fetchComments,
    upvote,
    downvote,
    toggleBookmark,
    goToPage,
  }
}
