// ==========================================
// Type definitions for the Blog Platform
// ==========================================

export interface User {
  id: string
  name: string
  email: string
  avatar: string
  bio: string
  role: 'user' | 'admin' | 'moderator'
  joinedAt: string
  postsCount: number
  followersCount: number
  followingCount: number
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
}

export interface Category {
  id: string
  name: string
  slug: string
  icon: string
  postsCount: number
}

export interface Comment {
  id: string
  content: string
  author: User
  createdAt: string
  replies: Comment[]
  upvotesCount: number
}

export interface Group {
  id: string
  name: string
  description: string
  avatar: string
  coverImage: string
  membersCount: number
  postsCount: number
  isJoined: boolean
  isPublic: boolean
  createdAt: string
  owner: User
}

export interface ChatConversation {
  id: string
  name: string
  avatar: string
  lastMessage: string
  lastMessageTime: string
  unreadCount: number
  isGroup: boolean
  isOnline: boolean
  participants: User[]
}

export interface ChatMessage {
  id: string
  content: string
  sender: User
  createdAt: string
  isOwn: boolean
  type: 'text' | 'image' | 'file'
}

export interface Notification {
  id: string
  type: 'comment' | 'upvote' | 'follow' | 'mention' | 'report' | 'system'
  message: string
  avatar: string
  createdAt: string
  isRead: boolean
  link: string
}

export interface GeoLocation {
  lat: number
  lng: number
  address: string
}

export interface Report {
  id: string
  type: 'post' | 'comment' | 'user'
  reason: string
  reporter: User
  targetId: string
  targetTitle: string
  status: 'pending' | 'resolved' | 'dismissed'
  createdAt: string
}

export interface AdminStats {
  totalUsers: number
  newUsersToday: number
  totalPosts: number
  newPostsToday: number
  totalGroups: number
  pendingReports: number
  userGrowth: number[]
  postGrowth: number[]
}
