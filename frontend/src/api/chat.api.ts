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
    await delay(500)
    const newMessage: ChatMessage = {
      id: `m${Date.now()}`,
      content: data.content,
      sender: mockUsers[0],
      createdAt: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      isOwn: true,
      type: data.type || 'text'
    }
    return { data: { data: newMessage, status: 200, message: 'Success' } } as unknown as Promise<{ data: ApiResponse<ChatMessage> }>
  },

  createConversation: async (data: { participantIds: string[]; name?: string; isGroup?: boolean }) => {
    await delay(500)
    return { data: { data: mockConversations[0], status: 200, message: 'Success' } } as unknown as Promise<{ data: ApiResponse<ChatConversation> }>
  },

  markAsRead: async (conversationId: string) => {
    await delay(500)
    return { data: { status: 200, message: 'Success' } } as unknown as Promise<{ data: ApiResponse }>
  },
}

export default chatApi
