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
