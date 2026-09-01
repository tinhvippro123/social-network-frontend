<script setup lang="ts">
import { ref, computed } from 'vue'
import {
  Send as SendIcon, Smile as SmileIcon, Paperclip as PaperclipIcon, Image as ImageIcon, Phone as PhoneIcon, Video as VideoIcon, MoreVertical as MoreVerticalIcon,
  Search as SearchIcon, Plus as PlusIcon, Check as CheckIcon, CheckCheck as CheckCheckIcon, Circle as CircleIcon
} from '@lucide/vue'
import { useChat } from '@/composables/useChat'
import { onMounted } from 'vue'
import UserAvatar from '@/components/UserAvatar.vue'
import EmptyState from '@/components/EmptyState.vue'
import { formatRelativeTime } from '@/utils/formatters'
import Skeleton from '@/components/ui/Skeleton.vue'
import { MessageCircle as MessageCircleIcon } from '@lucide/vue'

const { conversations, messages, isLoading, fetchConversations, fetchMessages, sendMessage: apiSendMessage } = useChat()
const selectedConversation = ref<any>(null)
const newMessage = ref('')

const isInitialLoading = ref(true)

onMounted(async () => {
  isInitialLoading.value = true
  await fetchConversations()
  if (conversations.value.length > 0) {
    selectedConversation.value = conversations.value[0]
    await fetchMessages(selectedConversation.value.id)
  }
  isInitialLoading.value = false
})
const searchChat = ref('')
const showMobileChat = ref(false)

const filteredConversations = computed(() => {
  if (!searchChat.value) return conversations.value
  return conversations.value.filter(c =>
    c.name.toLowerCase().includes(searchChat.value.toLowerCase())
  )
})

const selectConversation = async (conv: any) => {
  selectedConversation.value = conv
  showMobileChat.value = true
  await fetchMessages(conv.id)
}

const handleSendMessage = async () => {
  if (!newMessage.value.trim() || !selectedConversation.value) return
  await apiSendMessage(selectedConversation.value.id, newMessage.value)
  newMessage.value = ''
}
</script>

<template>
  <div class="flex h-[calc(100vh-4rem)] overflow-hidden">
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
            'flex items-center gap-3 px-4 py-3 cursor-pointer transition-all duration-200 border-b border-gray-100 dark:border-surface-700/50',
            selectedConversation?.id === conv.id
              ? 'bg-primary-50 dark:bg-primary-900/10 border-l-2 border-l-primary-500'
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
              <p class="text-sm font-semibold text-gray-900 dark:text-white truncate">{{ conv.name }}</p>
              <span class="text-xs text-gray-400 shrink-0 ml-2">{{ conv.lastMessageTime }}</span>
            </div>
            <div class="flex items-center justify-between mt-0.5">
              <p class="text-xs text-gray-500 dark:text-gray-400 truncate">{{ conv.lastMessage }}</p>
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
            ←
          </button>
          <div class="relative">
            <UserAvatar v-if="selectedConversation && !isInitialLoading" :user="{ name: selectedConversation.name, avatar: selectedConversation.avatar }" size="sm" />
            <Skeleton v-else type="avatar" class="w-8 h-8" rounded="rounded-full" />
            <div v-if="selectedConversation?.isOnline && !isInitialLoading" class="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full ring-2 ring-white dark:ring-surface-800" />
          </div>
          <div>
            <template v-if="selectedConversation && !isInitialLoading">
              <p class="text-sm font-semibold text-gray-900 dark:text-white">{{ selectedConversation.name }}</p>
              <p class="text-xs text-green-500" v-if="selectedConversation.isOnline">Đang hoạt động</p>
              <p class="text-xs text-gray-400" v-else>Hoạt động 15 phút trước</p>
            </template>
            <template v-else>
              <Skeleton type="text" class="w-24 h-4 mb-1" />
              <Skeleton type="text" class="w-16 h-3" />
            </template>
          </div>
        </div>
        <div class="flex items-center gap-1">
          <button class="p-2 rounded-xl text-gray-500 hover:bg-gray-100 dark:hover:bg-surface-700 transition-colors">
            <PhoneIcon :size="18" />
          </button>
          <button class="p-2 rounded-xl text-gray-500 hover:bg-gray-100 dark:hover:bg-surface-700 transition-colors">
            <VideoIcon :size="18" />
          </button>
          <button class="p-2 rounded-xl text-gray-500 hover:bg-gray-100 dark:hover:bg-surface-700 transition-colors">
            <MoreVerticalIcon :size="18" />
          </button>
        </div>
      </div>

      <!-- Messages -->
      <div class="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-gray-50 dark:bg-surface-900">
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
          <div
            :class="[
              'max-w-[75%] sm:max-w-[60%] px-4 py-2.5 rounded-2xl text-sm',
              msg.isOwn
                ? 'bg-primary-500 text-white rounded-br-md'
                : 'bg-white dark:bg-surface-800 text-gray-700 dark:text-gray-300 rounded-bl-md border border-gray-200 dark:border-surface-700'
            ]"
          >
            <p>{{ msg.content }}</p>
            <div :class="['flex items-center justify-end gap-1 mt-1', msg.isOwn ? 'text-primary-100' : 'text-gray-400']">
              <span class="text-[10px]">{{ msg.createdAt }}</span>
              <CheckCheckIcon v-if="msg.isOwn" :size="12" />
            </div>
          </div>
        </div>
        </template>
      </div>

      <!-- Message Input -->
      <div class="px-4 py-3 border-t border-gray-200 dark:border-surface-700 bg-white dark:bg-surface-800">
        <div class="flex items-end gap-2">
          <div class="flex items-center gap-1">
            <button class="p-2 rounded-xl text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-surface-700 transition-colors">
              <PaperclipIcon :size="18" />
            </button>
            <button class="p-2 rounded-xl text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-surface-700 transition-colors">
              <ImageIcon :size="18" />
            </button>
          </div>
          <div class="flex-1 flex items-end gap-2 bg-gray-100 dark:bg-surface-700 rounded-2xl px-4 py-2">
            <textarea
              v-model="newMessage"
              @keydown.enter.exact.prevent="handleSendMessage"
              placeholder="Nhập tin nhắn..."
              rows="1"
              class="flex-1 bg-transparent border-none outline-none text-sm text-gray-700 dark:text-gray-300 placeholder-gray-400 resize-none max-h-24"
            />
            <button class="p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
              <SmileIcon :size="18" />
            </button>
          </div>
          <button
            @click="handleSendMessage"
            class="p-3 rounded-xl gradient-primary text-white hover:opacity-90 transition-all shadow-lg shadow-primary-500/25"
          >
            <SendIcon :size="18" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
