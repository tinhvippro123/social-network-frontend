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
import Skeleton from '@/components/ui/Skeleton.vue'
import UserAvatar from '@/components/UserAvatar.vue'
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
      <div class="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-gray-200 dark:border-surface-700 bg-white dark:bg-surface-800">
        <div class="flex items-center gap-3">
          <button
            @click="showMobileChat = false"
            class="sm:hidden p-1 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-surface-700 mr-1"
          >
            <ChevronLeftIcon :size="20" />
          </button>
          <div class="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity" @click="router.push(`/profile/${selectedConversation?.id}`)">
            <div class="relative">
              <UserAvatar v-if="selectedConversation && !isInitialLoading" :user="{ name: selectedConversation.name, avatar: selectedConversation.avatar }" size="sm" />
              <Skeleton v-else type="avatar" class="w-8 h-8" rounded="rounded-full" />
              <div v-if="selectedConversation?.isOnline && !isInitialLoading" class="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full ring-2 ring-white dark:ring-surface-800" />
            </div>
            <div class="text-left">
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
        </div>
        <div class="flex items-center gap-1">
              <button @click="handlePerformSearch" class="p-2 text-gray-400 hover:text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-xl transition-colors">
            <PhoneIcon :size="18" />
          </button>
              <button @click="startCall('video')" class="p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-surface-700 rounded-xl transition-colors">
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
            <p class="text-sm text-gray-600 dark:text-gray-400 truncate">{{ pinnedMessage.content }}</p>
          </div>
        </div>
        <button @click.stop="handlePinMessage(pinnedMessage.id)" class="p-1 rounded-lg text-primary-600 hover:bg-primary-100 dark:hover:bg-primary-900/50 transition-colors shrink-0">
          <XIcon :size="16" />
        </button>
      </div>

      <!-- Search in Chat Bar -->
      <div v-if="showSearchInChat" class="px-4 py-2 bg-white dark:bg-surface-800 border-b border-gray-200 dark:border-surface-700">
        <div class="flex items-center gap-2">
          <div class="flex-1 flex items-center gap-2 bg-gray-100 dark:bg-surface-700 rounded-xl px-3 py-1.5 border border-gray-200 dark:border-surface-700 focus-within:border-primary-500 transition-colors">
            <input
              v-model="searchQuery"
              @keydown.enter="handlePerformSearch"
              type="text"
              placeholder="Tìm kiếm trong cuộc trò chuyện..."
              class="flex-1 bg-transparent border-none outline-none text-sm text-gray-700 dark:text-gray-300"
              autofocus
            />
            <button v-if="searchQuery" @click="searchQuery = ''; searchResults = []" class="p-0.5 text-gray-400 hover:text-gray-600">
              <XIcon :size="14" />
            </button>
          </div>
          <button @click="closeSearch" class="text-sm font-medium text-primary-500 hover:text-primary-600">Xong</button>
        </div>
        <div v-if="searchResults.length > 0" class="mt-2 text-xs text-gray-500 flex justify-between">
          <span>Tìm thấy {{ searchResults.length }} kết quả</span>
          <div class="flex items-center gap-2">
            <button class="hover:text-primary-500"><ChevronLeftIcon :size="14" /></button>
            <span>1 / {{ searchResults.length }}</span>
            <button class="hover:text-primary-500"><ChevronLeftIcon :size="14" class="rotate-180" /></button>
          </div>
        </div>
      </div>

      <!-- Messages -->
      <div
        ref="chatContainer"
        class="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50 dark:bg-surface-900/50 relative scroll-smooth"
        @scroll="handleScroll"
      >
        <div v-if="isLoading" class="flex justify-center py-4">
          <div class="flex gap-1">
            <span class="w-2 h-2 bg-primary-500 rounded-full animate-bounce" style="animation-delay: 0ms" />
            <span class="w-2 h-2 bg-primary-500 rounded-full animate-bounce" style="animation-delay: 150ms" />
            <span class="w-2 h-2 bg-primary-500 rounded-full animate-bounce" style="animation-delay: 300ms" />
          </div>
        </div>

        <template v-else>
          <div v-for="(msg, index) in messages" :key="msg.id">
            <!-- Date separator -->
            <div v-if="index === 0 || formatMessageTime(msg.timestamp).split(' ')[0] !== formatMessageTime(messages[index - 1].timestamp).split(' ')[0]" class="flex justify-center my-6">
              <span class="px-3 py-1 bg-gray-200/50 dark:bg-surface-700/50 rounded-full text-xs font-medium text-gray-500 dark:text-gray-400">
                {{ formatMessageTime(msg.timestamp).split(' ')[0] }}
              </span>
            </div>

            <div :class="['group relative flex flex-col', msg.isOwn ? 'items-end' : 'items-start', 'mb-2']">
              <!-- Reply indicator -->
              <div v-if="msg.replyTo" class="flex items-center gap-1.5 mb-1 text-xs text-gray-500 opacity-80 pl-2">
                <CornerUpLeftIcon :size="12" />
                <span>Trả lời {{ msg.replyTo.sender?.name || 'Ai đó' }}:</span>
                <span class="truncate max-w-[150px]">{{ msg.replyTo.content || 'Đính kèm' }}</span>
              </div>

              <!-- Message bubble -->
              <div class="flex items-end gap-2 max-w-[85%] sm:max-w-[70%] relative">
                <UserAvatar v-if="!msg.isOwn" :user="msg.sender" size="sm" class="shrink-0 mb-1" />

                <div class="relative group/bubble flex items-center gap-2">
                  <div :class="[
                    'relative px-4 py-2.5 rounded-2xl shadow-sm border text-[15px] leading-relaxed',
                    msg.isRevoked ? 'bg-gray-100 dark:bg-surface-800 text-gray-500 italic border-gray-200 dark:border-surface-700' :
                    msg.isOwn ? 'bg-primary-500 text-white border-primary-600 rounded-br-sm' : 'bg-white dark:bg-surface-800 text-gray-900 dark:text-gray-100 border-gray-200 dark:border-surface-700 rounded-bl-sm',
                    searchResults.find(r => r.id === msg.id) ? 'ring-2 ring-yellow-400 ring-offset-2 dark:ring-offset-surface-900' : ''
                  ]">
                    <!-- Revoked message -->
                    <template v-if="msg.isRevoked">
                      <span class="flex items-center gap-1.5 opacity-70">
                        <TrashIcon :size="14" /> Tin nhắn đã được thu hồi
                      </span>
                    </template>
                    <template v-else>
                      <!-- Text message -->
                      <p v-if="msg.type === 'text'" class="break-words whitespace-pre-wrap">{{ msg.content }}</p>

                      <!-- Image message -->
                      <div v-else-if="msg.type === 'image'" class="space-y-2">
                        <img :src="msg.imageUrl" alt="Attachment" class="max-w-[240px] sm:max-w-xs rounded-xl cursor-pointer hover:opacity-95 transition-opacity border border-black/5" @click="viewImage(msg.imageUrl!)" />
                        <p v-if="msg.content" class="text-sm">{{ msg.content }}</p>
                      </div>

                      <!-- File message -->
                      <div v-else-if="msg.type === 'file'" class="flex items-center gap-3 p-1">
                        <div class="w-10 h-10 rounded-xl bg-white/20 dark:bg-surface-700 flex items-center justify-center shrink-0">
                          <component :is="getFileIcon(msg.fileName!)" :size="20" />
                        </div>
                        <div class="flex-1 min-w-0 pr-4">
                          <p class="text-sm font-medium truncate" :class="msg.isOwn ? 'text-white' : 'text-gray-900 dark:text-white'">{{ msg.fileName }}</p>
                          <p class="text-xs opacity-80">{{ msg.fileSize }}</p>
                        </div>
                        <button @click="downloadFile(msg.fileUrl, msg.fileName)" class="p-2 rounded-lg bg-white/20 hover:bg-white/30 dark:bg-surface-700 dark:hover:bg-surface-600 transition-colors">
                          <DownloadIcon :size="16" />
                        </button>
                      </div>
                    </template>

                    <!-- Time + Status -->
                    <div class="flex items-center justify-end gap-1.5 mt-1 opacity-70">
                      <span class="text-[10px] whitespace-nowrap">{{ formatMessageTime(msg.timestamp).split(' ')[1] }}</span>
                      <!-- Message status for own messages -->
                      <template v-if="msg.isOwn">
                        <CheckIcon v-if="msg.status === 'sent' || msg.status === 'delivered'" :size="12" />
                        <CheckCheckIcon v-if="msg.status === 'read'" :size="12" class="text-blue-300" />
                      </template>
                    </div>

                    <!-- Reactions -->
                    <div v-if="msg.reactions && msg.reactions.length > 0" class="absolute -bottom-3 flex flex-wrap gap-1" :class="msg.isOwn ? 'right-2' : 'left-2'">
                      <div v-for="(reaction, rIdx) in msg.reactions" :key="rIdx" class="px-1.5 py-0.5 rounded-full bg-white dark:bg-surface-700 border border-gray-100 dark:border-surface-600 shadow-sm text-[11px] flex items-center gap-1">
                        <span>{{ reaction.emoji }}</span>
                        <span v-if="reaction.users.length > 1" class="font-medium text-gray-500">{{ reaction.users.length }}</span>
                      </div>
                    </div>
                  </div>

                  <!-- Message Actions (hover) -->
                  <div
                    v-if="!msg.isRevoked"
                    :class="[
                      'absolute top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-0 group-hover/bubble:opacity-100 transition-opacity',
                      msg.isOwn ? 'right-full mr-2' : 'left-full ml-2'
                    ]"
                  >
                    <!-- React Dropdown -->
                    <div class="relative">
                      <button @click.stop="toggleActionMenu(msg.id + '-react')" class="p-1.5 rounded-full bg-white dark:bg-surface-800 shadow-sm text-gray-400 hover:text-primary-500 hover:bg-gray-50 border border-gray-100 dark:border-surface-700 transition-all z-10">
                        <SmileIcon :size="16" />
                      </button>
                      <div v-if="activeActionMenu === msg.id + '-react'" class="absolute bottom-full mb-2 bg-white dark:bg-surface-800 p-1.5 rounded-2xl shadow-xl border border-gray-200 dark:border-surface-700 flex gap-1 z-50" :class="msg.isOwn ? 'right-0' : 'left-0'">
                        <button v-for="emoji in ['👍', '❤️', '😂', '😮', '😢', '🙏']" :key="emoji" @click.stop="handleAddReaction(msg.id, emoji)" class="w-8 h-8 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-surface-700 rounded-full text-lg transition-transform hover:scale-110">
                          {{ emoji }}
                        </button>
                      </div>
                    </div>

                    <!-- Reply -->
                    <button @click.stop="setReplyTo(msg)" class="p-1.5 rounded-full bg-white dark:bg-surface-800 shadow-sm text-gray-400 hover:text-primary-500 hover:bg-gray-50 border border-gray-100 dark:border-surface-700 transition-all z-10">
                      <ReplyIcon :size="16" />
                    </button>

                    <!-- More -->
                    <div class="relative">
                      <button @click.stop="toggleActionMenu(msg.id)" class="p-1.5 rounded-full bg-white dark:bg-surface-800 shadow-sm text-gray-400 hover:text-primary-500 hover:bg-gray-50 border border-gray-100 dark:border-surface-700 transition-all z-10">
                        <MoreVerticalIcon :size="16" />
                      </button>
                      <!-- More Dropdown -->
                      <div v-if="activeActionMenu === msg.id" class="absolute bottom-full mb-2 w-48 bg-white dark:bg-surface-800 rounded-xl shadow-xl border border-gray-200 dark:border-surface-700 py-1 z-50" :class="msg.isOwn ? 'right-0' : 'left-0'">
                        <button @click.stop="setReplyTo(msg)" class="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-surface-700 text-left">
                          <ReplyIcon :size="16" />
                          Trả lời
                        </button>
                        <button @click.stop="handlePinMessage(msg.id)" class="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-surface-700 text-left">
                          <PinIcon :size="16" />
                          Ghim tin nhắn
                        </button>
                        <button v-if="msg.isOwn" @click.stop="handleRevokeMessage(msg.id)" class="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-surface-700 text-left">
                          <CornerUpLeftIcon :size="16" />
                          Thu hồi
                        </button>
                        <div class="h-px bg-gray-200 dark:bg-surface-700 my-1"></div>
                        <button v-if="msg.isOwn" @click.stop="handleDeleteMessage(msg.id)" class="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 text-left">
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
                    <UserAvatar
                      v-else-if="selectedConversation"
                      :user="selectedConversation.participants[1]"
                      class="w-5 h-5 cursor-default ring-[1.5px] ring-white dark:ring-surface-800"
                      size="sm"
                      :title="selectedConversation.participants[1].name"
                    />
                  </div>
                </div>
              </div>
            </div>

            <!-- Typing indicator -->
            <div v-if="isTyping" class="flex items-end gap-2 mt-2">
              <UserAvatar :user="selectedConversation?.participants.find((p: any) => p.name === typingUser) || selectedConversation?.participants[1]" size="sm" class="w-7 h-7 shrink-0" />
              <div class="bg-white dark:bg-surface-800 rounded-2xl rounded-bl-md px-4 py-3 border border-gray-200 dark:border-surface-700">
                <div class="flex gap-1">
                  <span class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0ms" />
                  <span class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 150ms" />
                  <span class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 300ms" />
                </div>
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
          <p class="text-xs text-gray-500 truncate">{{ replyingTo.content || (replyingTo.type === 'image' ? 'Hình ảnh' : 'Tệp đính kèm ' + replyingTo.fileName) }}</p>
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
            :disabled="!newMessage?.trim()"
            class="p-3 rounded-xl gradient-primary text-white hover:opacity-90 transition-all shadow-lg shadow-primary-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <SendIcon :size="18" />
          </button>
        </div>
      </div>
      </div>
</template>
