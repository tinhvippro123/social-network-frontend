import type { User } from './user.types'

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
