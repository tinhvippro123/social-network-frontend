import type { User } from './user.types'

export interface GeoLocation {
  lat: number
  lng: number
  address?: string
}

export interface Category {
  id: string
  name: string
  slug: string
  icon: string
  postsCount: number
}

export interface Post {
  id: string
  title: string
  excerpt: string
  content: string
  coverImage: string
  author: User
  category: Category
  tags: string[]
  createdAt: string
  updatedAt: string
  viewsCount: number
  upvotesCount: number
  commentsCount: number
  bookmarked: boolean
  upvoted: boolean
  status: 'draft' | 'published' | 'hidden'
  location?: GeoLocation
  eventStartTime?: string
  eventEndTime?: string
}

export interface Reaction {
  emoji: string
  count: number
  reacted: boolean // Người dùng hiện tại đã react chưa
}

export interface Comment {
  id: string
  content: string
  author: User
  createdAt: string
  replies: Comment[]
  upvotesCount: number
  reactions: Reaction[]
  replyTo?: string // Tên người đang reply (cho cấp 3+)
}
