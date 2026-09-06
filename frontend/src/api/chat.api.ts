// ==========================================
// API — Chat (Tin nhắn)
// ==========================================
import http from './client'
import type { ApiResponse } from './client'
import type { ChatConversation, ChatMessage } from '@/types'
import { mockConversations, mockMessages, mockUsers } from '@/data/mockData'

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

export interface SendMessageRequest {
  conversationId: string
  content: string
  type?: 'text' | 'image' | 'file'
  replyToId?: string
  fileName?: string
  fileSize?: string
  imageUrl?: string
}

const chatApi = {
  getConversations: async () => {
    await delay(500)
    return { data: { data: [...mockConversations], status: 200, message: 'Success' } } as unknown as Promise<{ data: ApiResponse<ChatConversation[]> }>
  },

  getMessages: async (conversationId: string, params?: { page?: number; limit?: number }) => {
    await delay(500)
    return { data: { data: [...mockMessages], status: 200, message: 'Success' } } as unknown as Promise<{ data: ApiResponse<ChatMessage[]> }>
  },

  sendMessage: async (data: SendMessageRequest) => {
    await delay(300)
    const replyTo = data.replyToId
      ? {
          id: data.replyToId,
          content: mockMessages.find(m => m.id === data.replyToId)?.content || '',
          senderName: mockMessages.find(m => m.id === data.replyToId)?.sender.name || ''
        }
      : undefined

    const newMessage: ChatMessage = {
      id: `m${Date.now()}`,
      content: data.content,
      sender: mockUsers[0],
      createdAt: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      isOwn: true,
      type: data.type || 'text',
      status: 'sending',
      replyTo,
      fileName: data.fileName,
      fileSize: data.fileSize,
      imageUrl: data.imageUrl,
    }
    return { data: { data: newMessage, status: 200, message: 'Success' } } as unknown as Promise<{ data: ApiResponse<ChatMessage> }>
  },

  createConversation: async (data: { participantIds: string[]; name?: string; isGroup?: boolean }) => {
    await delay(500)
    return { data: { data: mockConversations[0], status: 200, message: 'Success' } } as unknown as Promise<{ data: ApiResponse<ChatConversation> }>
  },

  markAsRead: async (conversationId: string) => {
    await delay(200)
    return { data: { status: 200, message: 'Success' } } as unknown as Promise<{ data: ApiResponse }>
  },

  pinConversation: async (conversationId: string, isPinned: boolean) => {
    await delay(300)
    return { data: { status: 200, message: 'Success' } } as unknown as Promise<{ data: ApiResponse }>
  },

  muteConversation: async (conversationId: string, isMuted: boolean) => {
    await delay(300)
    return { data: { status: 200, message: 'Success' } } as unknown as Promise<{ data: ApiResponse }>
  },

  blockUser: async (userId: string) => {
    await delay(300)
    return { data: { status: 200, message: 'Success' } } as unknown as Promise<{ data: ApiResponse }>
  },

  deleteConversation: async (conversationId: string) => {
    await delay(300)
    return { data: { status: 200, message: 'Success' } } as unknown as Promise<{ data: ApiResponse }>
  },

  searchMessages: async (conversationId: string, query: string) => {
    await delay(500)
    const filtered = mockMessages.filter(m =>
      m.content.toLowerCase().includes(query.toLowerCase())
    )
    return { data: { data: filtered, status: 200, message: 'Success' } } as unknown as Promise<{ data: ApiResponse<ChatMessage[]> }>
  },
}

export default chatApi
