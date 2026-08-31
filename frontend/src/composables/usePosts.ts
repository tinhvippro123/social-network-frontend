// ==========================================
// Composable — usePosts
// Fetch, filter, paginate bài viết
// ==========================================
import { ref, reactive } from 'vue'
import postsApi from '@/api/posts.api'
import type { PostsQuery } from '@/api/posts.api'
import type { Post } from '@/types'
import { useAsyncState } from './useAsyncState'

export function usePosts() {
  const posts = ref<Post[]>([])
  const currentPost = ref<Post | null>(null)
  const comments = ref<any[]>([])
  const tags = ref<any[]>([])
  const { isLoading, error, execute } = useAsyncState()
  const pagination = reactive({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  })

  /** Lấy danh sách bài viết (có filter + pagination) */
  async function fetchPosts(params?: PostsQuery) {
    await execute(async () => {
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
    }, 'Không thể tải bài viết')
  }

  /** Lấy chi tiết 1 bài viết */
  async function fetchPost(id: string) {
    await execute(async () => {
      const { data } = await postsApi.getById(id)
      currentPost.value = data.data
    }, 'Không tìm thấy bài viết')
  }

  /** Lấy bài viết trending */
  async function fetchTrending(limit = 10) {
    // Không dùng execute để tránh ảnh hưởng loading state chung nếu gọi ngầm
    try {
      const { data } = await postsApi.getTrending(limit)
      return data.data
    } catch {
      return []
    }
  }

  /** Lấy bình luận */
  async function fetchComments(postId: string) {
    await execute(async () => {
      const { data } = await postsApi.getComments(postId)
      comments.value = data.data
    }, 'Lỗi lấy comments')
  }

  /** Vote */
  async function upvote(postId: string) {
    await postsApi.upvote(postId)
  }

  async function downvote(postId: string) {
    await postsApi.downvote(postId)
  }

  /** Lấy bài viết xung quanh (bản đồ) */
  async function fetchNearby(lat: number, lng: number, radius: number = 5) {
    await execute(async () => {
      const { data } = await postsApi.getNearby(lat, lng, radius)
      posts.value = data.data
    }, 'Không tìm thấy bài viết lân cận')
  }

  /** Tạo bài viết mới */
  async function createPost(payload: any) {
    return await execute(async () => {
      const { data } = await postsApi.create(payload)
      return data.data
    }, 'Tạo bài viết thất bại')
  }

  async function toggleBookmark(postId: string, isBookmarked: boolean) {
    if (isBookmarked) {
      await postsApi.bookmark(postId)
    } else {
      await postsApi.removeBookmark(postId)
    }
  }

  /** Lấy các tag phổ biến */
  async function fetchPopularTags() {
    await execute(async () => {
      const { data } = await postsApi.getPopularTags()
      tags.value = data.data
    }, 'Lỗi tải tags')
  }

  return {
    posts,
    currentPost,
    comments,
    tags,
    isLoading,
    error,
    pagination,
    fetchPosts,
    fetchPost,
    fetchTrending,
    fetchComments,
    fetchPopularTags,
    upvote,
    downvote,
    fetchNearby,
    createPost,
    toggleBookmark,
  }
}
