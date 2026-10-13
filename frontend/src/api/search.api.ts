import http from './client'
import type { ApiResponse } from './client'
import type { Post } from '@/types'

export interface PostSummary {
  postId: string
  summary: string
  sentences: string[]
  algorithm: string
}

export interface SentimentResult {
  label: 'positive' | 'negative' | 'neutral'
  score: number
  positiveMatches: number
  negativeMatches: number
  algorithm: string
}

function upload(path: string, field: 'file' | 'image', file: File, limit = 20) {
  const form = new FormData()
  form.append(field, file)
  return http.post<ApiResponse<Post[]>>(path, form, {
    params: { limit },
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}

const searchApi = {
  keyword: (query: string, limit = 20) =>
    http.get<ApiResponse<Post[]>>('/search', { params: { q: query, type: 'keyword', limit } }),

  semantic: (query: string, limit = 20) =>
    http.get<ApiResponse<Post[]>>('/search/semantic', { params: { q: query, limit } }),

  image: (file: File, limit = 20) => upload('/search/image', 'image', file, limit),

  document: (file: File, limit = 20) => upload('/search/document', 'file', file, limit),

  indexImage: (postId: string, file: File) => {
    const form = new FormData()
    form.append('image', file)
    return http.post<ApiResponse<void>>(`/posts/${postId}/search-image`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },

  nearby: (lat: number, lng: number, radius = 5, limit = 20) =>
    http.get<ApiResponse<Post[]>>('/posts/nearby', { params: { lat, lng, radius, limit } }),

  summary: (postId: string, sentences = 3) =>
    http.get<ApiResponse<PostSummary>>(`/posts/${postId}/summary`, { params: { sentences } }),

  sentiment: (text: string) =>
    http.post<ApiResponse<SentimentResult>>('/nlp/sentiment', { text }),

  commentSentiment: (postId: string, commentId: string) =>
    http.get<ApiResponse<SentimentResult>>(`/posts/${postId}/comments/${commentId}/sentiment`),
}

export default searchApi
