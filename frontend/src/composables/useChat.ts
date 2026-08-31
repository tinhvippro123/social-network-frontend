import { ref } from 'vue'
import chatApi from '@/api/chat.api'
import type { ChatConversation, ChatMessage } from '@/types'

import { useAsyncState } from './useAsyncState'

export function useChat() {
  const conversations = ref<ChatConversation[]>([])
  const messages = ref<ChatMessage[]>([])
  const { isLoading, error, execute } = useAsyncState()

  async function fetchConversations() {
    await execute(async () => {
      const { data } = await chatApi.getConversations()
      conversations.value = data.data
    }, 'Không thể tải hội thoại')
  }

  async function fetchMessages(conversationId: string) {
    await execute(async () => {
      const { data } = await chatApi.getMessages(conversationId)
      messages.value = data.data
    }, 'Không thể tải tin nhắn')
  }

  async function sendMessage(conversationId: string, content: string, type: 'text' | 'image' | 'file' = 'text') {
    return await execute(async () => {
      const { data } = await chatApi.sendMessage({ conversationId, content, type })
      // Tạm thời push vào messages để UI update ngay
      messages.value.push(data.data)
      return data.data
    }, 'Gửi tin nhắn thất bại')
  }

  return {
    conversations,
    messages,
    isLoading,
    error,
    fetchConversations,
    fetchMessages,
    sendMessage,
  }
}
