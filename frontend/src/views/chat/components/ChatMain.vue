<script setup lang="ts">
import { inject } from 'vue'
import {
  ChevronLeft as ChevronLeftIcon,
  Phone as PhoneIcon,
  Video as VideoIcon,
  Info as InfoIcon,
  Pin as PinIcon,
  X as XIcon,
  Reply as ReplyIcon,
  Download as DownloadIcon,
  MoreVertical as MoreVerticalIcon,
  Trash2 as TrashIcon,
  Flag as FlagIcon,
  ArrowDown as ArrowDownIcon,
  Paperclip as PaperclipIcon,
  Image as ImageIcon,
  Smile as SmileIcon,
  Send as SendIcon,
  CornerUpLeft as CornerUpLeftIcon,
  User as UserIcon,
  Check as CheckIcon,
  CheckCheck as CheckCheckIcon
} from '@lucide/vue'
import ChatSearchBar from './ChatSearchBar.vue'
import Skeleton from '@/components/ui/Skeleton.vue'
import UserAvatar from '@/components/UserAvatar.vue'
import ChatHeader from './ChatHeader.vue'
import ChatMessageBubble from './ChatMessageBubble.vue'
import ChatInputArea from './ChatInputArea.vue'
import ChatTypingIndicator from './ChatTypingIndicator.vue'
import ChatPinnedMessageBar from './ChatPinnedMessageBar.vue'
import ChatMessageSkeleton from './ChatMessageSkeleton.vue'
import type { ChatMessage } from '@/types'

const chatState = inject<any>('chatState')
if (!chatState) {
  throw new Error('ChatState is not provided')
}

const {
  router,
  currentUser,
  selectedConversation,
  messages,
  isLoading,
  isTyping,
  typingUser,
  newMessage,
  isInitialLoading,
  showMobileChat,
  showInfoPanel,
  showEmojiPicker,
  showSearchInChat,
  searchQuery,
  searchResults,
  replyingTo,
  activeActionMenu,
  chatContainer,
  showScrollBottom,
  pinnedMessage,
  emojiList,
  formatMessageTime,
  scrollToBottom,
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
  startCall,
  viewImage,
  downloadFile,
  insertEmoji,
  setReplyTo,
  getMessageStatusLabel,
  isLastOwnWithReadStatus
} = chatState

const getFileIcon = (fileName: string) => {
  return PaperclipIcon
}

// Ensure elements can be clicked outside
</script>

<template>
      <!-- Chat Column -->
      <div class="flex-1 flex flex-col min-w-0" v-if="selectedConversation || isInitialLoading">
      <!-- Chat Header -->
      <ChatHeader />

      <ChatPinnedMessageBar
        v-if="pinnedMessage"
        :pinned-message="pinnedMessage"
        @unpin="handlePinMessage"
      />

      <!-- Search in Chat Bar -->
      <ChatSearchBar
        :show-search-in-chat="showSearchInChat"
        :search-query="searchQuery"
        :search-results="searchResults"
        @update:search-query="val => searchQuery = val"
        @perform-search="handlePerformSearch"
        @close-search="closeSearch"
        @clear-search="searchQuery = ''; searchResults = []"
      />

      <!-- Messages -->
      <div
        ref="chatContainer"
        class="flex-1 overflow-y-auto overflow-x-hidden p-4 space-y-4 bg-gray-50/50 dark:bg-surface-900/50 relative"
        @scroll="handleScroll"
      >
        <ChatMessageSkeleton v-if="isLoading" />

        <template v-else>
          <div v-for="(msg, index) in messages" :key="msg.id">
            <template v-if="Number(index) === 0 || formatMessageTime(msg.timestamp || msg.createdAt).split(' ')[0] !== formatMessageTime(messages[Number(index) - 1].timestamp || messages[Number(index) - 1].createdAt).split(' ')[0]">
              <div class="flex justify-center my-6">
                <span class="px-3 py-1 bg-gray-200/50 dark:bg-surface-700/50 rounded-full text-xs font-medium text-gray-500 dark:text-gray-400">
                  {{ formatMessageTime(msg.timestamp || msg.createdAt).split(' ')[0] }}
                </span>
              </div>
            </template>

            <div :class="['group relative flex flex-col', msg.isOwn ? 'items-end' : 'items-start', 'mb-2']">
              <!-- Reply indicator -->
              <div v-if="msg.replyTo" class="flex items-center gap-1.5 mb-1 text-xs text-gray-500 opacity-80 pl-2">
                <CornerUpLeftIcon :size="12" />
                <span>Trả lời {{ msg.replyTo.sender?.name || 'Ai đó' }}:</span>
                <span class="truncate max-w-37.5">{{ msg.replyTo.content || 'Đính kèm' }}</span>
              </div>

              <!-- Message bubble -->
              <ChatMessageBubble :msg="msg" />
            </div>
          </div>

          <ChatTypingIndicator
            v-if="isTyping"
            :user="selectedConversation?.participants.find((p: any) => p.name === typingUser) || selectedConversation?.participants[1]"
          />
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

      <ChatInputArea />
      </div>
</template>
