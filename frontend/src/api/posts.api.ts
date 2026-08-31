// ==========================================
// API — Posts (Bài viết)
// ==========================================
import http from './client'
import type { ApiResponse } from './client'
import type { Post } from '@/types'
import { mockPosts } from '@/data/mockData'

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

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
  getAll: async (params?: PostsQuery) => {
    await delay(500)
    return { data: { data: mockPosts, status: 200, message: 'Success' } } as unknown as Promise<{ data: ApiResponse<Post[]> }>
  },

  getById: async (id: string) => {
    await delay(500)
    const post = mockPosts.find(p => p.id === id) || mockPosts[0]
    return { data: { data: post, status: 200, message: 'Success' } } as unknown as Promise<{ data: ApiResponse<Post> }>
  },

  create: async (data: CreatePostRequest) => {
    await delay(500)
    return { data: { data: mockPosts[0], status: 200, message: 'Success' } } as unknown as Promise<{ data: ApiResponse<Post> }>
  },

  update: async (id: string, data: Partial<CreatePostRequest>) => {
    await delay(500)
    return { data: { data: mockPosts[0], status: 200, message: 'Success' } } as unknown as Promise<{ data: ApiResponse<Post> }>
  },

  delete: async (id: string) => {
    await delay(500)
    return { data: { status: 200, message: 'Success' } } as unknown as Promise<{ data: ApiResponse }>
  },

  // ── Interactions ──────────────────────────
  upvote: async (id: string) => {
    await delay(500)
    return { data: { status: 200, message: 'Success' } } as unknown as Promise<{ data: ApiResponse }>
  },

  downvote: async (id: string) => {
    await delay(500)
    return { data: { status: 200, message: 'Success' } } as unknown as Promise<{ data: ApiResponse }>
  },

  bookmark: async (id: string) => {
    await delay(500)
    return { data: { status: 200, message: 'Success' } } as unknown as Promise<{ data: ApiResponse }>
  },

  removeBookmark: async (id: string) => {
    await delay(500)
    return { data: { status: 200, message: 'Success' } } as unknown as Promise<{ data: ApiResponse }>
  },

  // ── Đặc biệt ─────────────────────────────
  getTrending: async (limit?: number) => {
    await delay(500)
    return { data: { data: mockPosts.slice(0, limit || 5), status: 200, message: 'Success' } } as unknown as Promise<{ data: ApiResponse<Post[]> }>
  },

  getNearby: async (lat: number, lng: number, radiusKm: number) => {
    await delay(500)
    return { data: { data: mockPosts.filter(p => p.location), status: 200, message: 'Success' } } as unknown as Promise<{ data: ApiResponse<Post[]> }>
  },

  searchSemantic: async (query: string) => {
    await delay(500)
    return { data: { data: mockPosts, status: 200, message: 'Success' } } as unknown as Promise<{ data: ApiResponse<Post[]> }>
  },

  searchByImage: async (formData: FormData) => {
    await delay(500)
    return { data: { data: mockPosts, status: 200, message: 'Success' } } as unknown as Promise<{ data: ApiResponse<Post[]> }>
  },

  getPopularTags: async () => {
    await delay(500)
    const mockTags = [
      { id: '1', name: 'Frontend', count: 1250 },
      { id: '2', name: 'Vue 3', count: 850 },
      { id: '3', name: 'React', count: 720 },
      { id: '4', name: 'JavaScript', count: 640 },
      { id: '5', name: 'TypeScript', count: 590 },
    ]
    return { data: { data: mockTags, status: 200, message: 'Success' } } as unknown as Promise<{ data: ApiResponse<{id: string, name: string, count: number}[]> }>
  },

  getComments: async (postId: string) => {
    await delay(500)
    // Dynamic import to avoid circular dependency or just importing it at top
    const { mockComments } = await import('@/data/mockData')
    return { data: { data: mockComments, status: 200, message: 'Success' } } as unknown as Promise<{ data: ApiResponse<any[]> }>
  },
}

export default postsApi
