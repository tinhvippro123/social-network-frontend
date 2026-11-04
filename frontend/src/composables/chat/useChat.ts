import { ref } from 'vue'
import chatApi from '@/api/chat.api'
import type { ChatConversation, ChatMessage, MessageStatus } from '@/types'
import { useAsyncState } from '../core/useAsyncState'
import { useChatNicknames } from './useChatNicknames'
import { useWebSocket } from '../core/useWebSocket'

export function useChat(onRealtimeMessage?: (msg: ChatMessage, conversationId: string) => void) {
  const { applyNicknamesToConversations } = useChatNicknames()
  const conversations = ref<ChatConversation[]>([])
  const messages = ref<ChatMessage[]>([])
  const activeConversationId = ref<string | null>(null)
  const isTyping = ref(false)
  const typingUser = ref('')
  const { isLoading, error, execute } = useAsyncState()

  function handleWsEvent(event: any) {
    if (!event || typeof event !== 'object' || !event.type) return

    const convId: string | undefined = event.conversationId
    const payload = event.payload

    if (event.type === 'message.created' && payload) {
      const incoming = payload as ChatMessage
      // Cập nhật hội thoại bên sidebar
      const conv = conversations.value.find(c => c.id === convId)
      if (conv) {
        conv.lastMessage =
          incoming.content ||
          (incoming.type === 'image' ? '[Hình ảnh]' : incoming.type === 'file' ? `[Tệp] ${incoming.fileName || ''}` : '')
        conv.lastMessageTime = incoming.createdAt || incoming.timestamp || new Date().toISOString()
        if (!incoming.isOwn && activeConversationId.value !== convId) {
          conv.unreadCount = (conv.unreadCount || 0) + 1
        }
      }

      // Nếu đang mở đúng hội thoại này thì đẩy vào danh sách tin nhắn
      if (activeConversationId.value === convId) {
        const existingIdx = messages.value.findIndex(m => m.id === incoming.id)
        if (existingIdx >= 0) {
          messages.value[existingIdx] = { ...messages.value[existingIdx], ...incoming }
        } else {
          messages.value.push(incoming)
          if (onRealtimeMessage && convId) {
            onRealtimeMessage(incoming, convId)
          }
        }
      }
      return
    }

    if ((event.type === 'message.revoked' || event.type === 'message.updated') && payload) {
      const updated = payload as ChatMessage
      const idx = messages.value.findIndex(m => m.id === updated.id)
      if (idx >= 0) {
        messages.value[idx] = {
          ...messages.value[idx],
          ...updated,
          status: updated.isRevoked ? 'revoked' : (updated.status || messages.value[idx].status),
        }
      }
      return
    }

    if (event.type === 'conversation.read' && convId) {
      if (activeConversationId.value === convId) {
        messages.value.forEach(m => {
          if (m.isOwn && m.status !== 'revoked') {
            m.status = 'read'
          }
        })
      }
      return
    }

    if (event.type === 'conversation.created' && payload) {
      const newConv = payload as ChatConversation
      if (!conversations.value.some(c => c.id === newConv.id)) {
        conversations.value.unshift(...applyNicknamesToConversations([newConv]))
      }
      return
    }

    if (event.type === 'conversation.nickname' && convId && payload) {
      const conv = conversations.value.find(c => c.id === convId)
      if (conv) {
        conv.nickname = payload.nickname || ''
        if (payload.nickname) {
          conv.name = payload.nickname
        } else if ((conv as any).originalName) {
          conv.name = (conv as any).originalName
        }
      }
    }
  }

  const { isConnected: isWsConnected, connect: connectWs, disconnect: disconnectWs } = useWebSocket(undefined, handleWsEvent)

  if (typeof window !== 'undefined') {
    connectWs()
    window.addEventListener('chat-nickname-changed', (e: any) => {
      const detail = e.detail
      if (!detail) return
      const target = conversations.value.find(c => c.id === detail.convId || c.participants?.some(p => p.id === detail.otherId))
      if (target) {
        target.nickname = detail.nickname
        target.name = detail.name
        if (detail.originalName) target.originalName = detail.originalName
      }
    })
  }

  async function fetchConversations() {
    await execute(async () => {
      const { data } = await chatApi.getConversations()
      conversations.value = applyNicknamesToConversations(data.data)
    }, 'Không thể tải hội thoại')
  }

  async function fetchMessages(conversationId: string) {
    activeConversationId.value = conversationId
    await execute(async () => {
      const { data } = await chatApi.getMessages(conversationId)
      messages.value = [...(data.data || [])]
        .reverse()
        .sort((a, b) => {
          const ta = new Date(a.createdAt || a.timestamp || '').getTime()
          const tb = new Date(b.createdAt || b.timestamp || '').getTime()
          if (Number.isNaN(ta) || Number.isNaN(tb)) return 0
          return ta - tb
        })
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
      fileUrl?: string
      imageUrl?: string
    }
  ) {
    try {
      const { data } = await chatApi.sendMessage({
        conversationId,
        content,
        type,
        replyToId: options?.replyToId,
        fileName: options?.fileName,
        fileSize: options?.fileSize,
        fileUrl: options?.fileUrl,
        imageUrl: options?.imageUrl,
      })
      const msg = data.data
      const existingIdx = messages.value.findIndex(m => m.id === msg.id)
      if (existingIdx >= 0) {
        messages.value[existingIdx] = msg
      } else {
        messages.value.push(msg)
      }

      const conv = conversations.value.find(c => c.id === conversationId)
      if (conv) {
        conv.lastMessage =
          msg.content ||
          (msg.type === 'image' ? '[Hình ảnh]' : msg.type === 'file' ? `[Tệp] ${msg.fileName || ''}` : '')
        conv.lastMessageTime = msg.createdAt || new Date().toISOString()
      }

      return msg
    } catch (err) {
      error.value = 'Gửi tin nhắn thất bại'
      throw err
    }
  }

  function updateMessageStatus(messageId: string, status: MessageStatus) {
    const msg = messages.value.find(m => m.id === messageId)
    if (msg) {
      msg.status = status
    }
  }

  async function markAsRead(conversationId: string) {
    try {
      await chatApi.markAsRead(conversationId)
      const conv = conversations.value.find(c => c.id === conversationId)
      if (conv) conv.unreadCount = 0
    } catch {
      // ignore read receipt error
    }
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

  async function blockUser(userIdOrConvId: string) {
    const conv = conversations.value.find(c => c.id === userIdOrConvId)
    const targetUserId = conv
      ? (conv.participants?.[0]?.id || userIdOrConvId)
      : userIdOrConvId
    await chatApi.blockUser(targetUserId)
  }

  async function unblockUser(userIdOrConvId: string) {
    const conv = conversations.value.find(c => c.id === userIdOrConvId)
    const targetUserId = conv
      ? (conv.participants?.[0]?.id || userIdOrConvId)
      : userIdOrConvId
    await chatApi.unblockUser(targetUserId)
  }

  async function searchMessages(conversationId: string, query: string) {
    const { data } = await chatApi.searchMessages(conversationId, query)
    return data.data
  }

  async function addReaction(messageId: string, emoji: string, user: { id: string, name: string }) {
    const msg = messages.value.find(m => m.id === messageId)
    if (msg) {
      if (!msg.reactions) msg.reactions = []
      const existingIdx = msg.reactions.findIndex(r => r.userId === user.id)
      if (existingIdx >= 0) {
        if (msg.reactions[existingIdx].emoji === emoji) {
          msg.reactions.splice(existingIdx, 1)
        } else {
          msg.reactions[existingIdx].emoji = emoji
        }
      } else {
        msg.reactions.push({ emoji, userId: user.id, userName: user.name })
      }
    }
  }

  async function deleteMessage(messageId: string) {
    messages.value = messages.value.filter(m => m.id !== messageId)
  }

  async function revokeMessage(messageId: string, conversationId?: string) {
    const msg = messages.value.find(m => m.id === messageId)
    const targetConvId = conversationId || (msg as any)?.conversationId || activeConversationId.value
    if (!msg || !msg.isOwn || !targetConvId) return

    const { data } = await chatApi.revokeMessage(targetConvId, messageId)
    const updated = data?.data
    msg.status = 'revoked'
    msg.isRevoked = true
    msg.content = updated?.content ?? ''
    msg.type = 'text'
    msg.imageUrl = undefined
    msg.fileUrl = undefined
    msg.fileName = undefined
    msg.fileSize = undefined
  }

  async function pinMessage(messageId: string, conversationId?: string) {
    const msg = messages.value.find(m => m.id === messageId)
    const targetConvId = conversationId || (msg as any)?.conversationId || activeConversationId.value
    if (!msg || !targetConvId) return

    const nextPinned = !msg.isPinned
    const { data } = await chatApi.pinMessage(targetConvId, messageId, nextPinned)
    msg.isPinned = data?.data?.isPinned ?? nextPinned
  }

  return {
    conversations,
    messages,
    activeConversationId,
    isLoading,
    error,
    isTyping,
    typingUser,
    isWsConnected,
    connectWs,
    disconnectWs,
    fetchConversations,
    fetchMessages,
    sendMessage,
    markAsRead,
    pinConversation,
    muteConversation,
    deleteConversation,
    blockUser,
    unblockUser,
    searchMessages,
    addReaction,
    deleteMessage,
    revokeMessage,
    pinMessage,
    updateMessageStatus,
  }
}
