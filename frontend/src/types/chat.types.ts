import type { User } from './user.types'

export type MessageStatus = 'sending' | 'sent' | 'delivered' | 'read'

export interface ChatConversation {
  id: string
  name: string
  avatar: string
  lastMessage: string
  lastMessageTime: string
  unreadCount: number
  isGroup: boolean
  isOnline: boolean
  isPinned: boolean
  isMuted: boolean
  participants: User[]
}

export interface ChatMessageReaction {
  emoji: string
  userId: string
  userName: string
}

export interface ChatMessage {
  id: string
  content: string
  sender: User
  createdAt: string
  isOwn: boolean
  type: 'text' | 'image' | 'file'
  status: MessageStatus
  readBy?: { user: User; readAt: string }[]
  replyTo?: {
    id: string
    content: string
    senderName: string
  }
  reactions?: ChatMessageReaction[]
  fileName?: string
  fileSize?: string
  imageUrl?: string
}
