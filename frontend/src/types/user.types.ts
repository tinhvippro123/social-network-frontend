export interface UserPreferences {
  profileVisibility: 'public' | 'followers' | 'private'
  allowMessages: 'everyone' | 'followers' | 'nobody'
  showOnlineStatus: boolean
  showReadReceipts: boolean
  emailNewFollower: boolean
  emailNewComment: boolean
  emailNewMessage: boolean
  pushNewFollower: boolean
  pushNewComment: boolean
  pushNewMessage: boolean
  pushTrending: boolean
}

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
  emailVerified?: boolean
  preferences?: UserPreferences
}

export interface UserProfile extends User {
  isFollowing?: boolean
  isMe?: boolean
  profileVisibility?: 'public' | 'followers' | 'private'
  allowMessages?: 'everyone' | 'followers' | 'nobody'
  canViewProfile?: boolean
  canMessage?: boolean
}

export interface UserSummary {
  id: string
  name: string
  avatar: string
  bio?: string
  role?: string
  isFollowing: boolean
}

