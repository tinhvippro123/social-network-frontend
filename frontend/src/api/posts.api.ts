// ==========================================
// API — Posts (Bài viết)
// ==========================================
import http from './client'
import type { ApiResponse } from './client'
import type { Post } from '@/types'

export interface PostsQuery {
  page?: number
  limit?: number
  category?: string
  sort?: 'latest' | 'trending' | 'popular'
  search?: string
  status?: string
  authorId?: string
}

export interface CreatePostRequest {
  title: string
  content: string
  excerpt?: string
  categoryId: string
  tags: string[]
  coverImage?: string
  status: 'published' | 'draft'
  latitude?: number
  longitude?: number
}

export interface TagSummary {
  name: string
  postsCount: number
}

const postsApi = {
  // ── CRUD ──────────────────────────────────
  getAll: (params?: PostsQuery) =>
    http.get<ApiResponse<Post[]>>('/posts', { params }),

  getById: (id: string) =>
    http.get<ApiResponse<Post>>(`/posts/${id}`),

  create: (data: CreatePostRequest) =>
    http.post<ApiResponse<Post>>('/posts', data),

  update: (id: string, data: Partial<CreatePostRequest>) =>
    http.put<ApiResponse<Post>>(`/posts/${id}`, data),

  delete: (id: string) =>
    http.delete<ApiResponse<void>>(`/posts/${id}`),

  // ── Interactions ──────────────────────────
  upvote: (id: string) =>
    http.post<ApiResponse<void>>(`/posts/${id}/upvote`),

  downvote: (id: string) =>
    http.post<ApiResponse<void>>(`/posts/${id}/downvote`),

  getUserVote: (postId: string) =>
    http.get<ApiResponse<string | null>>(`/posts/${postId}/vote`),

  getCurrentUserReaction: (postId: string) =>
    http.get<ApiResponse<string | null>>(`/posts/${postId}/reactions/me`),

  toggleReaction: (postId: string, emoji: string) =>
    http.post<ApiResponse<any>>(`/posts/${postId}/reactions`, { emoji }),

  getReactionSummary: (postId: string) =>
    http.get<ApiResponse<any>>(`/posts/${postId}/reactions/summary`),

  reportPost: (postId: string, data: { reason: string; description?: string }) =>
    http.post<ApiResponse<any>>('/reports', {
      targetId: postId,
      type: 'POST',
      reason: data.reason,
      description: data.description,
    }),

  toggleBookmark: (postId: string) =>
    http.post<ApiResponse<boolean>>(`/posts/${postId}/bookmarks`),

  checkBookmark: (postId: string) =>
    http.get<ApiResponse<boolean>>(`/posts/${postId}/bookmarks/check`),

  bookmark: (id: string) =>
    http.post<ApiResponse<boolean>>(`/posts/${id}/bookmarks`),

  removeBookmark: (id: string) =>
    http.post<ApiResponse<boolean>>(`/posts/${id}/bookmarks`),

  // ── Đặc biệt ─────────────────────────────
  getTrending: (limit = 10) =>
    http.get<ApiResponse<Post[]>>('/posts/trending', { params: { limit } }),

  getNearby: (lat: number, lng: number, radius = 5, limit = 20) =>
    http.get<ApiResponse<Post[]>>('/posts/nearby', { params: { lat, lng, radius, limit } }),

  searchSemantic: (query: string, limit = 20) =>
    http.get<ApiResponse<Post[]>>('/search/semantic', { params: { q: query, limit } }),

  searchByImage: (formData: FormData, limit = 20) =>
    http.post<ApiResponse<Post[]>>('/search/image', formData, {
      params: { limit },
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  getPopularTags: (limit = 30) =>
    http.get<ApiResponse<TagSummary[]>>('/tags', { params: { limit } }),

  getComments: (postId: string) =>
    http.get<ApiResponse<any[]>>(`/posts/${postId}/comments`),

  addComment: (postId: string, data: { content: string; parentId?: string | null }) =>
    http.post<ApiResponse<any>>(`/posts/${postId}/comments`, data),

  deleteComment: (postId: string, commentId: string) =>
    http.delete<ApiResponse<void>>(`/posts/${postId}/comments/${commentId}`),
}

export default postsApi
