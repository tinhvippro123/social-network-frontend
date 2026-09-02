<script setup lang="ts">
import { ref, computed, nextTick, onMounted, watch } from 'vue'
import {
  Send as SendIcon, Smile as SmileIcon, Paperclip as PaperclipIcon,
  Image as ImageIcon, Phone as PhoneIcon, Video as VideoIcon,
  MoreVertical as MoreVerticalIcon, Search as SearchIcon, Plus as PlusIcon,
  Check as CheckIcon, CheckCheck as CheckCheckIcon,
  MessageCircle as MessageCircleIcon, ArrowDown as ArrowDownIcon,
  X as XIcon, Reply as ReplyIcon, Pin as PinIcon, BellOff as BellOffIcon,
  Bell as BellIcon, Trash2 as TrashIcon, Ban as BanIcon, User as UserIcon,
  FileText as FileTextIcon, Download as DownloadIcon, Loader2 as LoaderIcon,
  ChevronLeft as ChevronLeftIcon, Info as InfoIcon
} from '@lucide/vue'
import { useChat } from '@/composables/useChat'
import UserAvatar from '@/components/UserAvatar.vue'
import Skeleton from '@/components/ui/Skeleton.vue'
import type { ChatMessage } from '@/types'
import { useRouter } from 'vue-router'

const router = useRouter()
const {
  conversations, messages, isLoading, isTyping, typingUser,
  fetchConversations, fetchMessages, sendMessage: apiSendMessage,
  markAsRead, pinConversation, muteConversation, deleteConversation,
  blockUser, searchMessages, simulateTyping
} = useChat()

const selectedConversation = ref<any>(null)
const newMessage = ref('')
const isInitialLoading = ref(true)
const showMobileChat = ref(false)

// UI states
const showMoreMenu = ref(false)
const showEmojiPicker = ref(false)
const showSearchInChat = ref(false)
const searchQuery = ref('')
const searchResults = ref<ChatMessage[]>([])
const replyingTo = ref<ChatMessage | null>(null)
const showCallDialog = ref(false)
const callType = ref<'audio' | 'video'>('audio')
const chatContainer = ref<HTMLElement | null>(null)
const showScrollBottom = ref(false)
const searchChat = ref('')
const imagePreview = ref<string | null>(null)

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
  showMoreMenu.value = false
  showEmojiPicker.value = false
  showSearchInChat.value = false
  replyingTo.value = null
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
  showMoreMenu.value = false
  showEmojiPicker.value = false
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
        'w-full sm:w-80 lg:w-96 shrink-0 flex flex-col bg-white dark:bg-surface-800 border-r border-gray-200 dark:border-surface-700',
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

    <!-- Chat Area -->
    <div
      v-else
      :class="[
        'flex-1 flex flex-col min-w-0',
        showMobileChat ? 'flex' : 'hidden sm:flex'
      ]"
    >
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
          <!-- More Menu -->
          <div class="relative">
            <button @click.stop="showMoreMenu = !showMoreMenu" class="p-2 rounded-xl text-gray-500 hover:bg-gray-100 dark:hover:bg-surface-700 transition-colors">
              <MoreVerticalIcon :size="18" />
            </button>
            <!-- Dropdown Menu -->
            <Transition
              enter-active-class="transition duration-150 ease-out"
              enter-from-class="opacity-0 scale-95 -translate-y-1"
              enter-to-class="opacity-100 scale-100 translate-y-0"
              leave-active-class="transition duration-100 ease-in"
              leave-from-class="opacity-100 scale-100 translate-y-0"
              leave-to-class="opacity-0 scale-95 -translate-y-1"
            >
              <div
                v-if="showMoreMenu"
                class="absolute right-0 top-full mt-1 w-56 bg-white dark:bg-surface-800 rounded-xl border border-gray-200 dark:border-surface-700 shadow-xl z-50 py-1 overflow-hidden"
                @click.stop
              >
                <button @click="showSearchInChat = true; showMoreMenu = false" class="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-surface-700 transition-colors">
                  <SearchIcon :size="16" /> Tìm trong cuộc trò chuyện
                </button>
                <button v-if="selectedConversation" @click="pinConversation(selectedConversation.id); showMoreMenu = false" class="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-surface-700 transition-colors">
                  <PinIcon :size="16" /> {{ selectedConversation.isPinned ? 'Bỏ ghim' : 'Ghim cuộc trò chuyện' }}
                </button>
                <button v-if="selectedConversation" @click="muteConversation(selectedConversation.id); showMoreMenu = false" class="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-surface-700 transition-colors">
                  <component :is="selectedConversation.isMuted ? BellIcon : BellOffIcon" :size="16" />
                  {{ selectedConversation.isMuted ? 'Bật thông báo' : 'Tắt thông báo' }}
                </button>
                <button v-if="selectedConversation && !selectedConversation.isGroup" @click="router.push(`/profile/${selectedConversation.participants[1]?.id}`); showMoreMenu = false" class="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-surface-700 transition-colors">
                  <UserIcon :size="16" /> Xem trang cá nhân
                </button>
                <div class="my-1 h-px bg-gray-100 dark:bg-surface-700" />
                <button v-if="selectedConversation && !selectedConversation.isGroup" @click="blockUser(selectedConversation.participants[1]?.id); showMoreMenu = false" class="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors">
                  <BanIcon :size="16" /> Chặn người dùng
                </button>
                <button v-if="selectedConversation" @click="deleteConversation(selectedConversation.id); selectedConversation = null; showMoreMenu = false" class="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors">
                  <TrashIcon :size="16" /> Xóa cuộc trò chuyện
                </button>
              </div>
            </Transition>
          </div>
        </div>
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

        <div v-if="isLoading || isInitialLoading" class="space-y-4">
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
                  msg.isOwn
                    ? 'bg-primary-500 text-white rounded-br-md'
                    : 'bg-white dark:bg-surface-800 text-gray-700 dark:text-gray-300 rounded-bl-md border border-gray-200 dark:border-surface-700',
                  msg.type === 'image' ? 'p-1 overflow-hidden' : 'px-4 py-2.5'
                ]"
              >
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
                  <span class="text-[10px]">{{ msg.createdAt }}</span>
                  <!-- Message status for own messages -->
                  <template v-if="msg.isOwn">
                    <LoaderIcon v-if="msg.status === 'sending'" :size="10" class="animate-spin" />
                    <span v-else-if="msg.status !== 'read'" class="text-[10px]">{{ getMessageStatusLabel(msg) }}</span>
                  </template>
                </div>

                <!-- Reactions -->
                <div v-if="msg.reactions && msg.reactions.length > 0" class="absolute -bottom-3 left-2 flex gap-0.5">
                  <span
                    v-for="r in msg.reactions"
                    :key="r.userId"
                    class="text-sm bg-white dark:bg-surface-800 rounded-full px-1 shadow-sm border border-gray-100 dark:border-surface-700"
                    :title="r.userName"
                  >
                    {{ r.emoji }}
                  </span>
                </div>

                <!-- Reply button (hover) -->
                <button
                  @click.stop="setReplyTo(msg)"
                  :class="[
                    'absolute top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-full bg-white dark:bg-surface-700 shadow-sm border border-gray-200 dark:border-surface-600',
                    msg.isOwn ? '-left-8' : '-right-8'
                  ]"
                >
                  <ReplyIcon :size="12" class="text-gray-500" />
                </button>
              </div>

              <!-- Read receipt avatar (only on last own read message) -->
              <div v-if="isLastOwnWithReadStatus(msg) && msg.readBy && msg.readBy.length > 0" class="flex justify-end mt-1">
                <div class="flex items-center gap-1">
                  <UserAvatar
                    v-for="reader in msg.readBy.slice(0, 3)"
                    :key="reader.user.id"
                    :user="reader.user"
                    class="w-4 h-4"
                    size="sm"
                  />
                </div>
              </div>
            </div>
          </div>

          <!-- Typing indicator -->
          <div v-if="isTyping" class="flex items-end gap-2">
            <div class="w-7 h-7 rounded-full bg-gray-200 dark:bg-surface-700 shrink-0" />
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
