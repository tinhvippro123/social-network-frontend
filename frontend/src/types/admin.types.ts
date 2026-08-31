import type { User } from './user.types'

export interface Notification {
  id: string
  type: 'comment' | 'upvote' | 'follow' | 'mention' | 'report' | 'system'
  message: string
  avatar: string
  createdAt: string
  isRead: boolean
  link: string
}

export interface Report {
  id: string
  targetId: string
  targetType: 'post' | 'comment' | 'user' | 'group'
  targetTitle: string
  reason: string
  description?: string
  status: 'pending' | 'resolved' | 'dismissed'
  createdAt: string
  reporter: Pick<User, 'id' | 'name' | 'avatar'>
}

export interface AdminStats {
  totalUsers: number
  totalPosts: number
  totalGroups: number
  totalReports: number
  userGrowth: number[]
  postGrowth: number[]
}

export interface PaginationParams {
  page: number
  limit: number
  sortBy?: string
  order?: 'asc' | 'desc'
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}
