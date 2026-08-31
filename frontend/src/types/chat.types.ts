import type { User } from './user.types'

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
