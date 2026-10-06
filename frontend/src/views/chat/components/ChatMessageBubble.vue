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
import ChatMessageReadReceipt from './ChatMessageReadReceipt.vue'
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
  <div class="flex items-end gap-2 max-w-[70%] sm:max-w-[65%] relative">
    <UserAvatar v-if="!msg.isOwn" :user="msg.sender" size="sm" class="shrink-0 mb-1" />

    <div class="flex flex-col min-w-0" :class="msg.isOwn ? 'items-end' : 'items-start'">
      <div class="relative group/bubble flex items-center gap-2 min-w-0">
        <div :class="[
        'relative rounded-2xl text-[15px] leading-relaxed min-w-0',
        (msg.type === 'image' && !msg.content) ? '' : 'px-4 py-2.5 shadow-sm border',
        (msg.type === 'image' && !msg.content) ? '' : (msg.isRevoked ? 'bg-gray-100 dark:bg-surface-800 text-gray-500 italic border-gray-200 dark:border-surface-700' :
        msg.isOwn ? 'bg-primary-500 text-white border-primary-600 rounded-br-sm' : 'bg-white dark:bg-surface-800 text-gray-900 dark:text-gray-100 border-gray-200 dark:border-surface-700 rounded-bl-sm'),
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
          <p v-if="msg.type === 'text'" class="wrap-break-word break-all whitespace-pre-wrap min-w-0">{{ msg.content }}</p>

          <!-- Image message -->
          <div v-else-if="msg.type === 'image'" class="space-y-1">
            <img :src="msg.imageUrl" alt="Attachment" class="max-w-full sm:max-w-xs cursor-pointer hover:opacity-95 transition-opacity object-cover border border-black/5" :class="[msg.isOwn ? (msg.content ? 'rounded-xl' : 'rounded-2xl rounded-br-sm') : (msg.content ? 'rounded-xl' : 'rounded-2xl rounded-bl-sm')]" @click="viewImage(msg.imageUrl!)" />
            <p v-if="msg.content" class="text-sm px-1.5 pb-1 pt-1">{{ msg.content }}</p>
          </div>

          <!-- File message -->
          <div v-else-if="msg.type === 'file'" class="flex items-center gap-2">
            <div class="w-8 h-8 rounded-xl bg-white/20 dark:bg-surface-700 flex items-center justify-center shrink-0">
              <component :is="getFileIcon(msg.fileName!)" :size="16" />
            </div>
            <div class="flex-1 min-w-0 pr-2">
              <p class="text-sm font-medium truncate" :class="msg.isOwn ? 'text-white' : 'text-gray-900 dark:text-white'">{{ msg.fileName }}</p>
              <p class="text-xs opacity-80">{{ msg.fileSize }}</p>
            </div>
            <button @click="downloadFile(msg.fileUrl, msg.fileName)" class="p-2 rounded-lg bg-white/20 hover:bg-white/30 dark:bg-surface-700 dark:hover:bg-surface-600 transition-colors shrink-0">
              <DownloadIcon :size="16" />
            </button>
          </div>
        </template>

        <!-- Time + Status -->
        <div class="flex items-center justify-end gap-1.5 mt-1" :class="[msg.type === 'image' && !msg.content ? 'px-1 opacity-60 text-gray-500 dark:text-gray-400' : 'opacity-70']">
          <span class="text-[10px] whitespace-nowrap">{{ formatMessageTime(msg.timestamp || msg.createdAt).split(' ')[1] }}</span>
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
      <ChatMessageReadReceipt 
        v-if="isLastOwnWithReadStatus(msg)" 
        :msg="msg" 
        :conversation="selectedConversation" 
      />
    </div>
  </div>
</template>
