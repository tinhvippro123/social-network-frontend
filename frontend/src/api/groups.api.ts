// ==========================================
// API — Community Groups (Nhóm cộng đồng)
// ==========================================
import http from './client'
import type { ApiResponse } from './client'
import type { Group } from '@/types'

export interface GroupQuery {
  joined?: boolean
  q?: string
  page?: number
  limit?: number
}

export interface CreateGroupRequest {
  name: string
  description?: string
  avatar?: string
  coverImage?: string
  isPublic?: boolean
}

export interface GroupMemberItem {
  user: {
    id: string
    name: string
    avatar?: string
  }
  role: 'OWNER' | 'ADMIN' | 'MEMBER'
  joinedAt: string
}

export interface GroupPostItem {
  id: string
  groupId: string
  title: string
  content: string
  excerpt?: string
  coverImage?: string
  author: {
    id: string
    name: string
    avatar?: string
  }
  createdAt: string
  updatedAt: string
}

const groupsApi = {
  getAll: (params?: GroupQuery) =>
    http.get<ApiResponse<Group[]>>('/groups', { params }),

  getById: (id: string) =>
    http.get<ApiResponse<Group>>(`/groups/${id}`),

  create: (data: CreateGroupRequest) =>
    http.post<ApiResponse<Group>>('/groups', data),

  update: (id: string, data: Partial<CreateGroupRequest>) =>
    http.put<ApiResponse<Group>>(`/groups/${id}`, data),

  delete: (id: string) =>
    http.delete<ApiResponse<void>>(`/groups/${id}`),

  join: (id: string) =>
    http.post<ApiResponse<Group>>(`/groups/${id}/join`),

  leave: (id: string) =>
    http.delete<ApiResponse<void>>(`/groups/${id}/members/me`),

  getMembers: (id: string, params?: { page?: number; limit?: number }) =>
    http.get<ApiResponse<GroupMemberItem[]>>(`/groups/${id}/members`, { params }),

  addMember: (id: string, userId: string) =>
    http.post<ApiResponse<void>>(`/groups/${id}/members`, { userId }),

  removeMember: (id: string, userId: string) =>
    http.delete<ApiResponse<void>>(`/groups/${id}/members/${userId}`),

  updateMemberRole: (id: string, userId: string, role: 'OWNER' | 'ADMIN' | 'MEMBER') =>
    http.patch<ApiResponse<void>>(`/groups/${id}/members/${userId}/role`, { role }),

  getPosts: (id: string, params?: { page?: number; limit?: number }) =>
    http.get<ApiResponse<GroupPostItem[]>>(`/groups/${id}/posts`, { params }),

  getPostById: (id: string, postId: string) =>
    http.get<ApiResponse<GroupPostItem>>(`/groups/${id}/posts/${postId}`),

  createPost: (id: string, data: { title: string; content: string; excerpt?: string; coverImage?: string }) =>
    http.post<ApiResponse<GroupPostItem>>(`/groups/${id}/posts`, data),

  updatePost: (id: string, postId: string, data: { title: string; content: string; excerpt?: string; coverImage?: string }) =>
    http.put<ApiResponse<GroupPostItem>>(`/groups/${id}/posts/${postId}`, data),

  deletePost: (id: string, postId: string) =>
    http.delete<ApiResponse<void>>(`/groups/${id}/posts/${postId}`),
}

export default groupsApi
