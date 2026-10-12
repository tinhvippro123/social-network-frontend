import http from './client'
import type { ApiResponse } from './client'
import type { User, UserProfile, UserSummary, Post } from '@/types'

const usersApi = {
  getProfile: (id: string) =>
    http.get<ApiResponse<UserProfile>>(`/users/${id}`),

  getMyProfile: () =>
    http.get<ApiResponse<UserProfile>>('/users/me'),

  updateProfile: (data: { name: string; bio?: string; avatar?: string }) =>
    http.put<ApiResponse<UserProfile>>('/users/me', data),

  toggleFollow: (id: string) =>
    http.post<ApiResponse<boolean>>(`/users/${id}/follow`),

  getFollowers: (id: string) =>
    http.get<ApiResponse<UserSummary[]>>(`/users/${id}/followers`),

  getFollowing: (id: string) =>
    http.get<ApiResponse<UserSummary[]>>(`/users/${id}/following`),

  getAll: (limit: number = 20) =>
    http.get<ApiResponse<UserSummary[]>>('/users/recommended', { params: { limit } }),

  getRecommended: (limit: number = 5) =>
    http.get<ApiResponse<UserSummary[]>>('/users/recommended', { params: { limit } }),

  getUserPosts: (id: string, page: number = 1, limit: number = 10) =>
    http.get<ApiResponse<Post[]>>(`/users/${id}/posts`, { params: { page, limit } }),
}

export default usersApi
