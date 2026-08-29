// ==========================================
// API — Chat (Tin nhắn)
// ==========================================
import http from './client'
import type { ApiResponse } from './client'
import type { ChatConversation, ChatMessage } from '@/types'

export interface SendMessageRequest {
  conversationId: string
  content: string
  type?: 'text' | 'image' | 'file'
}

const chatApi = {
  getConversations: () =>
    http.get<ApiResponse<ChatConversation[]>>('/chat/conversations'),

  getMessages: (conversationId: string, params?: { page?: number; limit?: number }) =>
    http.get<ApiResponse<ChatMessage[]>>(`/chat/conversations/${conversationId}/messages`, { params }),

  sendMessage: (data: SendMessageRequest) =>
    http.post<ApiResponse<ChatMessage>>(`/chat/conversations/${data.conversationId}/messages`, data),

  createConversation: (data: { participantIds: string[]; name?: string; isGroup?: boolean }) =>
    http.post<ApiResponse<ChatConversation>>('/chat/conversations', data),

  markAsRead: (conversationId: string) =>
    http.put<ApiResponse>(`/chat/conversations/${conversationId}/read`),
}

export default chatApi
