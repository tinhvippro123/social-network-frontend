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
  replyToId?: string
  fileName?: string
  fileSize?: string
  imageUrl?: string
  fileUrl?: string
}

const chatApi = {
  getConversations: (params?: { page?: number; limit?: number }) =>
    http.get<ApiResponse<ChatConversation[]>>('/chat/conversations', { params }),

  getMessages: (conversationId: string, params?: { q?: string; page?: number; limit?: number }) =>
    http.get<ApiResponse<ChatMessage[]>>(`/chat/conversations/${conversationId}/messages`, { params }),

  sendMessage: (data: SendMessageRequest) =>
    http.post<ApiResponse<ChatMessage>>(`/chat/conversations/${data.conversationId}/messages`, {
      content: data.content,
      type: data.type || 'text',
      replyToId: data.replyToId,
      fileName: data.fileName,
      fileSize: data.fileSize,
      fileUrl: data.fileUrl,
      imageUrl: data.imageUrl,
    }),

  createConversation: (data: { participantIds: string[]; name?: string; isGroup?: boolean }) =>
    http.post<ApiResponse<ChatConversation>>('/chat/conversations', data),

  markAsRead: (conversationId: string) =>
    http.post<ApiResponse<void>>(`/chat/conversations/${conversationId}/read`),

  pinConversation: (conversationId: string, isPinned: boolean) =>
    http.patch<ApiResponse<void>>(`/chat/conversations/${conversationId}/pin`, { value: isPinned }),

  muteConversation: (conversationId: string, isMuted: boolean) =>
    http.patch<ApiResponse<void>>(`/chat/conversations/${conversationId}/mute`, { value: isMuted }),

  hideConversation: (conversationId: string) =>
    http.delete<ApiResponse<void>>(`/chat/conversations/${conversationId}`),

  deleteConversation: (conversationId: string) =>
    http.delete<ApiResponse<void>>(`/chat/conversations/${conversationId}`),

  searchMessages: (conversationId: string, q: string) =>
    http.get<ApiResponse<ChatMessage[]>>(`/chat/conversations/${conversationId}/messages`, { params: { q } }),

  blockUser: (userId: string) =>
    http.post<ApiResponse<void>>(`/chat/blocks/${userId}`),

  unblockUser: (userId: string) =>
    http.delete<ApiResponse<void>>(`/chat/blocks/${userId}`),

  revokeMessage: (conversationId: string, messageId: string) =>
    http.delete<ApiResponse<ChatMessage>>(`/chat/conversations/${conversationId}/messages/${messageId}`),

  pinMessage: (conversationId: string, messageId: string, isPinned: boolean) =>
    http.patch<ApiResponse<ChatMessage>>(`/chat/conversations/${conversationId}/messages/${messageId}/pin`, { value: isPinned }),
}

export default chatApi
