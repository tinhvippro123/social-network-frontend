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
    http.delete<ApiResponse>(`/posts/${id}`),

  // ── Interactions ──────────────────────────
  upvote: (id: string) =>
    http.post<ApiResponse>(`/posts/${id}/upvote`),

  downvote: (id: string) =>
    http.post<ApiResponse>(`/posts/${id}/downvote`),

  bookmark: (id: string) =>
    http.post<ApiResponse>(`/posts/${id}/bookmark`),

  removeBookmark: (id: string) =>
    http.delete<ApiResponse>(`/posts/${id}/bookmark`),

  // ── Đặc biệt ─────────────────────────────
  getTrending: (limit?: number) =>
    http.get<ApiResponse<Post[]>>('/posts/trending', { params: { limit } }),

  getNearby: (lat: number, lng: number, radiusKm: number) =>
    http.get<ApiResponse<Post[]>>('/posts/nearby', { params: { lat, lng, radius: radiusKm } }),

  searchSemantic: (query: string) =>
    http.get<ApiResponse<Post[]>>('/search/semantic', { params: { q: query } }),

  searchByImage: (formData: FormData) =>
    http.post<ApiResponse<Post[]>>('/search/image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
}

export default postsApi
