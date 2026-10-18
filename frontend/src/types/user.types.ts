export interface User {
  id: string
  name: string
  avatar: string
  email?: string
  bio?: string
  role?: 'user' | 'admin' | 'moderator' | string
  joinedAt?: string
  postsCount?: number
  followersCount?: number
  followingCount?: number
  isFollowing?: boolean
  isMe?: boolean
}

export interface UserProfile extends User {
  isFollowing?: boolean
  isMe?: boolean
}

export interface UserSummary {
  id: string
  name: string
  avatar: string
  bio?: string
  role?: string
  isFollowing: boolean
}

