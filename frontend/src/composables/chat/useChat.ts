import { ref, onUnmounted } from 'vue'
import chatApi from '@/api/chat.api'
import type { ChatConversation, ChatMessage, MessageStatus } from '@/types'
import { useAsyncState } from '../core/useAsyncState'
import { useChatNicknames } from './useChatNicknames'
import { useWebSocket } from '../core/useWebSocket'
import { useAuthStore } from '@/stores/auth.store'
import { useToast } from '../ui/useToast'

export function useChat(onRealtimeMessage?: (msg: ChatMessage, conversationId: string) => void) {
  const { applyNicknamesToConversations } = useChatNicknames()
  const authStore = useAuthStore()
  const toast = useToast()
  const conversations = ref<ChatConversation[]>([])
  const messages = ref<ChatMessage[]>([])
  const activeConversationId = ref<string | null>(null)
  const isTyping = ref(false)
  const typingUser = ref('')
  const { isLoading, error, execute } = useAsyncState()

  function handleWsEvent(event: any) {
    if (!event || typeof event !== 'object' || !event.type) return

    const convId: string | undefined = event.conversationId
    const payload = event.data ?? event.payload

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
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('chat-conversations-sync'))
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
      if (event.type === 'message.revoked' && convId) {
        const conv = conversations.value.find(c => c.id === convId)
        if (conv && (idx === -1 || idx === messages.value.length - 1)) {
          conv.lastMessage = 'Tin nhắn đã bị thu hồi'
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
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('chat-conversations-sync'))
      }
      return
    }

    if (event.type === 'conversation.nickname' && convId && payload) {
      if (payload.targetUserId && String(payload.targetUserId) === String(authStore.user?.id)) {
        return
      }
      const conv = conversations.value.find(c => c.id === convId && !c.isGroup)
      if (conv) {
        const other = conv.participants?.find(p => p.id && p.id !== authStore.user?.id)
        if (!(conv as any).originalName) {
          (conv as any).originalName = other?.name || conv.name
        }
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
    const onNicknameChanged = (e: any) => {
      const detail = e.detail
      if (!detail) return
      const target = conversations.value.find(
        c => !c.isGroup && (c.id === detail.convId || c.participants?.some(p => p.id === detail.otherId))
      )
      if (target) {
        if (detail.nickname) {
          target.nickname = detail.nickname
        } else {
          delete target.nickname
        }
        target.name = detail.name
        if (detail.originalName) target.originalName = detail.originalName
      }
    }
    window.addEventListener('chat-nickname-changed', onNicknameChanged)
    onUnmounted(() => {
      window.removeEventListener('chat-nickname-changed', onNicknameChanged)
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
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('chat-conversations-sync'))
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
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('chat-conversations-sync'))
      }
    } catch {
      // ignore read receipt error
    }
  }

  async function pinConversation(conversationId: string) {
    const conv = conversations.value.find(c => c.id === conversationId)
    if (conv) {
      const newState = !conv.isPinned
      try {
        await chatApi.pinConversation(conversationId, newState)
        conv.isPinned = newState
        toast.success(newState ? 'Đã ghim cuộc trò chuyện' : 'Đã bỏ ghim cuộc trò chuyện')
      } catch (err: any) {
        toast.error(err?.response?.data?.message || 'Không thể ghim cuộc trò chuyện')
      }
    }
  }

  async function muteConversation(conversationId: string) {
    const conv = conversations.value.find(c => c.id === conversationId)
    if (conv) {
      const newState = !conv.isMuted
      try {
        await chatApi.muteConversation(conversationId, newState)
        conv.isMuted = newState
        toast.info(newState ? 'Đã tắt thông báo cuộc trò chuyện' : 'Đã bật thông báo cuộc trò chuyện')
      } catch (err: any) {
        toast.error(err?.response?.data?.message || 'Không thể cập nhật cài đặt thông báo')
      }
    }
  }

  async function deleteConversation(conversationId: string) {
    try {
      await chatApi.deleteConversation(conversationId)
      conversations.value = conversations.value.filter(c => c.id !== conversationId)
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('chat-conversations-sync'))
      }
      toast.info('Đã xóa cuộc trò chuyện')
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Không thể xóa cuộc trò chuyện')
      throw err
    }
  }

  function resolveTargetUserId(userIdOrConvId: string): string | null {
    const conv = conversations.value.find(c => c.id === userIdOrConvId)
    if (!conv) return userIdOrConvId
    if (conv.isGroup) return null
    const myId = authStore.user?.id
    const other = conv.participants?.find(p => p.id && p.id !== myId)
    return other?.id || null
  }

  async function blockUser(userIdOrConvId: string): Promise<boolean> {
    const targetUserId = resolveTargetUserId(userIdOrConvId)
    if (!targetUserId) {
      toast.info('Không thể chặn cuộc trò chuyện nhóm')
      return false
    }
    try {
      await chatApi.blockUser(targetUserId)
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('chat-block-updated'))
      }
      toast.info('Đã chặn người dùng')
      return true
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Không thể chặn người dùng')
      return false
    }
  }

  async function unblockUser(userIdOrConvId: string): Promise<boolean> {
    const targetUserId = resolveTargetUserId(userIdOrConvId)
    if (!targetUserId) return false
    try {
      await chatApi.unblockUser(targetUserId)
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('chat-block-updated'))
      }
      toast.success('Đã bỏ chặn người dùng')
      return true
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Không thể bỏ chặn người dùng')
      return false
    }
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
    toast.info('Đã xóa tin nhắn khỏi phía bạn')
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
    const conv = conversations.value.find(c => c.id === targetConvId)
    if (conv && messages.value[messages.value.length - 1]?.id === messageId) {
      conv.lastMessage = 'Tin nhắn đã bị thu hồi'
    }
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('chat-conversations-sync'))
    }
    toast.info('Đã thu hồi tin nhắn')
  }

  async function pinMessage(messageId: string, conversationId?: string) {
    const msg = messages.value.find(m => m.id === messageId)
    const targetConvId = conversationId || (msg as any)?.conversationId || activeConversationId.value
    if (!msg || !targetConvId) return

    const nextPinned = !msg.isPinned
    const { data } = await chatApi.pinMessage(targetConvId, messageId, nextPinned)
    msg.isPinned = data?.data?.isPinned ?? nextPinned
    toast.success(msg.isPinned ? 'Đã ghim tin nhắn' : 'Đã bỏ ghim tin nhắn')
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
