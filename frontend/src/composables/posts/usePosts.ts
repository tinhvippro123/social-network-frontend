// ==========================================
// Composable — usePosts
// Fetch, filter, paginate bài viết
// ==========================================
import { ref, reactive } from 'vue'
import postsApi from '@/api/posts.api'
import type { PostsQuery } from '@/api/posts.api'
import type { Post } from '@/types'
import { useAsyncState } from '../core/useAsyncState'

export function mapCommentResponse(dto: any): any {
  if (!dto) return null
  return {
    id: String(dto.id),
    content: dto.content,
    author: {
      id: dto.authorId || dto.author?.id || 'guest',
      name: dto.authorName || dto.author?.name || 'Thành viên',
      avatar: dto.authorAvatar || dto.author?.avatar || '',
      isVerified: dto.author?.isVerified || false,
      roles: dto.author?.roles || ['user']
    },
    createdAt: dto.createdAt,
    upvotes: dto.upvotes ?? 0,
    downvotes: dto.downvotes ?? 0,
    reactions: dto.reactions || [],
    replyTo: dto.replyTo,
    replies: Array.isArray(dto.replies) ? dto.replies.map(mapCommentResponse).filter(Boolean) : []
  }
}

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
      const list = data?.data
      comments.value = Array.isArray(list) ? list.map(mapCommentResponse).filter(Boolean) : []
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

  async function toggleBookmark(postId: string, _isBookmarked?: boolean) {
    try {
      const { data } = await postsApi.toggleBookmark(postId)
      return data.data as boolean
    } catch (err) {
      console.error('Lỗi toggle bookmark', err)
      throw err
    }
  }

  /** Lấy các tag phổ biến */
  async function fetchPopularTags() {
    try {
      const { data } = await postsApi.getPopularTags()
      const list = data?.data || []
      tags.value = list.map((t: any, idx: number) => ({
        id: t.id || String(idx + 1),
        name: t.name,
        count: t.postsCount ?? t.count ?? 0,
      }))
    } catch (err) {
      console.error('Lỗi tải tags', err)
      tags.value = []
    }
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
