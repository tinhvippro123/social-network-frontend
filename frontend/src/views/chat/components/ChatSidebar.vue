<script setup lang="ts">
import { inject } from 'vue'
import {
  Plus as PlusIcon, Search as SearchIcon, MessageCircle as MessageCircleIcon,
  Pin as PinIcon, BellOff as BellOffIcon, Trash2 as TrashIcon, Ban as BanIcon
} from '@lucide/vue'
import Skeleton from '@/components/ui/Skeleton.vue'
import UserAvatar from '@/components/UserAvatar.vue'
import ChatConversationItem from './ChatConversationItem.vue'
import ChatSidebarSkeletonItem from './ChatSidebarSkeletonItem.vue'

// Inject the shared chat state
const chatState = inject<any>('chatState')

if (!chatState) {
  throw new Error('ChatState is not provided')
}

// Destructure what we need for the sidebar
const {
  showMobileChat,
  searchChat,
  isInitialLoading,
  conversations,
  filteredConversations,
  selectedConversation,
  formatMessageTime,
  selectConversation,
  pinConversation,
  muteConversation,
  deleteConversation,
  blockUser,
  showNewChatModal,
  createNewConversation
} = chatState
</script>

<template>
    <!-- Conversations List -->
    <div
      :class="[
        'w-full sm:w-90 shrink-0 flex flex-col bg-white dark:bg-surface-800 border-r border-gray-200 dark:border-surface-700',
        showMobileChat ? 'hidden sm:flex' : 'flex'
      ]"
    >
      <!-- Header -->
      <div class="px-4 py-4 border-b border-gray-200 dark:border-surface-700">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-xl font-bold text-gray-900 dark:text-white">Tin nhắn</h2>
          <button @click="showNewChatModal = true" class="p-2 rounded-xl text-gray-500 hover:bg-gray-100 dark:hover:bg-surface-700 transition-colors">
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
          <ChatSidebarSkeletonItem v-for="i in 5" :key="i" />
        </div>

        <div v-else-if="!isInitialLoading && conversations.length === 0" class="flex flex-col items-center justify-center h-full p-4 text-center opacity-50">
          <MessageCircleIcon :size="48" class="mb-4 text-gray-400" />
          <p class="text-gray-500 dark:text-gray-400">Chưa có tin nhắn nào</p>
        </div>

        <ChatConversationItem
          v-else
          v-for="conv in filteredConversations"
          :key="conv.id"
          :conv="conv"
          :is-selected="selectedConversation?.id === conv.id"
          :format-message-time="formatMessageTime"
          @select="selectConversation(conv)"
          @pin="pinConversation(conv.id)"
          @mute="muteConversation(conv.id)"
          @delete="deleteConversation(conv.id)"
          @block="blockUser(conv.id)"
        />
      </div>
    </div>
</template>
