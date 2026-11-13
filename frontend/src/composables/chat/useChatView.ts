import { ref, watch, watchEffect, onMounted, onUnmounted, nextTick } from 'vue'
import { useConfirm } from '../ui/useConfirm'
import { useRoute, useRouter } from 'vue-router'

import { useAuth } from '../auth/useAuth'
import { useChat } from './useChat'
import { useChatLogic } from './useChatLogic'
import { useChatNicknames } from './useChatNicknames'
import { useToast } from '../ui/useToast'
import type { ChatMessage } from '@/types'
import chatApi from '@/api/chat.api'
import filesApi from '@/api/files.api'

export function useChatView() {
  const route = useRoute()
  const router = useRouter()
  const toast = useToast()
  const { confirm } = useConfirm()
  const { user: currentUser } = useAuth()
  const { applyNicknameToConversation } = useChatNicknames()
  const newChatInitialMode = ref<'direct' | 'group'>('direct')
  const newChatPreselectedUserId = ref<string | null>(null)

  const selectedConversation = ref<any>(null)
  const newMessage = ref('')
  const isInitialLoading = ref(true)
  const showMobileChat = ref(false)
  const chatContainer = ref<HTMLElement | null>(null)
  const showScrollBottom = ref(false)

  const scrollToBottom = (smooth: boolean | Event = true) => {
    if (chatContainer.value) {
      const isSmooth = typeof smooth === 'boolean' ? smooth : true
      const distance = chatContainer.value.scrollHeight - chatContainer.value.scrollTop
      chatContainer.value.scrollTo({
        top: chatContainer.value.scrollHeight,
        behavior: (isSmooth && distance < 1000) ? 'smooth' : 'auto'
      })
      showScrollBottom.value = false
    }
  }

  const {
    conversations, messages, isLoading, isTyping, typingUser,
    fetchConversations, fetchMessages, sendMessage: apiSendMessage,
    markAsRead, pinConversation, muteConversation, deleteConversation,
    blockUser, unblockUser, searchMessages,
    addReaction, deleteMessage, revokeMessage, pinMessage
  } = useChat(async (incoming, convId) => {
    if (selectedConversation.value?.id === convId) {
      await nextTick()
      scrollToBottom()
      if (!incoming.isOwn) {
        markAsRead(convId)
      }
    }
  })

  if (typeof window !== 'undefined') {
    const onNicknameChanged = (e: any) => {
      const detail = e.detail
      if (!detail || !selectedConversation.value || selectedConversation.value.isGroup) return
      if (
        selectedConversation.value.id === detail.convId ||
        selectedConversation.value.participants?.some((p: any) => p.id === detail.otherId)
      ) {
        if (detail.nickname) {
          selectedConversation.value.nickname = detail.nickname
        } else {
          delete selectedConversation.value.nickname
        }
        selectedConversation.value.name = detail.name
        if (detail.originalName) selectedConversation.value.originalName = detail.originalName
      }
    }
    window.addEventListener('chat-nickname-changed', onNicknameChanged)
    onUnmounted(() => {
      window.removeEventListener('chat-nickname-changed', onNicknameChanged)
    })
  }

  // UI states
  const showInfoPanel = ref(false)
  const showEmojiPicker = ref(false)
  const showSearchInChat = ref(false)
  const showMediaSection = ref(true)
  const showFileSection = ref(true)
  const rightSidebarView = ref<'info' | 'media_files'>('info')
  const activeMediaTab = ref<'media' | 'files' | 'links'>('media')

  const openMediaView = (tab: 'media' | 'files' | 'links') => {
    activeMediaTab.value = tab
    rightSidebarView.value = 'media_files'
  }

  const showMembersSection = ref(true)
  const searchQuery = ref('')
  const searchResults = ref<ChatMessage[]>([])
  const currentSearchIndex = ref(0)
  const replyingTo = ref<ChatMessage | null>(null)
  const activeActionMenu = ref<string | null>(null)

  const searchChat = ref('')
  const imagePreview = ref<string | null>(null)
  const highlightedMessageId = ref<string | null>(null)
  let highlightTimer: ReturnType<typeof setTimeout> | null = null

  const scrollToMessage = (messageId?: string) => {
    if (!messageId) return
    const el = document.getElementById(`chat-message-${messageId}`)
    if (!el) return
    el.scrollIntoView({ behavior: 'smooth', block: 'center' })
    highlightedMessageId.value = messageId
    if (highlightTimer) clearTimeout(highlightTimer)
    highlightTimer = setTimeout(() => {
      if (highlightedMessageId.value === messageId) {
        highlightedMessageId.value = null
      }
    }, 2200)
  }

  const {
    searchChat: searchChatLogic,
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
  } = useChatLogic(messages, conversations)

  watchEffect(() => {
    searchChatLogic.value = searchChat.value
  })

  onMounted(async () => {
    isInitialLoading.value = true
    await fetchConversations()
    const rawId = route.query.id ? String(route.query.id) : null
    const targetUserId = route.query.userId
      ? String(route.query.userId)
      : rawId && rawId.startsWith('new-')
        ? rawId.replace(/^new-/, '')
        : null

    if (targetUserId) {
      const existingDirect = conversations.value.find(
        c => !c.isGroup && c.participants?.some((p: any) => p.id === targetUserId)
      )
      if (existingDirect) {
        selectedConversation.value = existingDirect
        showMobileChat.value = true
        await fetchMessages(existingDirect.id)
        markAsRead(existingDirect.id)
      } else {
        await createNewConversation([targetUserId])
        if (!selectedConversation.value && conversations.value.length > 0) {
          selectedConversation.value = conversations.value[0]
          await fetchMessages(selectedConversation.value.id)
          markAsRead(selectedConversation.value.id)
        }
      }
    } else if (rawId) {
      const match = conversations.value.find(c => c.id === rawId)
      if (match) {
        selectedConversation.value = match
        showMobileChat.value = true
        await fetchMessages(match.id)
        markAsRead(match.id)
      } else if (conversations.value.length > 0) {
        selectedConversation.value = conversations.value[0]
        await fetchMessages(selectedConversation.value.id)
        markAsRead(selectedConversation.value.id)
      }
    } else if (conversations.value.length > 0) {
      selectedConversation.value = conversations.value[0]
      await fetchMessages(selectedConversation.value.id)
      markAsRead(selectedConversation.value.id)
    }

    if (route.query.createGroup === 'true') {
      newChatInitialMode.value = 'group'
      newChatPreselectedUserId.value = (route.query.memberId as string) || null
      showNewChatModal.value = true
      const nextQuery = { ...route.query }
      delete nextQuery.createGroup
      delete nextQuery.memberId
      router.replace({ path: '/chat', query: nextQuery })
    }

    isInitialLoading.value = false
    await nextTick()
    scrollToBottom(false)
  })

  watch(
    () => [route.query.id, route.query.userId, route.query.createGroup, route.query.memberId],
    async ([newId, newUserId, newCreateGroup, newMemberId]) => {
      if (isInitialLoading.value) return
      if (newCreateGroup === 'true') {
        newChatInitialMode.value = 'group'
        newChatPreselectedUserId.value = (newMemberId as string) || null
        showNewChatModal.value = true
        const nextQuery = { ...route.query }
        delete nextQuery.createGroup
        delete nextQuery.memberId
        router.replace({ path: '/chat', query: nextQuery })
      }

      const rawId = newId ? String(newId) : null
      const targetUserId = newUserId
        ? String(newUserId)
        : rawId && rawId.startsWith('new-')
          ? rawId.replace(/^new-/, '')
          : null

      if (targetUserId) {
        const existingDirect = conversations.value.find(
          c => !c.isGroup && c.participants?.some((p: any) => p.id === targetUserId)
        )
        if (existingDirect && selectedConversation.value?.id !== existingDirect.id) {
          await selectConversation(existingDirect)
        } else if (!existingDirect) {
          await createNewConversation([targetUserId])
        }
      } else if (rawId && selectedConversation.value?.id !== rawId) {
        let match = conversations.value.find(c => c.id === rawId)
        if (!match) {
          await fetchConversations()
          match = conversations.value.find(c => c.id === rawId)
        }
        if (match) {
          await selectConversation(match)
        }
      }
    }
  )

  watch(isTyping, async (val) => {
    if (val && !showScrollBottom.value) {
      await nextTick()
      scrollToBottom()
    }
  })

  const selectConversation = async (conv: any) => {
    selectedConversation.value = conv
    showMobileChat.value = true
    showInfoPanel.value = false
    rightSidebarView.value = 'info'
    showEmojiPicker.value = false
    showSearchInChat.value = false
    replyingTo.value = null
    highlightedMessageId.value = null
    messages.value = []
    await fetchMessages(conv.id)
    await nextTick()
    scrollToBottom(false)
    markAsRead(conv.id)
  }

  const handleSendMessage = async () => {
    if (!newMessage.value.trim() || !selectedConversation.value) return
    const content = newMessage.value
    const replyTarget = replyingTo.value
    const replyId = replyTarget?.id

    newMessage.value = ''
    replyingTo.value = null
    highlightedMessageId.value = null
    showEmojiPicker.value = false

    try {
      await apiSendMessage(selectedConversation.value.id, content, 'text', {
        replyToId: replyId
      })
      await nextTick()
      scrollToBottom()
    } catch (err: any) {
      newMessage.value = content
      replyingTo.value = replyTarget
      toast.error(err?.response?.data?.message || 'Gửi tin nhắn thất bại')
    }
  }

  const handleSendImage = async (event: Event) => {
    const target = event.target as HTMLInputElement
    const file = target.files?.[0]
    if (!file || !selectedConversation.value) return
    const replyId = replyingTo.value?.id

    try {
      const uploadRes = await filesApi.uploadFile(file)
      const imageUrl = uploadRes.data?.data?.fileUrl
      if (!imageUrl) throw new Error('Không nhận được đường dẫn ảnh')

      replyingTo.value = null
      await apiSendMessage(selectedConversation.value.id, '[Hình ảnh]', 'image', {
        imageUrl,
        replyToId: replyId
      })
      await nextTick()
      scrollToBottom()
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Gửi hình ảnh thất bại')
    } finally {
      target.value = ''
    }
  }

  const handleSendFile = async (event: Event) => {
    const target = event.target as HTMLInputElement
    const file = target.files?.[0]
    if (!file || !selectedConversation.value) return
    const replyId = replyingTo.value?.id

    const size = file.size < 1024 * 1024
      ? `${(file.size / 1024).toFixed(1)} KB`
      : `${(file.size / (1024 * 1024)).toFixed(1)} MB`

    try {
      const uploadRes = await filesApi.uploadFile(file)
      const fileUrl = uploadRes.data?.data?.fileUrl
      if (!fileUrl) throw new Error('Không nhận được đường dẫn tệp')

      replyingTo.value = null
      await apiSendMessage(selectedConversation.value.id, file.name, 'file', {
        fileName: file.name,
        fileSize: size,
        fileUrl,
        replyToId: replyId
      })
      await nextTick()
      scrollToBottom()
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Gửi tệp đính kèm thất bại')
    } finally {
      target.value = ''
    }
  }

  const handleScroll = () => {
    if (!chatContainer.value) return
    if (activeActionMenu.value) {
      activeActionMenu.value = null
    }
    const { scrollTop, scrollHeight, clientHeight } = chatContainer.value
    showScrollBottom.value = scrollHeight - scrollTop - clientHeight > 100
  }

  const handlePerformSearch = async () => {
    if (!searchQuery.value.trim() || !selectedConversation.value) {
      searchResults.value = []
      currentSearchIndex.value = 0
      return
    }
    const results = await searchMessages(selectedConversation.value.id, searchQuery.value)
    searchResults.value = results
    currentSearchIndex.value = 0
    if (results.length > 0 && results[0]?.id) {
      scrollToMessage(results[0].id)
    }
  }

  const nextSearchResult = () => {
    if (!searchResults.value.length) return
    currentSearchIndex.value = (currentSearchIndex.value + 1) % searchResults.value.length
    const target = searchResults.value[currentSearchIndex.value]
    if (target?.id) scrollToMessage(target.id)
  }

  const prevSearchResult = () => {
    if (!searchResults.value.length) return
    currentSearchIndex.value = (currentSearchIndex.value - 1 + searchResults.value.length) % searchResults.value.length
    const target = searchResults.value[currentSearchIndex.value]
    if (target?.id) scrollToMessage(target.id)
  }

  const toggleActionMenu = (messageId: string | null) => {
    const normalized = !messageId || messageId === 'null' ? null : messageId
    if (activeActionMenu.value === normalized) {
      activeActionMenu.value = null
    } else {
      activeActionMenu.value = normalized
    }
  }

  const handleAddReaction = async (messageId: string, emoji: string, user?: { id: string, name: string }) => {
    const userObj = user || { id: currentUser.value?.id || 'u1', name: currentUser.value?.name || 'User' }
    await addReaction(messageId, emoji, userObj)
    activeActionMenu.value = null
  }

  const handleDeleteMessage = async (messageId: string) => {
    await deleteMessage(messageId)
    activeActionMenu.value = null
  }

  const handleRevokeMessage = async (messageId: string) => {
    try {
      await revokeMessage(messageId, selectedConversation.value?.id)
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Không thể thu hồi tin nhắn')
    } finally {
      activeActionMenu.value = null
    }
  }

  const handlePinMessage = async (messageId: string) => {
    try {
      await pinMessage(messageId, selectedConversation.value?.id)
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Không thể ghim/bỏ ghim tin nhắn')
    } finally {
      activeActionMenu.value = null
    }
  }

  const closeSearch = () => {
    showSearchInChat.value = false
    searchQuery.value = ''
    searchResults.value = []
    currentSearchIndex.value = 0
  }

  const backToConversations = () => {
    showMobileChat.value = false
  }

  const toggleInfoPanel = () => {
    if (!showInfoPanel.value) {
      showInfoPanel.value = true
      rightSidebarView.value = 'info'
    } else if (rightSidebarView.value === 'media_files') {
      rightSidebarView.value = 'info'
    } else {
      showInfoPanel.value = false
    }
  }

  const viewImage = (url: string) => {
    imagePreview.value = url
  }

  const closeImagePreview = () => {
    imagePreview.value = null
  }

  const downloadFile = (url: string | undefined, fileName: string | undefined) => {
    if (!url || !fileName) return
    const a = document.createElement('a')
    a.href = url
    a.download = fileName
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  const insertEmoji = (emoji: string) => {
    newMessage.value += emoji
  }

  const setReplyTo = (msg: ChatMessage) => {
    replyingTo.value = msg
  }

  const closeMenus = () => {
    showEmojiPicker.value = false
    activeActionMenu.value = null
  }

  const getMessageStatusLabel = (msg: ChatMessage) => {
    if (!msg.isOwn) return ''
    switch (msg.status) {
      case 'sending': return 'Đang gửi...'
      case 'sent': return 'Đã gửi'
      case 'delivered': return 'Đã nhận'
      case 'read': return ''
      default: return ''
    }
  }

  const isLastOwnWithReadStatus = (msg: ChatMessage) => {
    if (!msg.isOwn || msg.status !== 'read') return false

    const ownReadMessages = messages.value.filter(m => m.isOwn && m.status === 'read')
    if (ownReadMessages.length === 0) return false
    const lastOwnReadMsg = ownReadMessages[ownReadMessages.length - 1]

    if (msg.id !== lastOwnReadMsg.id) return false

    const msgIndex = messages.value.findIndex(m => m.id === msg.id)
    const hasOtherMessageAfter = messages.value.slice(msgIndex + 1).some(m => !m.isOwn)

    return !hasOtherMessageAfter
  }

  const showNewChatModal = ref(false)

  const handleDeleteConversation = async (conversationId: string) => {
    const ok = await confirm({
      title: 'Xóa cuộc trò chuyện',
      message: 'Bạn có chắc chắn muốn xóa cuộc trò chuyện này khỏi danh sách?',
      confirmText: 'Xóa',
      variant: 'danger'
    })
    if (!ok) return
    try {
      await deleteConversation(conversationId)
      window.dispatchEvent(new CustomEvent('chat-conversation-removed', { detail: { id: conversationId } }))
      if (selectedConversation.value?.id === conversationId) {
        selectedConversation.value = conversations.value[0] || null
        showInfoPanel.value = false
        showMobileChat.value = false
        if (selectedConversation.value) {
          await fetchMessages(selectedConversation.value.id)
        } else {
          messages.value = []
        }
      }
    } catch {
      // Error toast is already handled inside deleteConversation
    }
  }

  const handleBlockUser = async (userIdOrConvId: string): Promise<boolean> => {
    const ok = await confirm({
      title: 'Chặn người dùng',
      message: 'Bạn có chắc chắn muốn chặn người dùng này? Họ sẽ không thể gửi tin nhắn cho bạn.',
      confirmText: 'Chặn',
      variant: 'danger'
    })
    if (!ok) return false
    return await blockUser(userIdOrConvId)
  }

  const createNewConversation = async (participantIds: string[], name?: string, isGroup?: boolean) => {
    try {
      const { data } = await chatApi.createConversation({ participantIds, name, isGroup })
      const newConv = applyNicknameToConversation(data.data)
      if (!conversations.value.find(c => c.id === newConv.id)) {
        conversations.value.unshift(newConv)
      }
      await selectConversation(newConv)
      showNewChatModal.value = false
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Không thể tạo cuộc trò chuyện')
    }
  }

  return {
    router,
    currentUser,
    conversations,
    messages,
    isLoading,
    isTyping,
    typingUser,
    selectedConversation,
    newMessage,
    isInitialLoading,
    showMobileChat,
    showInfoPanel,
    showEmojiPicker,
    showSearchInChat,
    showMediaSection,
    showFileSection,
    rightSidebarView,
    activeMediaTab,
    showMembersSection,
    searchQuery,
    searchResults,
    currentSearchIndex,
    nextSearchResult,
    prevSearchResult,
    replyingTo,
    activeActionMenu,
    chatContainer,
    showScrollBottom,
    searchChat,
    imagePreview,
    highlightedMessageId,
    scrollToMessage,
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
    isSameDay,
    openMediaView,
    scrollToBottom,
    selectConversation,
    handleSendMessage,
    handleSendImage,
    handleSendFile,
    handleScroll,
    handlePerformSearch,
    toggleActionMenu,
    handleAddReaction,
    handleDeleteMessage,
    handleRevokeMessage,
    handlePinMessage,
    closeSearch,
    backToConversations,
    toggleInfoPanel,
    viewImage,
    closeImagePreview,
    downloadFile,
    pinConversation,
    muteConversation,
    deleteConversation: handleDeleteConversation,
    blockUser: handleBlockUser,
    unblockUser,
    insertEmoji,
    setReplyTo,
    closeMenus,
    getMessageStatusLabel,
    isLastOwnWithReadStatus,
    showNewChatModal,
    newChatInitialMode,
    newChatPreselectedUserId,
    createNewConversation
  }
}
