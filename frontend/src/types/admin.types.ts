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
  type: 'post' | 'comment' | 'user' | 'group'
  targetTitle: string
  reason: string
  description?: string
  status: 'pending' | 'resolved' | 'dismissed'
  createdAt: string
  reporter: Pick<User, 'id' | 'name' | 'avatar'>
}

export interface AdminStats {
  totalUsers: number
  newUsersToday: number
  totalPosts: number
  newPostsToday: number
  totalGroups: number
  totalReports: number
  pendingReports: number
  userGrowth: number[]
  postGrowth: number[]
  viewsToday: {
    total: number
    growthPct: number
  }
  topCategories: Array<{
    name: string
    count: number
    pct: number
  }>
  recentActivities: Array<{
    text: string
    time: string
    color: string
  }>
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
