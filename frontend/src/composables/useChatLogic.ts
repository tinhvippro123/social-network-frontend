import { ref, computed, type Ref } from 'vue'
import type { ChatMessage, ChatConversation } from '@/types'

export function useChatLogic(messages: Ref<ChatMessage[]>, conversations: Ref<ChatConversation[]>) {
  const searchChat = ref('')

  const sharedMedia = computed(() =>
    messages.value.filter(m => m.type === 'image' && m.imageUrl)
  )
  const sharedFiles = computed(() =>
    messages.value.filter(m => m.type === 'file' && m.fileName)
  )

  const groupItemsByDate = (items: ChatMessage[]) => {
    const groups: Record<string, ChatMessage[]> = {}
    items.forEach(item => {
      let bucket = 'Mới nhất'
      if (item.createdAt.includes('-')) {
        const d = new Date(item.createdAt)
        if (!isNaN(d.getTime())) {
          const month = d.getMonth() + 1
          const year = d.getFullYear()
          bucket = `Tháng ${month}, ${year}`
        }
      }
      if (!groups[bucket]) groups[bucket] = []
      groups[bucket].push(item)
    })
    return Object.entries(groups).map(([date, items]) => ({ date, items }))
  }

  const groupedSharedMedia = computed(() => groupItemsByDate(sharedMedia.value))
  const groupedSharedFiles = computed(() => groupItemsByDate(sharedFiles.value))

  const pinnedMessage = computed(() =>
    messages.value.find(m => m.isPinned)
  )

  const filteredConversations = computed(() => {
    let list = conversations.value
    if (searchChat.value) {
      list = list.filter(c =>
        c.name.toLowerCase().includes(searchChat.value.toLowerCase())
      )
    }
    return [...list].sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1
      if (!a.isPinned && b.isPinned) return 1
      return 0
    })
  })

  const lastOwnMessage = computed(() => {
    const ownMessages = messages.value.filter(m => m.isOwn)
    return ownMessages.length > 0 ? ownMessages[ownMessages.length - 1] : null
  })

  const emojiList = [
    '😀', '😂', '🥰', '😍', '😊', '😎', '🤔', '😅',
    '👍', '👎', '❤️', '🔥', '🎉', '💯', '🙏', '😢',
    '😡', '🤣', '😏', '🥺', '😴', '🤗', '🤮', '💀',
    '👀', '🫡', '✅', '⭐', '🚀', '💪', '🤝', '👏'
  ]

  const formatMessageTime = (timeStr: string) => {
    if (!timeStr.includes('-')) return timeStr
    const date = new Date(timeStr)
    if (isNaN(date.getTime())) return timeStr
    return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
  }

  return {
    searchChat,
    sharedMedia,
    sharedFiles,
    groupedSharedMedia,
    groupedSharedFiles,
    pinnedMessage,
    filteredConversations,
    lastOwnMessage,
    emojiList,
    formatMessageTime
  }
}
