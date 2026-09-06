import { ref } from 'vue'
import chatApi from '@/api/chat.api'
import type { ChatConversation, ChatMessage, MessageStatus } from '@/types'
import { useAsyncState } from './useAsyncState'

export function useChat() {
  const conversations = ref<ChatConversation[]>([])
  const messages = ref<ChatMessage[]>([])
  const isTyping = ref(false)
  const typingUser = ref('')
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

  async function sendMessage(
    conversationId: string,
    content: string,
    type: 'text' | 'image' | 'file' = 'text',
    options?: {
      replyToId?: string
      fileName?: string
      fileSize?: string
      imageUrl?: string
    }
  ) {
    return await execute(async () => {
      const { data } = await chatApi.sendMessage({
        conversationId,
        content,
        type,
        replyToId: options?.replyToId,
        fileName: options?.fileName,
        fileSize: options?.fileSize,
        imageUrl: options?.imageUrl,
      })
      const msg = data.data
      // Push vào messages ngay để UI update instant
      messages.value.push(msg)

      // Giả lập: sending → sent → delivered (auto-transition)
      setTimeout(() => {
        updateMessageStatus(msg.id, 'sent')
      }, 500)
      setTimeout(() => {
        updateMessageStatus(msg.id, 'delivered')
      }, 1500)
      // Giả lập đã xem sau 4 giây
      setTimeout(() => {
        updateMessageStatus(msg.id, 'read')
      }, 4000)

      return msg
    }, 'Gửi tin nhắn thất bại')
  }

  function updateMessageStatus(messageId: string, status: MessageStatus) {
    const msg = messages.value.find(m => m.id === messageId)
    if (msg) {
      msg.status = status
    }
  }

  async function markAsRead(conversationId: string) {
    await chatApi.markAsRead(conversationId)
    // Cập nhật unread count
    const conv = conversations.value.find(c => c.id === conversationId)
    if (conv) conv.unreadCount = 0
  }

  async function pinConversation(conversationId: string) {
    const conv = conversations.value.find(c => c.id === conversationId)
    if (conv) {
      const newState = !conv.isPinned
      await chatApi.pinConversation(conversationId, newState)
      conv.isPinned = newState
    }
  }

  async function muteConversation(conversationId: string) {
    const conv = conversations.value.find(c => c.id === conversationId)
    if (conv) {
      const newState = !conv.isMuted
      await chatApi.muteConversation(conversationId, newState)
      conv.isMuted = newState
    }
  }

  async function deleteConversation(conversationId: string) {
    await chatApi.deleteConversation(conversationId)
    conversations.value = conversations.value.filter(c => c.id !== conversationId)
  }

  async function blockUser(userId: string) {
    await chatApi.blockUser(userId)
  }

  async function searchMessages(conversationId: string, query: string) {
    const { data } = await chatApi.searchMessages(conversationId, query)
    return data.data
  }

  // Mock functions for new message actions
  async function addReaction(messageId: string, emoji: string, user: { id: string, name: string }) {
    const msg = messages.value.find(m => m.id === messageId)
    if (msg) {
      if (!msg.reactions) msg.reactions = []
      const existingIdx = msg.reactions.findIndex(r => r.userId === user.id)
      if (existingIdx >= 0) {
        if (msg.reactions[existingIdx].emoji === emoji) {
          msg.reactions.splice(existingIdx, 1) // Toggle off
        } else {
          msg.reactions[existingIdx].emoji = emoji // Change emoji
        }
      } else {
        msg.reactions.push({ emoji, userId: user.id, userName: user.name })
      }
    }
  }

  async function deleteMessage(messageId: string) {
    messages.value = messages.value.filter(m => m.id !== messageId)
  }

  async function revokeMessage(messageId: string) {
    const msg = messages.value.find(m => m.id === messageId)
    if (msg && msg.isOwn) {
      msg.status = 'revoked'
      msg.content = ''
      msg.type = 'text'
    }
  }

  async function pinMessage(messageId: string) {
    const msg = messages.value.find(m => m.id === messageId)
    if (msg) {
      msg.isPinned = !msg.isPinned
    }
  }

  // Giả lập typing indicator
  function simulateTyping(userName: string) {
    isTyping.value = true
    typingUser.value = userName
    setTimeout(() => {
      isTyping.value = false
      typingUser.value = ''
    }, 3000)
  }

  return {
    conversations,
    messages,
    isLoading,
    error,
    isTyping,
    typingUser,
    fetchConversations,
    fetchMessages,
    sendMessage,
    markAsRead,
    pinConversation,
    muteConversation,
    deleteConversation,
    blockUser,
    searchMessages,
    addReaction,
    deleteMessage,
    revokeMessage,
    pinMessage,
    simulateTyping,
    updateMessageStatus,
  }
}
