<script setup lang="ts">
import { inject } from 'vue'
import {
  Trash2 as TrashIcon,
  Download as DownloadIcon,
  Paperclip as PaperclipIcon,
  Check as CheckIcon,
  CheckCheck as CheckCheckIcon
} from '@lucide/vue'
import UserAvatar from '@/components/UserAvatar.vue'
import ChatMessageActions from './ChatMessageActions.vue'
import type { ChatMessage } from '@/types'
import { computed } from 'vue'

const props = defineProps<{
  msg: ChatMessage
}>()

const chatState = inject<any>('chatState')
if (!chatState) {
  throw new Error('ChatState is not provided')
}

const {
  searchResults,
  activeActionMenu,
  selectedConversation,
  formatMessageTime,
  viewImage,
  downloadFile,
  toggleActionMenu,
  handleAddReaction,
  setReplyTo,
  handlePinMessage,
  handleRevokeMessage,
  handleDeleteMessage,
  isLastOwnWithReadStatus
} = chatState

const getFileIcon = (fileName: string) => {
  return PaperclipIcon
}

const groupedReactions = computed(() => {
  if (!props.msg.reactions) return []
  const groups = new Map<string, any[]>()
  props.msg.reactions.forEach(r => {
    if (!groups.has(r.emoji)) groups.set(r.emoji, [])
    groups.get(r.emoji)!.push({ id: r.userId, name: r.userName })
  })
  return Array.from(groups.entries()).map(([emoji, users]) => ({ emoji, users }))
})
</script>

<template>
  <div class="flex items-end gap-2 max-w-[85%] sm:max-w-[70%] relative">
    <UserAvatar v-if="!msg.isOwn" :user="msg.sender" size="sm" class="shrink-0 mb-1" />

    <div class="relative group/bubble flex items-center gap-2">
      <div :class="[
        'relative px-4 py-2.5 rounded-2xl shadow-sm border text-[15px] leading-relaxed',
        msg.isRevoked ? 'bg-gray-100 dark:bg-surface-800 text-gray-500 italic border-gray-200 dark:border-surface-700' :
        msg.isOwn ? 'bg-primary-500 text-white border-primary-600 rounded-br-sm' : 'bg-white dark:bg-surface-800 text-gray-900 dark:text-gray-100 border-gray-200 dark:border-surface-700 rounded-bl-sm',
        searchResults.find((r: any) => r.id === msg.id) ? 'ring-2 ring-yellow-400 ring-offset-2 dark:ring-offset-surface-900' : ''
      ]">
        <!-- Revoked message -->
        <template v-if="msg.isRevoked">
          <span class="flex items-center gap-1.5 opacity-70">
            <TrashIcon :size="14" /> Tin nhắn đã được thu hồi
          </span>
        </template>
        <template v-else>
          <!-- Text message -->
          <p v-if="msg.type === 'text'" class="wrap-break-word whitespace-pre-wrap">{{ msg.content }}</p>

          <!-- Image message -->
          <div v-else-if="msg.type === 'image'" class="space-y-2">
            <img :src="msg.imageUrl" alt="Attachment" class="max-w-60 sm:max-w-xs rounded-xl cursor-pointer hover:opacity-95 transition-opacity border border-black/5" @click="viewImage(msg.imageUrl!)" />
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
        <div v-if="groupedReactions.length > 0" class="absolute -bottom-3 flex flex-wrap gap-1" :class="msg.isOwn ? 'right-2' : 'left-2'">
          <div v-for="(reaction, rIdx) in groupedReactions" :key="rIdx" class="px-1.5 py-0.5 rounded-full bg-white dark:bg-surface-700 border border-gray-100 dark:border-surface-600 shadow-sm text-[11px] flex items-center gap-1">
            <span>{{ reaction.emoji }}</span>
            <span v-if="reaction.users.length > 1" class="font-medium text-gray-500">{{ reaction.users.length }}</span>
          </div>
        </div>
      </div>

      <!-- Message Actions (hover) -->
      <ChatMessageActions
        :msg="msg"
        :active-action-menu="activeActionMenu"
        @toggle-action-menu="toggleActionMenu"
        @add-reaction="handleAddReaction"
        @set-reply-to="setReplyTo"
        @pin-message="handlePinMessage"
        @revoke-message="handleRevokeMessage"
        @delete-message="handleDeleteMessage"
      />
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
</template>
