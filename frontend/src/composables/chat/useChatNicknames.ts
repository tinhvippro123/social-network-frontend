import type { ChatConversation } from '@/types'
import { useAuthStore } from '@/stores/auth.store'
import chatApi from '@/api/chat.api'

const NICKNAMES_STORAGE_KEY = 'vietblog_chat_nicknames'

export interface SavedNickname {
  nickname: string
  originalName?: string
  updatedAt?: number
}

export type NicknameStorageMap = Record<string, SavedNickname>

function loadNicknames(): NicknameStorageMap {
  try {
    const raw = localStorage.getItem(NICKNAMES_STORAGE_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch (e) {
    console.warn('Failed to parse nicknames from localStorage', e)
    return {}
  }
}

function saveNicknames(map: NicknameStorageMap): void {
  try {
    localStorage.setItem(NICKNAMES_STORAGE_KEY, JSON.stringify(map))
  } catch (e) {
    console.error('Failed to save nicknames to localStorage', e)
  }
}

function getOtherParticipantId(conv: ChatConversation): string | undefined {
  if (!conv.participants || conv.participants.length === 0) return undefined
  const myId = useAuthStore().user?.id
  const other = conv.participants.find(p => p.id && p.id !== myId && !p.id.startsWith('curr'))
  return other?.id
}

function resolveRealName(conv: ChatConversation): string {
  if (conv.originalName && conv.originalName !== conv.nickname) return conv.originalName
  if (!conv.isGroup && Array.isArray(conv.participants)) {
    const myId = useAuthStore().user?.id
    const other = conv.participants.find(p => p.id && p.id !== myId && !p.id.startsWith('curr') && p.name && p.name !== conv.nickname)
    if (other?.name) return other.name
  }
  return conv.originalName || conv.name
}

export function useChatNicknames() {
  function getNickname(convId?: string, otherUserId?: string): SavedNickname | undefined {
    const map = loadNicknames()
    if (convId && map[convId]) return map[convId]
    if (otherUserId && map[otherUserId]) return map[otherUserId]
    return undefined
  }

  async function setNickname(conv: ChatConversation, newNick: string): Promise<void> {
    if (!conv || conv.isGroup) return
    const map = loadNicknames()
    const trimmed = newNick.trim()
    const otherId = getOtherParticipantId(conv)

    if (!conv.originalName || conv.originalName === conv.nickname) {
      conv.originalName = resolveRealName(conv)
    }

    if (trimmed) {
      conv.nickname = trimmed
      conv.name = trimmed

      const entry: SavedNickname = {
        nickname: trimmed,
        originalName: conv.originalName,
        updatedAt: Date.now()
      }

      if (conv.id) map[conv.id] = entry
      if (otherId) map[otherId] = entry
    } else {
      delete conv.nickname
      conv.name = conv.originalName || conv.name

      if (conv.id) delete map[conv.id]
      if (otherId) delete map[otherId]
    }

    saveNicknames(map)

    const isRealDbConversation = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(conv.id)
    if (isRealDbConversation) {
      try {
        await chatApi.updateNickname(conv.id, trimmed, otherId)
      } catch (err) {
        console.warn('Backend database not reachable or conversation not found, falling back to localStorage cache:', err)
      }
    }

    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('chat-nickname-changed', {
          detail: {
            convId: conv.id,
            otherId,
            nickname: conv.nickname,
            name: conv.name,
            originalName: conv.originalName
          }
        })
      )
    }
  }

  function applyNicknameToConversation(conv: ChatConversation): ChatConversation {
    if (!conv || conv.isGroup) return conv
    const otherId = getOtherParticipantId(conv)

    if (conv.nickname) {
      if (!conv.originalName || conv.originalName === conv.nickname) {
        conv.originalName = resolveRealName(conv)
      }
      conv.name = conv.nickname
      const map = loadNicknames()
      const entry: SavedNickname = {
        nickname: conv.nickname,
        originalName: conv.originalName,
        updatedAt: Date.now()
      }
      if (conv.id) map[conv.id] = entry
      if (otherId) map[otherId] = entry
      saveNicknames(map)
      return conv
    }

    const saved = getNickname(conv.id, otherId)
    if (saved && saved.nickname) {
      if (!conv.originalName || conv.originalName === saved.nickname) {
        conv.originalName = (saved.originalName && saved.originalName !== saved.nickname) ? saved.originalName : resolveRealName(conv)
      }
      conv.nickname = saved.nickname
      conv.name = saved.nickname
    }
    return conv
  }

  function applyNicknamesToConversations(convs: ChatConversation[]): ChatConversation[] {
    if (!Array.isArray(convs)) return []
    return convs.map(conv => applyNicknameToConversation(conv))
  }

  return {
    getNickname,
    setNickname,
    applyNicknameToConversation,
    applyNicknamesToConversations
  }
}
