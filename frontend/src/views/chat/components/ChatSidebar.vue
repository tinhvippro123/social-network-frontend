<script setup lang="ts">
import { inject } from 'vue'
import {
  Plus as PlusIcon, Search as SearchIcon, MessageCircle as MessageCircleIcon,
  Pin as PinIcon, BellOff as BellOffIcon, Trash2 as TrashIcon, Ban as BanIcon
} from '@lucide/vue'
import Skeleton from '@/components/ui/Skeleton.vue'
import UserAvatar from '@/components/UserAvatar.vue'

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
  blockUser
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
            <Skeleton type="avatar" class="w-12 h-12" />
            <div class="flex-1 space-y-2">
              <Skeleton type="text" class="w-1/2 h-4" />
              <Skeleton type="text" class="w-3/4 h-3" />
            </div>
          </div>
        </div>

        <div v-else-if="!isInitialLoading && conversations.length === 0" class="flex flex-col items-center justify-center h-full p-4 text-center opacity-50">
          <MessageCircleIcon :size="48" class="mb-4 text-gray-400" />
          <p class="text-gray-500 dark:text-gray-400">Chưa có tin nhắn nào</p>
        </div>

        <div
          v-else
          v-for="conv in filteredConversations"
          :key="conv.id"
          @click="selectConversation(conv)"
          :class="[
            'flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all group relative',
            selectedConversation?.id === conv.id
              ? 'bg-primary-50 dark:bg-primary-500/10'
              : 'hover:bg-gray-50 dark:hover:bg-surface-700/50'
          ]"
        >
          <!-- Avatar -->
          <div class="relative shrink-0">
            <UserAvatar :user="{ avatar: conv.avatar, name: conv.name }" size="md" />
            <div
              v-if="conv.isOnline"
              class="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full ring-2 ring-white dark:ring-surface-800"
            />
            <div
              v-if="conv.isPinned"
              class="absolute -top-1 -right-1 w-4 h-4 bg-gray-600 rounded-full flex items-center justify-center ring-2 ring-white dark:ring-surface-800"
            >
              <PinIcon :size="10" class="text-white" />
            </div>
          </div>

          <!-- Info -->
          <div class="flex-1 min-w-0">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-1.5">
                <h3 :class="[
                  'font-medium truncate',
                  conv.unreadCount > 0 ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'
                ]">
                  {{ conv.name }}
                </h3>
                <BellOffIcon v-if="conv.isMuted" :size="12" class="text-gray-400 shrink-0" />
              </div>
              <span class="text-xs text-gray-500 shrink-0 ml-2">
                {{ formatMessageTime(conv.lastMessage.timestamp) }}
              </span>
            </div>
            <div class="flex items-center justify-between mt-0.5">
              <div class="flex items-center gap-1 min-w-0">
                <span v-if="conv.lastMessage.isOwn" class="text-xs text-gray-500 shrink-0">Bạn:</span>
                <p :class="[
                  'text-sm truncate',
                  conv.unreadCount > 0 ? 'font-semibold text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'
                ]">
                  {{ conv.lastMessage.content }}
                </p>
              </div>
              <span
                v-if="conv.unreadCount > 0"
                class="ml-2 w-5 h-5 bg-primary-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full shrink-0"
              >
                {{ conv.unreadCount > 99 ? '99+' : conv.unreadCount }}
              </span>
            </div>
          </div>

          <!-- Hover Actions -->
          <div class="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-white dark:bg-surface-800 p-1 rounded-lg shadow-sm border border-gray-200 dark:border-surface-700">
            <button @click.stop="pinConversation(conv.id)" class="p-1.5 hover:bg-gray-100 dark:hover:bg-surface-700 rounded-md text-gray-500 tooltip" :data-tip="conv.isPinned ? 'Bỏ ghim' : 'Ghim'">
              <PinIcon :size="14" />
            </button>
            <button @click.stop="muteConversation(conv.id)" class="p-1.5 hover:bg-gray-100 dark:hover:bg-surface-700 rounded-md text-gray-500 tooltip" :data-tip="conv.isMuted ? 'Bật thông báo' : 'Tắt thông báo'">
              <BellOffIcon :size="14" />
            </button>
            <div class="w-px h-4 bg-gray-200 dark:bg-surface-700 mx-1"></div>
            <button @click.stop="deleteConversation(conv.id)" class="p-1.5 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-md text-red-500 tooltip" data-tip="Xóa đoạn chat">
              <TrashIcon :size="14" />
            </button>
            <button @click.stop="blockUser(conv.id)" class="p-1.5 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-md text-red-500 tooltip" data-tip="Chặn">
              <BanIcon :size="14" />
            </button>
          </div>
        </div>
      </div>
    </div>
</template>
