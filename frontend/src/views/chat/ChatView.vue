<script setup lang="ts">
import { ref, computed, nextTick, onMounted, watch } from 'vue'
import {
  Send as SendIcon, Smile as SmileIcon, Paperclip as PaperclipIcon,
  Image as ImageIcon, Phone as PhoneIcon, Video as VideoIcon,
  Search as SearchIcon, Plus as PlusIcon,
  MessageCircle as MessageCircleIcon, ArrowDown as ArrowDownIcon,
  X as XIcon, Reply as ReplyIcon, Pin as PinIcon, BellOff as BellOffIcon,
  Bell as BellIcon, Trash2 as TrashIcon, Ban as BanIcon, User as UserIcon,
  FileText as FileTextIcon, Download as DownloadIcon, Loader2 as LoaderIcon,
  ChevronLeft as ChevronLeftIcon, Info as InfoIcon, Flag as FlagIcon,
  Users as UsersIcon, ChevronDown as ChevronDownIcon,
  MoreVertical as MoreVerticalIcon, Forward as ForwardIcon,
  CornerUpLeft as CornerUpLeftIcon
} from '@lucide/vue'
import { useChat } from '@/composables/useChat'
import { useAuth } from '@/composables/useAuth'
import UserAvatar from '@/components/UserAvatar.vue'
import Skeleton from '@/components/ui/Skeleton.vue'
import type { ChatMessage } from '@/types'
import { useRouter } from 'vue-router'

const { user: currentUser } = useAuth()

const router = useRouter()
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
const showAllMedia = ref(false)
const showAllFiles = ref(false)
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

// Computed: shared media & files
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

const formatMessageTime = (timeStr: string) => {
  if (!timeStr.includes('-')) return timeStr // already formatted like '10:35'
  const date = new Date(timeStr)
  if (isNaN(date.getTime())) return timeStr
  return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
}

const groupedSharedMedia = computed(() => groupItemsByDate(sharedMedia.value))
const groupedSharedFiles = computed(() => groupItemsByDate(sharedFiles.value))

const pinnedMessage = computed(() =>
  messages.value.find(m => m.isPinned)
)

// Emoji grid
const emojiList = [
  '😀', '😂', '🥰', '😍', '😊', '😎', '🤔', '😅',
  '👍', '👎', '❤️', '🔥', '🎉', '💯', '🙏', '😢',
  '😡', '🤣', '😏', '🥺', '😴', '🤗', '🤮', '💀',
  '👀', '🫡', '✅', '⭐', '🚀', '💪', '🤝', '👏'
]

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

const filteredConversations = computed(() => {
  let list = conversations.value
  if (searchChat.value) {
    list = list.filter(c =>
      c.name.toLowerCase().includes(searchChat.value.toLowerCase())
    )
  }
  // Ghim lên đầu
  return [...list].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1
    if (!a.isPinned && b.isPinned) return 1
    return 0
  })
})

// Tìm tin nhắn cuối cùng của mình có status (để hiển thị trạng thái)
const lastOwnMessage = computed(() => {
  const ownMessages = messages.value.filter(m => m.isOwn)
  return ownMessages.length > 0 ? ownMessages[ownMessages.length - 1] : null
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
  // Giả lập typing sau 2s
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

const insertEmoji = (emoji: string) => {
  newMessage.value += emoji
}

const setReplyTo = (msg: ChatMessage) => {
  replyingTo.value = msg
}

const handleSearchInChat = async () => {
  if (!searchQuery.value.trim() || !selectedConversation.value) return
  searchResults.value = await searchMessages(selectedConversation.value.id, searchQuery.value)
}

const openCall = (type: 'audio' | 'video') => {
  callType.value = type
  showCallDialog.value = true
}

const scrollToBottom = () => {
  if (chatContainer.value) {
    chatContainer.value.scrollTop = chatContainer.value.scrollHeight
  }
}

const handleScroll = () => {
  if (!chatContainer.value) return
  const { scrollTop, scrollHeight, clientHeight } = chatContainer.value
  showScrollBottom.value = scrollHeight - scrollTop - clientHeight > 200
}

// Ẩn menu khi click ngoài
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
</script>

<template>
  <div class="flex h-[calc(100vh-4rem)] overflow-hidden" @click="closeMenus">
    <!-- Conversations List -->
    <div
      :class="[
        'w-full sm:w-80 xl:w-96 shrink-0 flex flex-col bg-white dark:bg-surface-800 border-r border-gray-200 dark:border-surface-700',
        showMobileChat ? 'hidden sm:flex' : 'flex'
      ]"
    >
      <!-- Header -->
      <div class="px-4 py-4 border-b border-gray-200 dark:border-surface-700">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-xl font-bold text-gray-900 dark:text-white">Tin nhắn</h2>
          <button class="p-2 rounded-xl text-gray-500 hover:bg-gray-100 dark:hover:bg-surface-700 transition-colors">
            <PlusIcon :size="20" />
          </button>
        </div>
        <div class="flex items-center gap-2 bg-gray-100 dark:bg-surface-700 rounded-xl px-3 py-2">
          <SearchIcon :size="16" class="text-gray-400" />
          <input
            v-model="searchChat"
            type="text"
            placeholder="Tìm kiếm cuộc trò chuyện..."
            class="bg-transparent border-none outline-none text-sm w-full text-gray-700 dark:text-gray-300 placeholder-gray-400"
          />
        </div>
      </div>

      <!-- Conversations -->
      <div class="flex-1 overflow-y-auto p-3 space-y-1">
        <div v-if="isInitialLoading" class="space-y-3">
          <div v-for="i in 5" :key="i" class="flex items-center gap-3 p-3">
            <Skeleton type="avatar" class="w-12 h-12 shrink-0" />
            <div class="flex-1 space-y-2">
              <Skeleton type="text" class="w-32 h-4" />
              <Skeleton type="text" class="w-24 h-3" />
            </div>
          </div>
        </div>
        <div v-else-if="!isInitialLoading && conversations.length === 0" class="flex flex-col items-center justify-center h-full p-4 text-center opacity-50">
          <MessageCircleIcon class="w-12 h-12 text-gray-400 mb-2" />
          <p class="text-sm text-gray-500">Chưa có cuộc trò chuyện nào.</p>
        </div>
        <div
          v-else
          v-for="conv in filteredConversations"
          :key="conv.id"
          @click="selectConversation(conv)"
          :class="[
            'flex items-center gap-3 px-4 py-3 cursor-pointer transition-all duration-200 rounded-xl',
            selectedConversation?.id === conv.id
              ? 'bg-primary-50 dark:bg-primary-900/10 ring-1 ring-primary-500/20'
              : 'hover:bg-gray-50 dark:hover:bg-surface-700/50'
          ]"
        >
          <!-- Avatar -->
          <div class="relative shrink-0">
            <UserAvatar :user="{ name: conv.name, avatar: conv.avatar }" size="md" />
            <div
              v-if="conv.isOnline"
              class="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 rounded-full ring-2 ring-white dark:ring-surface-800"
            />
            <div
              v-if="conv.isGroup"
              class="absolute -bottom-1 -right-1 w-5 h-5 bg-primary-500 rounded-full ring-2 ring-white dark:ring-surface-800 flex items-center justify-center"
            >
              <span class="text-[8px] text-white font-bold">{{ conv.participants.length }}</span>
            </div>
          </div>

          <!-- Info -->
          <div class="flex-1 min-w-0">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-1.5">
                <PinIcon v-if="conv.isPinned" :size="12" class="text-primary-500 shrink-0" />
                <p class="text-sm font-semibold text-gray-900 dark:text-white truncate">{{ conv.name }}</p>
              </div>
              <span class="text-xs text-gray-400 shrink-0 ml-2">{{ conv.lastMessageTime }}</span>
            </div>
            <div class="flex items-center justify-between mt-0.5">
              <div class="flex items-center gap-1 min-w-0">
                <BellOffIcon v-if="conv.isMuted" :size="12" class="text-gray-400 shrink-0" />
                <p class="text-xs text-gray-500 dark:text-gray-400 truncate">{{ conv.lastMessage }}</p>
              </div>
              <span
                v-if="conv.unreadCount > 0"
                class="shrink-0 ml-2 w-5 h-5 bg-primary-500 text-white text-xs rounded-full flex items-center justify-center font-medium"
              >
                {{ conv.unreadCount }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty Chat Area -->
    <div
      v-if="!selectedConversation && !isInitialLoading"
      class="hidden sm:flex flex-1 flex-col items-center justify-center bg-gray-50 dark:bg-surface-900"
    >
      <div class="bg-white dark:bg-surface-800 p-8 rounded-full shadow-sm mb-6 border border-gray-100 dark:border-surface-700">
        <MessageCircleIcon class="w-16 h-16 text-primary-500" />
      </div>
      <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-2">Xin chào!</h3>
      <p class="text-gray-500 dark:text-gray-400 max-w-sm text-center">
        Chọn một cuộc trò chuyện từ danh sách bên trái hoặc bắt đầu một cuộc trò chuyện mới.
      </p>
    </div>

    <!-- Chat Area + Info Panel wrapper -->
    <div
      v-else
      :class="[
        'flex-1 flex min-w-0 relative',
        showMobileChat ? 'flex' : 'hidden sm:flex'
      ]"
    >
      <!-- Chat Column -->
      <div class="flex-1 flex flex-col min-w-0">
      <!-- Chat Header -->
      <div class="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-gray-200 dark:border-surface-700 bg-white dark:bg-surface-800">
        <div class="flex items-center gap-3">
          <button
            @click="showMobileChat = false"
            class="sm:hidden p-1 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-surface-700"
          >
            <ChevronLeftIcon :size="20" />
          </button>
          <div class="relative">
            <UserAvatar v-if="selectedConversation && !isInitialLoading" :user="{ name: selectedConversation.name, avatar: selectedConversation.avatar }" size="sm" />
            <Skeleton v-else type="avatar" class="w-8 h-8" rounded="rounded-full" />
            <div v-if="selectedConversation?.isOnline && !isInitialLoading" class="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full ring-2 ring-white dark:ring-surface-800" />
          </div>
          <div>
            <template v-if="selectedConversation && !isInitialLoading">
              <p class="text-sm font-semibold text-gray-900 dark:text-white">{{ selectedConversation.name }}</p>
              <p class="text-xs text-green-500" v-if="isTyping">{{ typingUser }} đang nhập...</p>
              <p class="text-xs text-green-500" v-else-if="selectedConversation.isOnline">Đang hoạt động</p>
              <p class="text-xs text-gray-400" v-else>Hoạt động 15 phút trước</p>
            </template>
            <template v-else>
              <Skeleton type="text" class="w-24 h-4 mb-1" />
              <Skeleton type="text" class="w-16 h-3" />
            </template>
          </div>
        </div>
        <div class="flex items-center gap-1">
          <button @click="openCall('audio')" class="p-2 rounded-xl text-gray-500 hover:bg-gray-100 dark:hover:bg-surface-700 transition-colors">
            <PhoneIcon :size="18" />
          </button>
          <button @click="openCall('video')" class="p-2 rounded-xl text-gray-500 hover:bg-gray-100 dark:hover:bg-surface-700 transition-colors">
            <VideoIcon :size="18" />
          </button>
          <button @click="showInfoPanel = !showInfoPanel" :class="['p-2 rounded-xl transition-colors', showInfoPanel ? 'text-primary-500 bg-primary-50 dark:bg-primary-900/20' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-surface-700']">
            <InfoIcon :size="18" />
          </button>
        </div>
      </div>

      <!-- Pinned Message Bar -->
      <div v-if="pinnedMessage" class="flex items-center justify-between px-4 py-2 bg-primary-50 dark:bg-primary-900/20 border-b border-primary-100 dark:border-primary-900/30 cursor-pointer hover:bg-primary-100 dark:hover:bg-primary-900/30 transition-colors">
        <div class="flex items-center gap-3 overflow-hidden">
          <PinIcon :size="16" class="text-primary-600 dark:text-primary-400 shrink-0" />
          <div class="flex-1 min-w-0">
            <p class="text-xs font-semibold text-primary-700 dark:text-primary-300">Tin nhắn đã ghim</p>
            <p class="text-xs text-primary-600 dark:text-primary-400 truncate">{{ pinnedMessage.content || 'Tin nhắn hình ảnh/tệp' }}</p>
          </div>
        </div>
        <button @click.stop="pinMessage(pinnedMessage.id)" class="p-1 rounded-md text-primary-600 hover:bg-primary-200 dark:text-primary-400 dark:hover:bg-primary-800/50">
          <XIcon :size="14" />
        </button>
      </div>

      <!-- Search in Chat Bar -->
      <div v-if="showSearchInChat" class="flex items-center gap-2 px-4 py-2 border-b border-gray-200 dark:border-surface-700 bg-gray-50 dark:bg-surface-800">
        <SearchIcon :size="16" class="text-gray-400 shrink-0" />
        <input
          v-model="searchQuery"
          @input="handleSearchInChat"
          type="text"
          placeholder="Tìm kiếm tin nhắn..."
          class="bg-transparent border-none outline-none text-sm w-full text-gray-700 dark:text-gray-300 placeholder-gray-400"
          autofocus
        />
        <span v-if="searchResults.length > 0" class="text-xs text-gray-400 shrink-0">{{ searchResults.length }} kết quả</span>
        <button @click="showSearchInChat = false; searchQuery = ''; searchResults = []" class="p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
          <XIcon :size="16" />
        </button>
      </div>

      <!-- Messages -->
      <div
        ref="chatContainer"
        @scroll="handleScroll"
        class="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3 bg-gray-50 dark:bg-surface-900"
      >
        <!-- Date separator -->
        <div class="flex items-center gap-4 mb-4">
          <div class="flex-1 h-px bg-gray-200 dark:bg-surface-700" />
          <span class="text-xs text-gray-400 font-medium">Hôm nay</span>
          <div class="flex-1 h-px bg-gray-200 dark:bg-surface-700" />
        </div>

        <div v-if="isInitialLoading || (isLoading && messages.length === 0)" class="space-y-4">
          <div v-for="i in 3" :key="i" :class="['flex items-end gap-2', i % 2 === 0 ? 'justify-end' : 'justify-start']">
            <Skeleton v-if="i % 2 !== 0" type="avatar" class="w-7 h-7 shrink-0" />
            <Skeleton type="text" :class="['w-48 h-10', i % 2 === 0 ? 'rounded-l-2xl rounded-tr-2xl' : 'rounded-r-2xl rounded-tl-2xl']" />
          </div>
        </div>

        <template v-else>
          <div
            v-for="msg in messages"
            :key="msg.id"
            :class="['flex items-end gap-2', msg.isOwn ? 'justify-end' : 'justify-start']"
          >
            <UserAvatar
              v-if="!msg.isOwn"
              :user="msg.sender"
              class="w-7 h-7 shrink-0"
              size="sm"
            />
            <div class="max-w-[75%] sm:max-w-[60%]">
              <!-- Reply indicator -->
              <div
                v-if="msg.replyTo"
                :class="[
                  'px-3 py-1.5 mb-1 rounded-t-xl text-xs border-l-2',
                  msg.isOwn
                    ? 'bg-primary-400/20 border-primary-300 text-primary-100'
                    : 'bg-gray-100 dark:bg-surface-700 border-gray-300 dark:border-surface-500 text-gray-500 dark:text-gray-400'
                ]"
              >
                <p class="font-medium">{{ msg.replyTo.senderName }}</p>
                <p class="truncate">{{ msg.replyTo.content }}</p>
              </div>

              <!-- Message bubble -->
              <div
                :class="[
                  'rounded-2xl text-sm group relative',
                  msg.reactions && msg.reactions.length > 0 ? 'mb-4' : '',
                  msg.status === 'revoked'
                    ? 'border border-gray-300 dark:border-surface-600 bg-transparent text-gray-500 italic px-4 py-2.5'
                    : msg.isOwn
                      ? 'bg-primary-500 text-white rounded-br-md'
                      : 'bg-white dark:bg-surface-800 text-gray-700 dark:text-gray-300 rounded-bl-md border border-gray-200 dark:border-surface-700',
                  msg.status !== 'revoked' && msg.type === 'image' ? 'p-1 overflow-hidden' : (msg.status !== 'revoked' ? 'px-4 py-2.5' : '')
                ]"
              >
                <!-- Revoked message -->
                <p v-if="msg.status === 'revoked'">Tin nhắn đã được thu hồi</p>
                <template v-else>
                  <!-- Text message -->
                  <p v-if="msg.type === 'text'">{{ msg.content }}</p>

                  <!-- Image message -->
                  <img
                    v-else-if="msg.type === 'image'"
                    :src="msg.imageUrl"
                    alt="Ảnh"
                    class="rounded-xl max-w-full max-h-64 object-cover cursor-pointer"
                    @click="imagePreview = msg.imageUrl || null"
                  />

                  <!-- File message -->
                  <div v-else-if="msg.type === 'file'" class="flex items-center gap-3">
                    <div :class="['p-2 rounded-lg', msg.isOwn ? 'bg-primary-400/30' : 'bg-gray-100 dark:bg-surface-700']">
                      <FileTextIcon :size="20" />
                    </div>
                    <div class="min-w-0">
                      <p class="text-sm font-medium truncate">{{ msg.fileName }}</p>
                      <p :class="['text-xs', msg.isOwn ? 'text-primary-200' : 'text-gray-400']">{{ msg.fileSize }}</p>
                    </div>
                    <button :class="['p-1.5 rounded-lg transition-colors', msg.isOwn ? 'hover:bg-primary-400/30' : 'hover:bg-gray-100 dark:hover:bg-surface-700']">
                      <DownloadIcon :size="16" />
                    </button>
                  </div>

                  <!-- Time + Status -->
                  <div :class="['flex items-center justify-end gap-1 mt-1', msg.isOwn ? 'text-primary-100' : 'text-gray-400']">
                    <span class="text-[10px]">{{ formatMessageTime(msg.createdAt) }}</span>
                    <!-- Message status for own messages -->
                    <template v-if="msg.isOwn">
                      <LoaderIcon v-if="msg.status === 'sending'" :size="10" class="animate-spin" />
                      <span v-else-if="msg.status !== 'read'" class="text-[10px]">{{ getMessageStatusLabel(msg) }}</span>
                    </template>
                  </div>

                  <!-- Reactions -->
                  <div v-if="msg.reactions && msg.reactions.length > 0" class="absolute -bottom-3 right-4 flex gap-0.5 z-10">
                    <span
                      v-for="r in msg.reactions"
                      :key="r.userId"
                      class="text-sm bg-white dark:bg-surface-800 rounded-full px-1 shadow-sm border border-gray-100 dark:border-surface-700"
                      :title="r.userName"
                    >
                      {{ r.emoji }}
                    </span>
                  </div>
                </template>

                <!-- Message Actions (hover) -->
                <div
                  v-if="msg.status !== 'revoked'"
                  :class="[
                    'absolute top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 z-20',
                    msg.isOwn ? '-left-24' : '-right-24'
                  ]"
                >
                  <div class="relative">
                    <button @click.stop="activeActionMenu = activeActionMenu === msg.id + '-react' ? null : msg.id + '-react'" class="p-1.5 rounded-full bg-white dark:bg-surface-700 shadow-sm border border-gray-200 dark:border-surface-600 hover:bg-gray-50 dark:hover:bg-surface-600 text-gray-500">
                      <SmileIcon :size="14" />
                    </button>
                    <!-- React Dropdown -->
                    <div v-if="activeActionMenu === msg.id + '-react'" :class="['absolute top-full mt-2 bg-white dark:bg-surface-800 rounded-full shadow-lg border border-gray-200 dark:border-surface-700 p-1.5 flex items-center gap-1 z-50 w-max', msg.isOwn ? 'left-0' : 'right-0']">
                      <button v-for="emoji in ['👍', '❤️', '😂', '😮', '😢', '😡']" :key="emoji" @click.stop="addReaction(msg.id, emoji, {id: currentUser?.id || 'u1', name: currentUser?.name || 'User'}); activeActionMenu = null" class="w-8 h-8 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-surface-700 rounded-full text-lg transition-transform hover:scale-125">
                        {{ emoji }}
                      </button>
                      <div class="w-px h-6 bg-gray-200 dark:bg-surface-700 mx-1"></div>
                      <button class="w-8 h-8 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-surface-700 rounded-full text-gray-500">
                        <PlusIcon :size="16" />
                      </button>
                    </div>
                  </div>

                  <!-- Reply -->
                  <button @click.stop="setReplyTo(msg)" class="p-1.5 rounded-full bg-white dark:bg-surface-700 shadow-sm border border-gray-200 dark:border-surface-600 hover:bg-gray-50 dark:hover:bg-surface-600 text-gray-500">
                    <ReplyIcon :size="14" />
                  </button>

                  <!-- More -->
                  <div class="relative">
                    <button @click.stop="activeActionMenu = activeActionMenu === msg.id + '-more' ? null : msg.id + '-more'" class="p-1.5 rounded-full bg-white dark:bg-surface-700 shadow-sm border border-gray-200 dark:border-surface-600 hover:bg-gray-50 dark:hover:bg-surface-600 text-gray-500">
                      <MoreVerticalIcon :size="14" />
                    </button>
                    <!-- More Dropdown -->
                    <div v-if="activeActionMenu === msg.id + '-more'" :class="['absolute top-full mt-2 w-48 bg-white dark:bg-surface-800 rounded-xl shadow-lg border border-gray-200 dark:border-surface-700 py-1 z-50', msg.isOwn ? 'right-0' : 'left-0']">
                      <button @click.stop="activeActionMenu = null" class="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-surface-700 text-left">
                        <ForwardIcon :size="16" class="text-gray-400" />
                        Chuyển tiếp
                      </button>
                      <button @click.stop="pinMessage(msg.id); activeActionMenu = null" class="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-surface-700 text-left">
                        <PinIcon :size="16" class="text-gray-400" />
                        {{ msg.isPinned ? 'Bỏ ghim' : 'Ghim tin nhắn' }}
                      </button>
                      <div class="h-px bg-gray-100 dark:bg-surface-700 my-1"></div>
                      <button v-if="msg.isOwn" @click.stop="revokeMessage(msg.id); activeActionMenu = null" class="w-full flex items-center gap-3 px-4 py-2 text-sm text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20 text-left">
                        <CornerUpLeftIcon :size="16" />
                        Thu hồi
                      </button>
                      <button v-if="msg.isOwn" @click.stop="deleteMessage(msg.id); activeActionMenu = null" class="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 text-left">
                        <TrashIcon :size="16" />
                        Xóa ở phía tôi
                      </button>
                      <button v-if="!msg.isOwn" @click.stop="activeActionMenu = null" class="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 text-left">
                        <FlagIcon :size="16" />
                        Báo cáo
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Read receipt avatar (only on last own read message) -->
              <div v-if="isLastOwnWithReadStatus(msg)" class="flex justify-end mt-1">
                <div class="flex items-center -space-x-1">
                  <!-- Use readBy if available -->
                  <template v-if="msg.readBy && msg.readBy.length > 0">
                    <UserAvatar
                      v-for="reader in msg.readBy.slice(0, 3)"
                      :key="reader.user.id"
                      :user="reader.user"
                      class="w-5 h-5 ring-[1.5px] ring-white dark:ring-surface-800 relative z-10 cursor-default"
                      size="sm"
                      :title="reader.user.name"
                    />
                    <div v-if="msg.readBy.length > 3" :title="msg.readBy.slice(3).map(r => r.user.name).join(', ')" class="w-5 h-5 rounded-full bg-gray-200 dark:bg-surface-700 flex items-center justify-center text-[9px] font-semibold text-gray-600 dark:text-gray-300 ring-[1.5px] ring-white dark:ring-surface-800 relative z-0 cursor-default">
                      +{{ msg.readBy.length - 3 }}
                    </div>
                  </template>
                  <!-- Fallback for newly sent messages where mock data doesn't provide readBy -->
                  <UserAvatar
                    v-else-if="selectedConversation"
                    :user="selectedConversation.participants[1]"
                    class="w-5 h-5 cursor-default"
                    size="sm"
                    :title="selectedConversation.participants[1].name"
                  />
                </div>
              </div>
            </div>
          </div>

          <!-- Typing indicator -->
          <div v-if="isTyping" class="flex items-end gap-2">
            <UserAvatar :user="selectedConversation?.participants.find((p: any) => p.name === typingUser) || selectedConversation?.participants[1]" size="sm" class="w-7 h-7 shrink-0" />
            <div class="bg-white dark:bg-surface-800 rounded-2xl rounded-bl-md px-4 py-3 border border-gray-200 dark:border-surface-700">
              <div class="flex gap-1">
                <span class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0ms" />
                <span class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 150ms" />
                <span class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 300ms" />
              </div>
            </div>
          </div>
        </template>

        <!-- Scroll to bottom button -->
        <Transition
          enter-active-class="transition duration-200"
          enter-from-class="opacity-0 translate-y-2"
          leave-active-class="transition duration-150"
          leave-to-class="opacity-0 translate-y-2"
        >
          <button
            v-if="showScrollBottom"
            @click="scrollToBottom"
            class="fixed bottom-24 right-8 p-2.5 rounded-full bg-white dark:bg-surface-800 shadow-lg border border-gray-200 dark:border-surface-700 text-gray-500 hover:text-primary-500 transition-colors z-10"
          >
            <ArrowDownIcon :size="18" />
          </button>
        </Transition>
      </div>

      <!-- Reply Bar -->
      <div v-if="replyingTo" class="flex items-center gap-3 px-4 py-2 border-t border-gray-200 dark:border-surface-700 bg-gray-50 dark:bg-surface-800">
        <div class="w-1 h-8 bg-primary-500 rounded-full shrink-0" />
        <div class="flex-1 min-w-0">
          <p class="text-xs font-medium text-primary-500">Đang trả lời {{ replyingTo.sender.name }}</p>
          <p class="text-xs text-gray-500 truncate">{{ replyingTo.content || (replyingTo.type === 'image' ? '📷 Ảnh' : '📄 ' + replyingTo.fileName) }}</p>
        </div>
        <button @click="replyingTo = null" class="p-1 rounded-lg text-gray-400 hover:text-gray-600 transition-colors">
          <XIcon :size="16" />
        </button>
      </div>

      <!-- Message Input -->
      <div class="px-4 py-3 border-t border-gray-200 dark:border-surface-700 bg-white dark:bg-surface-800">
        <div class="flex items-end gap-2">
          <div class="flex items-center gap-1">
            <!-- File attach -->
            <label class="p-2 rounded-xl text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-surface-700 transition-colors cursor-pointer">
              <PaperclipIcon :size="18" />
              <input type="file" class="hidden" @change="handleSendFile" accept=".pdf,.doc,.docx,.txt,.zip,.rar" />
            </label>
            <!-- Image attach -->
            <label class="p-2 rounded-xl text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-surface-700 transition-colors cursor-pointer">
              <ImageIcon :size="18" />
              <input type="file" class="hidden" @change="handleSendImage" accept="image/*" />
            </label>
          </div>
          <div class="flex-1 flex items-end gap-2 bg-gray-100 dark:bg-surface-700 rounded-2xl px-4 py-2 relative">
            <textarea
              v-model="newMessage"
              @keydown.enter.exact.prevent="handleSendMessage"
              placeholder="Nhập tin nhắn..."
              rows="1"
              class="flex-1 bg-transparent border-none outline-none text-sm text-gray-700 dark:text-gray-300 placeholder-gray-400 resize-none max-h-24"
            />
            <!-- Emoji button -->
            <div class="relative">
              <button @click.stop="showEmojiPicker = !showEmojiPicker" class="p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                <SmileIcon :size="18" />
              </button>
              <!-- Emoji Picker -->
              <Transition
                enter-active-class="transition duration-150 ease-out"
                enter-from-class="opacity-0 scale-95"
                leave-active-class="transition duration-100 ease-in"
                leave-to-class="opacity-0 scale-95"
              >
                <div
                  v-if="showEmojiPicker"
                  class="absolute bottom-full right-0 mb-2 w-72 bg-white dark:bg-surface-800 rounded-xl border border-gray-200 dark:border-surface-700 shadow-xl p-3 z-50"
                  @click.stop
                >
                  <p class="text-xs font-medium text-gray-500 mb-2">Biểu cảm</p>
                  <div class="grid grid-cols-8 gap-1">
                    <button
                      v-for="emoji in emojiList"
                      :key="emoji"
                      @click="insertEmoji(emoji)"
                      class="w-8 h-8 flex items-center justify-center text-lg hover:bg-gray-100 dark:hover:bg-surface-700 rounded-lg transition-colors"
                    >
                      {{ emoji }}
                    </button>
                  </div>
                </div>
              </Transition>
            </div>
          </div>
          <button
            @click="handleSendMessage"
            :disabled="!newMessage.trim()"
            class="p-3 rounded-xl gradient-primary text-white hover:opacity-90 transition-all shadow-lg shadow-primary-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <SendIcon :size="18" />
          </button>
        </div>
      </div>
    </div>

      <!-- Info Panel (Right Sidebar) -->
      <aside
        v-if="showInfoPanel && selectedConversation"
        class="absolute inset-0 z-20 xl:relative flex w-full xl:w-80 shrink-0 flex-col bg-white dark:bg-surface-800 border-l border-gray-200 dark:border-surface-700 overflow-y-auto"
      >
        <!-- Close button -->
        <div class="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-surface-700">
          <h3 class="text-sm font-semibold text-gray-900 dark:text-white">Thông tin</h3>
          <button @click="showInfoPanel = false" class="p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-surface-700 transition-colors">
            <XIcon :size="16" />
          </button>
        </div>

        <!-- Profile Header -->
        <div class="flex flex-col items-center py-6 px-4 border-b border-gray-100 dark:border-surface-700">
          <div class="relative mb-3">
            <UserAvatar :user="{ name: selectedConversation.name, avatar: selectedConversation.avatar }" size="lg" class="w-20 h-20" />
            <div v-if="selectedConversation.isOnline" class="absolute bottom-1 right-1 w-4 h-4 bg-green-500 rounded-full ring-3 ring-white dark:ring-surface-800" />
          </div>
          <h3 class="text-base font-bold text-gray-900 dark:text-white">{{ selectedConversation.name }}</h3>
          <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            {{ selectedConversation.isOnline ? 'Đang hoạt động' : 'Hoạt động 15 phút trước' }}
          </p>
          <!-- Quick Actions -->
          <div class="flex w-full mt-4 px-2">
            <button v-if="!selectedConversation.isGroup" @click="router.push(`/profile/${selectedConversation.participants[1]?.id}`)" class="flex-1 flex flex-col items-center gap-1 group">
              <div class="w-9 h-9 rounded-full bg-gray-100 dark:bg-surface-700 flex items-center justify-center group-hover:bg-primary-50 dark:group-hover:bg-primary-900/20 transition-colors">
                <UserIcon :size="16" class="text-gray-600 dark:text-gray-400 group-hover:text-primary-500" />
              </div>
              <span class="text-[10px] text-gray-500 text-center leading-tight break-words max-w-[60px]">Trang cá nhân</span>
            </button>
            <button @click="muteConversation(selectedConversation.id)" class="flex-1 flex flex-col items-center gap-1 group">
              <div class="w-9 h-9 rounded-full bg-gray-100 dark:bg-surface-700 flex items-center justify-center group-hover:bg-primary-50 dark:group-hover:bg-primary-900/20 transition-colors">
                <component :is="selectedConversation.isMuted ? BellIcon : BellOffIcon" :size="16" class="text-gray-600 dark:text-gray-400 group-hover:text-primary-500" />
              </div>
              <span class="text-[10px] text-gray-500 text-center leading-tight break-words max-w-[60px]">{{ selectedConversation.isMuted ? 'Bật thông báo' : 'Tắt thông báo' }}</span>
            </button>
            <button @click="showSearchInChat = true; showInfoPanel = false" class="flex-1 flex flex-col items-center gap-1 group">
              <div class="w-9 h-9 rounded-full bg-gray-100 dark:bg-surface-700 flex items-center justify-center group-hover:bg-primary-50 dark:group-hover:bg-primary-900/20 transition-colors">
                <SearchIcon :size="16" class="text-gray-600 dark:text-gray-400 group-hover:text-primary-500" />
              </div>
              <span class="text-[10px] text-gray-500 text-center leading-tight break-words max-w-[60px]">Tìm kiếm</span>
            </button>
            <button @click="pinConversation(selectedConversation.id)" class="flex-1 flex flex-col items-center gap-1 group">
              <div class="w-9 h-9 rounded-full bg-gray-100 dark:bg-surface-700 flex items-center justify-center group-hover:bg-primary-50 dark:group-hover:bg-primary-900/20 transition-colors">
                <PinIcon :size="16" class="text-gray-600 dark:text-gray-400 group-hover:text-primary-500" />
              </div>
              <span class="text-[10px] text-gray-500 text-center leading-tight break-words max-w-[60px]">{{ selectedConversation.isPinned ? 'Bỏ ghim' : 'Ghim' }}</span>
            </button>
          </div>
        </div>

        <!-- Shared Media -->
        <div class="border-b border-gray-100 dark:border-surface-700">
          <button @click="showMediaSection = !showMediaSection" class="w-full flex items-center justify-between px-4 py-3 text-sm font-semibold text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-surface-700/50 transition-colors">
            <span class="flex items-center gap-2">
              File phương tiện
              <span v-if="sharedMedia.length > 0" class="text-[10px] font-normal text-gray-400">({{ sharedMedia.length }})</span>
            </span>
            <ChevronDownIcon :size="16" :class="['transition-transform', showMediaSection ? 'rotate-180' : '']" />
          </button>
          <div v-if="showMediaSection" class="px-4 pb-3">
            <div v-if="sharedMedia.length === 0" class="text-xs text-gray-400 text-center py-3">Chưa có ảnh nào</div>
            <template v-else>
              <div :class="['space-y-4', showAllMedia ? 'max-h-75 overflow-y-auto custom-scrollbar pr-1' : '']">
                <!-- Grouped View -->
                <template v-if="showAllMedia">
                  <div v-for="group in groupedSharedMedia" :key="group.date">
                    <p class="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2">{{ group.date }}</p>
                    <div class="grid grid-cols-3 gap-1.5">
                      <img
                        v-for="media in group.items"
                        :key="media.id"
                        :src="media.imageUrl"
                        alt=""
                        class="w-full aspect-square object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                        @click="imagePreview = media.imageUrl || null"
                      />
                    </div>
                  </div>
                </template>
                <!-- Flat View (Collapsed) -->
                <template v-else>
                  <div class="grid grid-cols-3 gap-1.5">
                    <img
                      v-for="media in sharedMedia.slice(0, 9)"
                      :key="media.id"
                      :src="media.imageUrl"
                      alt=""
                      class="w-full aspect-square object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                      @click="imagePreview = media.imageUrl || null"
                    />
                  </div>
                </template>
              </div>
              <button
                v-if="sharedMedia.length > 9"
                @click="showAllMedia = !showAllMedia"
                class="w-full mt-2 py-1.5 text-xs text-primary-500 hover:text-primary-600 font-medium transition-colors"
              >
                {{ showAllMedia ? 'Thu gọn' : `Xem tất cả (${sharedMedia.length})` }}
              </button>
            </template>
          </div>
        </div>

        <!-- Shared Files -->
        <div class="border-b border-gray-100 dark:border-surface-700">
          <button @click="showFileSection = !showFileSection" class="w-full flex items-center justify-between px-4 py-3 text-sm font-semibold text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-surface-700/50 transition-colors">
            <span class="flex items-center gap-2">
              File đính kèm
              <span v-if="sharedFiles.length > 0" class="text-[10px] font-normal text-gray-400">({{ sharedFiles.length }})</span>
            </span>
            <ChevronDownIcon :size="16" :class="['transition-transform', showFileSection ? 'rotate-180' : '']" />
          </button>
          <div v-if="showFileSection" class="px-4 pb-3 space-y-2">
            <div v-if="sharedFiles.length === 0" class="text-xs text-gray-400 text-center py-3">Chưa có file nào</div>
            <template v-else>
              <div :class="[showAllFiles ? 'max-h-75 overflow-y-auto custom-scrollbar pr-1 space-y-4' : 'space-y-2']">
                <!-- Grouped View -->
                <template v-if="showAllFiles">
                  <div v-for="group in groupedSharedFiles" :key="group.date" class="space-y-2">
                    <p class="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">{{ group.date }}</p>
                    <div
                      v-for="file in group.items"
                      :key="file.id"
                      class="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-surface-700/50 transition-colors cursor-pointer"
                    >
                      <div class="w-9 h-9 rounded-lg bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center shrink-0">
                        <FileTextIcon :size="16" class="text-primary-500" />
                      </div>
                      <div class="flex-1 min-w-0">
                        <p class="text-xs font-medium text-gray-700 dark:text-gray-300 truncate">{{ file.fileName }}</p>
                        <p class="text-[10px] text-gray-400">{{ file.fileSize }}</p>
                      </div>
                      <button class="p-1 rounded-md text-gray-400 hover:text-gray-600 transition-colors">
                        <DownloadIcon :size="14" />
                      </button>
                    </div>
                  </div>
                </template>
                <!-- Flat View (Collapsed) -->
                <template v-else>
                  <div
                    v-for="file in sharedFiles.slice(0, 5)"
                    :key="file.id"
                    class="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-surface-700/50 transition-colors cursor-pointer"
                  >
                    <div class="w-9 h-9 rounded-lg bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center shrink-0">
                      <FileTextIcon :size="16" class="text-primary-500" />
                    </div>
                    <div class="flex-1 min-w-0">
                      <p class="text-xs font-medium text-gray-700 dark:text-gray-300 truncate">{{ file.fileName }}</p>
                      <p class="text-[10px] text-gray-400">{{ file.fileSize }}</p>
                    </div>
                    <button class="p-1 rounded-md text-gray-400 hover:text-gray-600 transition-colors">
                      <DownloadIcon :size="14" />
                    </button>
                  </div>
                </template>
              </div>
              <button
                v-if="sharedFiles.length > 5"
                @click="showAllFiles = !showAllFiles"
                class="w-full mt-1 py-1.5 text-xs text-primary-500 hover:text-primary-600 font-medium transition-colors"
              >
                {{ showAllFiles ? 'Thu gọn' : `Xem tất cả (${sharedFiles.length})` }}
              </button>
            </template>
          </div>
        </div>

        <!-- Group Members -->
        <div v-if="selectedConversation.isGroup" class="border-b border-gray-100 dark:border-surface-700">
          <button @click="showMembersSection = !showMembersSection" class="w-full flex items-center justify-between px-4 py-3 text-sm font-semibold text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-surface-700/50 transition-colors">
            <span class="flex items-center gap-2">
              <UsersIcon :size="16" />
              Thành viên ({{ selectedConversation.participants.length }})
            </span>
            <ChevronDownIcon :size="16" :class="['transition-transform', showMembersSection ? 'rotate-180' : '']" />
          </button>
          <div v-if="showMembersSection" class="px-4 pb-3 space-y-2">
            <div
              v-for="member in selectedConversation.participants"
              :key="member.id"
              @click="router.push(`/profile/${member.id}`)"
              class="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-surface-700/50 transition-colors cursor-pointer"
            >
              <UserAvatar :user="member" size="sm" />
              <div class="flex-1 min-w-0">
                <p class="text-xs font-medium text-gray-700 dark:text-gray-300 truncate">{{ member.name }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Privacy & Support -->
        <div class="py-2">
          <p class="px-4 py-2 text-xs font-medium text-gray-400 uppercase tracking-wider">Quyền riêng tư</p>
          <button v-if="!selectedConversation.isGroup" @click="blockUser(selectedConversation.participants[1]?.id)" class="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-surface-700/50 transition-colors">
            <BanIcon :size="16" class="text-gray-400" /> Chặn
          </button>
          <button class="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors">
            <FlagIcon :size="16" /> Báo cáo
          </button>
          <button v-if="selectedConversation" @click="deleteConversation(selectedConversation.id); selectedConversation = null; showInfoPanel = false" class="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors">
            <TrashIcon :size="16" /> Xóa cuộc trò chuyện
          </button>
        </div>
      </aside>
    </div>

    <!-- Call Dialog -->
    <Transition
      enter-active-class="transition duration-200"
      enter-from-class="opacity-0"
      leave-active-class="transition duration-150"
      leave-to-class="opacity-0"
    >
      <div v-if="showCallDialog" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50" @click="showCallDialog = false">
        <div class="bg-white dark:bg-surface-800 rounded-2xl p-8 max-w-sm w-full mx-4 text-center shadow-2xl" @click.stop>
          <div class="w-16 h-16 rounded-full bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center mx-auto mb-4">
            <component :is="callType === 'audio' ? PhoneIcon : VideoIcon" :size="28" class="text-primary-500" />
          </div>
          <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-2">
            {{ callType === 'audio' ? 'Gọi thoại' : 'Gọi video' }}
          </h3>
          <p class="text-sm text-gray-500 dark:text-gray-400 mb-6">
            Tính năng {{ callType === 'audio' ? 'gọi thoại' : 'gọi video' }} đang được phát triển và sẽ sớm ra mắt trong phiên bản tiếp theo! 🚀
          </p>
          <button
            @click="showCallDialog = false"
            class="px-6 py-2.5 rounded-xl text-sm font-medium text-white gradient-primary hover:opacity-90 transition-all"
          >
            Đã hiểu
          </button>
        </div>
      </div>
    </Transition>

    <!-- Image Preview Modal -->
    <Transition
      enter-active-class="transition duration-200"
      enter-from-class="opacity-0"
      leave-active-class="transition duration-150"
      leave-to-class="opacity-0"
    >
      <div v-if="imagePreview" class="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" @click="imagePreview = null">
        <button class="absolute top-4 right-4 p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors">
          <XIcon :size="24" />
        </button>
        <img :src="imagePreview" alt="Preview" class="max-w-full max-h-full object-contain rounded-lg" />
      </div>
    </Transition>
  </div>
</template>
