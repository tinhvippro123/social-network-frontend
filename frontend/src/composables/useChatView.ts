import { ref, watch, watchEffect, onMounted, nextTick } from 'vue'

import { useAuth } from './useAuth'
import { useChat } from './useChat'
import { useChatLogic } from './useChatLogic'
import type { ChatMessage } from '@/types'

export function useChatView() {
  const { user: currentUser } = useAuth()
  
  const {
    conversations, messages, isLoading, isTyping, typingUser,
    fetchConversations, fetchMessages, sendMessage: apiSendMessage,
    markAsRead, pinConversation, muteConversation, deleteConversation,
    blockUser, searchMessages, simulateTyping,
    addReaction, deleteMessage, revokeMessage, pinMessage
  } = useChat()

  const selectedConversation = ref<any>(null)
  const newMessage = ref('')
  const isInitialLoading = ref(true)
  const showMobileChat = ref(false)

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
  const replyingTo = ref<ChatMessage | null>(null)
  const activeActionMenu = ref<string | null>(null)
  const showCallDialog = ref(false)
  const callType = ref<'audio' | 'video'>('audio')

  const chatContainer = ref<HTMLElement | null>(null)
  const showScrollBottom = ref(false)
  const searchChat = ref('')
  const imagePreview = ref<string | null>(null)

  const {
    searchChat: searchChatLogic,
    sharedMedia,
    sharedFiles,
    groupedSharedMedia,
    groupedSharedFiles,
    pinnedMessage,
    filteredConversations,
    lastOwnMessage,
    emojiList,
    formatMessageTime
  } = useChatLogic(messages, conversations)

  watchEffect(() => {
    searchChatLogic.value = searchChat.value
  })

  const scrollToBottom = () => {
    if (chatContainer.value) {
      chatContainer.value.scrollTo({
        top: chatContainer.value.scrollHeight,
        behavior: 'smooth'
      })
      showScrollBottom.value = false
    }
  }

  onMounted(async () => {
    isInitialLoading.value = true
    await fetchConversations()
    if (conversations.value.length > 0) {
      selectedConversation.value = conversations.value[0]
      await fetchMessages(selectedConversation.value.id)
    }
    isInitialLoading.value = false
    await nextTick()
    scrollToBottom()
  })

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
    showEmojiPicker.value = false
    showSearchInChat.value = false
    replyingTo.value = null
    messages.value = []
    await fetchMessages(conv.id)
    await markAsRead(conv.id)
    await nextTick()
    scrollToBottom()
    setTimeout(() => simulateTyping(conv.name), 2000)
  }

  const handleSendMessage = async () => {
    if (!newMessage.value.trim() || !selectedConversation.value) return
    const content = newMessage.value
    const replyId = replyingTo.value?.id

    newMessage.value = ''
    replyingTo.value = null
    showEmojiPicker.value = false

    await apiSendMessage(selectedConversation.value.id, content, 'text', {
      replyToId: replyId
    })
    await nextTick()
    scrollToBottom()
  }

  const handleSendImage = async (event: Event) => {
    const target = event.target as HTMLInputElement
    const file = target.files?.[0]
    if (!file || !selectedConversation.value) return

    const url = URL.createObjectURL(file)
    await apiSendMessage(selectedConversation.value.id, '', 'image', {
      imageUrl: url
    })
    await nextTick()
    scrollToBottom()
    target.value = ''
  }

  const handleSendFile = async (event: Event) => {
    const target = event.target as HTMLInputElement
    const file = target.files?.[0]
    if (!file || !selectedConversation.value) return

    const size = file.size < 1024 * 1024
      ? `${(file.size / 1024).toFixed(1)} KB`
      : `${(file.size / (1024 * 1024)).toFixed(1)} MB`

    await apiSendMessage(selectedConversation.value.id, '', 'file', {
      fileName: file.name,
      fileSize: size
    })
    await nextTick()
    scrollToBottom()
    target.value = ''
  }

  const handleScroll = () => {
    if (!chatContainer.value) return
    const { scrollTop, scrollHeight, clientHeight } = chatContainer.value
    showScrollBottom.value = scrollHeight - scrollTop - clientHeight > 100
  }

  const handlePerformSearch = async () => {
    if (!searchQuery.value.trim() || !selectedConversation.value) return
    const results = await searchMessages(selectedConversation.value.id, searchQuery.value)
    searchResults.value = results
  }

  const toggleActionMenu = (messageId: string) => {
    if (activeActionMenu.value === messageId) {
      activeActionMenu.value = null
    } else {
      activeActionMenu.value = messageId
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
    await revokeMessage(messageId)
    activeActionMenu.value = null
  }

  const handlePinMessage = async (messageId: string) => {
    await pinMessage(messageId)
    activeActionMenu.value = null
  }

  const closeSearch = () => {
    showSearchInChat.value = false
    searchQuery.value = ''
    searchResults.value = []
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

  const startCall = (type: 'audio' | 'video') => {
    callType.value = type
    showCallDialog.value = true
  }

  const endCall = () => {
    showCallDialog.value = false
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
    return msg.isOwn && msg.status === 'read' && msg.id === lastOwnMessage.value?.id
  }

  return {
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
    replyingTo,
    activeActionMenu,
    showCallDialog,
    callType,
    chatContainer,
    showScrollBottom,
    searchChat,
    imagePreview,
    sharedMedia,
    sharedFiles,
    groupedSharedMedia,
    groupedSharedFiles,
    pinnedMessage,
    filteredConversations,
    lastOwnMessage,
    emojiList,
    formatMessageTime,
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
    startCall,
    endCall,
    viewImage,
    closeImagePreview,
    downloadFile,
    pinConversation,
    muteConversation,
    deleteConversation,
    blockUser,
    insertEmoji,
    setReplyTo,
    closeMenus,
    getMessageStatusLabel,
    isLastOwnWithReadStatus
  }
}
