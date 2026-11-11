import { matchesQuery } from '@/utils/textSearch'
import { ref, computed, type Ref } from 'vue'
import type { ChatMessage, ChatConversation } from '@/types'

export interface SharedLinkItem {
  id: string
  url: string
  title: string
  createdAt: string
}

export function useChatLogic(messages: Ref<ChatMessage[]>, conversations: Ref<ChatConversation[]>) {
  const searchChat = ref('')

  const sharedMedia = computed(() =>
    messages.value.filter(m => !m.isRevoked && m.status !== 'revoked' && m.type === 'image' && m.imageUrl)
  )
  const sharedFiles = computed(() =>
    messages.value.filter(m => !m.isRevoked && m.status !== 'revoked' && m.type === 'file' && m.fileName)
  )
  const sharedLinks = computed<SharedLinkItem[]>(() => {
    const urlRegex = /https?:\/\/[^\s<>")]+/gi
    const items: SharedLinkItem[] = []
    messages.value.forEach(m => {
      if (m.isRevoked || !m.content) return
      const matches = m.content.match(urlRegex)
      if (matches) {
        matches.forEach((url, idx) => {
          items.push({
            id: `${m.id}-link-${idx}`,
            url,
            title: url.replace(/^https?:\/\/(www\.)?/, ''),
            createdAt: m.createdAt
          })
        })
      }
    })
    return items
  })

  const groupItemsByDate = <T extends { createdAt: string }>(items: T[]) => {
    const groups: Record<string, T[]> = {}
    items.forEach(item => {
      let bucket = 'Mới nhất'
      if (item.createdAt && item.createdAt.includes('-')) {
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
  const groupedSharedLinks = computed(() => groupItemsByDate(sharedLinks.value))

  const pinnedMessage = computed(() =>
    [...messages.value].reverse().find(m => m.isPinned)
  )

  const filteredConversations = computed(() => {
    let list = conversations.value
    if (searchChat.value) {
      list = list.filter(c => matchesQuery(searchChat.value, c.name, c.originalName))
    }
    return [...list].sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1
      if (!a.isPinned && b.isPinned) return 1
      const ta = new Date(a.lastMessageTime || 0).getTime() || 0
      const tb = new Date(b.lastMessageTime || 0).getTime() || 0
      return tb - ta
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

  const toDate = (timeStr?: string) => {
    if (!timeStr || !timeStr.includes('-')) return null
    const d = new Date(timeStr)
    return isNaN(d.getTime()) ? null : d
  }

  const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime()
  const daysAgo = (d: Date) => Math.round((startOfDay(new Date()) - startOfDay(d)) / 86_400_000)
  const WEEKDAYS = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7']

  /** Giờ:phút — dùng trong bong bóng tin nhắn */
  const formatClockTime = (timeStr: string) => {
    const d = toDate(timeStr)
    if (!d) return timeStr
    return d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
  }

  /** Nhãn vạch phân cách ngày: Hôm nay / Hôm qua / Thứ 3, 21/10/2026 */
  const formatDayLabel = (timeStr: string) => {
    const d = toDate(timeStr)
    if (!d) return 'Hôm nay'
    const diff = daysAgo(d)
    if (diff === 0) return 'Hôm nay'
    if (diff === 1) return 'Hôm qua'
    return `${WEEKDAYS[d.getDay()]}, ${d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })}`
  }

  const isSameDay = (a?: string, b?: string) => {
    const da = toDate(a)
    const db = toDate(b)
    if (!da && !db) return true
    if (!da || !db) return a === b
    return startOfDay(da) === startOfDay(db)
  }

  /**
   * Thời gian rút gọn kiểu Messenger — dùng cho danh sách hội thoại, file:
   * hôm nay → 14:05 · hôm qua → Hôm qua · trong tuần → Thứ 3 · cũ hơn → 21/10/2026
   */
  const formatMessageTime = (timeStr: string) => {
    const d = toDate(timeStr)
    if (!d) return timeStr
    const diff = daysAgo(d)
    if (diff === 0) return formatClockTime(timeStr)
    if (diff === 1) return 'Hôm qua'
    if (diff < 7) return WEEKDAYS[d.getDay()] ?? ''
    return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
  }

  return {
    searchChat,
    sharedMedia,
    sharedFiles,
    sharedLinks,
    groupedSharedMedia,
    groupedSharedFiles,
    groupedSharedLinks,
    pinnedMessage,
    filteredConversations,
    lastOwnMessage,
    emojiList,
    formatMessageTime,
    formatClockTime,
    formatDayLabel,
    isSameDay
  }
}
