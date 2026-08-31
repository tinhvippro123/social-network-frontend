import { ref } from 'vue'
import chatApi from '@/api/chat.api'
import type { ChatConversation, ChatMessage } from '@/types'

export function useChat() {
  const conversations = ref<ChatConversation[]>([])
  const messages = ref<ChatMessage[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  async function fetchConversations() {
    isLoading.value = true
    try {
      const { data } = await chatApi.getConversations()
      conversations.value = data.data
    } catch (err: any) {
      error.value = err.message || 'Không thể tải hội thoại'
    } finally {
      isLoading.value = false
    }
  }

  async function fetchMessages(conversationId: string) {
    isLoading.value = true
    try {
      const { data } = await chatApi.getMessages(conversationId)
      messages.value = data.data
    } catch (err: any) {
      error.value = err.message || 'Không thể tải tin nhắn'
    } finally {
      isLoading.value = false
    }
  }

  return {
    conversations,
    messages,
    isLoading,
    error,
    fetchConversations,
    fetchMessages,
  }
}
