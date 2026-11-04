<script setup lang="ts">
import { ref, nextTick, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import {
  X, Send, Minus, Maximize2,
  Smile, Paperclip, Image as ImageIcon,
  ChevronDown, BellOff, FileText, Download
} from '@lucide/vue'
import type { ChatConversation, ChatMessage } from '@/types'
import ChatMessageActions from '@/views/chat/components/ChatMessageActions.vue'
import ChatPopupHeaderMenu from '@/components/ChatPopupHeaderMenu.vue'
import NicknameModal from '@/components/NicknameModal.vue'
import UserAvatar from '@/components/UserAvatar.vue'
import { useToast } from '@/composables/ui/useToast'
import { useChatNicknames } from '@/composables/chat/useChatNicknames'
import { useWebSocket } from '@/composables/core/useWebSocket'
import chatApi from '@/api/chat.api'
import filesApi from '@/api/files.api'

const router = useRouter()
const toast = useToast()
const { setNickname, applyNicknameToConversation } = useChatNicknames()
const showNicknameModal = ref(false)
const showEmojiPicker = ref(false)
const imageInputRef = ref<HTMLInputElement | null>(null)
const fileInputRef = ref<HTMLInputElement | null>(null)
const quickEmojis = ['😀', '😂', '🥰', '😎', '👍', '❤️', '🔥', '🎉', '🙌', '💯', '🤔', '😭']

const props = defineProps<{
  conv: ChatConversation
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'minimize'): void
}>()

const messages = ref<ChatMessage[]>([])
const newMessage = ref('')
const isLoadingMessages = ref(false)
const activeHeaderMenu = ref(false)
const activeMessageAction = ref<string | null>(null)
const messageContainer = ref<HTMLElement | null>(null)

const { connect: connectWs } = useWebSocket(undefined, (event) => {
  if (!event || event.conversationId !== props.conv.id) return
  if (event.type === 'message.created' && event.payload) {
    const incoming = event.payload as ChatMessage
    if (!messages.value.some(m => m.id === incoming.id)) {
      messages.value.push(incoming)
      scrollToBottom()
    }
  } else if ((event.type === 'message.revoked' || event.type === 'message.updated') && event.payload) {
    const updated = event.payload as ChatMessage
    const idx = messages.value.findIndex(m => m.id === updated.id)
    if (idx >= 0) {
      messages.value[idx] = { ...messages.value[idx], ...updated }
    }
  }
})

async function loadMessages() {
  if (!props.conv?.id || props.conv.id.startsWith('new-')) return
  isLoadingMessages.value = true
  try {
    const { data } = await chatApi.getMessages(props.conv.id)
    messages.value = [...(data.data || [])]
      .reverse()
      .sort((a, b) => {
        const ta = new Date(a.createdAt || a.timestamp || '').getTime()
        const tb = new Date(b.createdAt || b.timestamp || '').getTime()
        if (Number.isNaN(ta) || Number.isNaN(tb)) return 0
        return ta - tb
      })
    scrollToBottom()
    chatApi.markAsRead(props.conv.id).catch(() => {})
  } catch {
    // ignore
  } finally {
    isLoadingMessages.value = false
  }
}

onMounted(() => {
  applyNicknameToConversation(props.conv)
  loadMessages()
  connectWs()
  document.addEventListener('click', handleDocumentClick)
})

onUnmounted(() => document.removeEventListener('click', handleDocumentClick))

function handleSaveNickname(newNick: string) {
  setNickname(props.conv, newNick)
  if (newNick.trim()) {
    toast.success(`Đã đổi biệt danh thành "${newNick.trim()}"`)
  } else {
    toast.info('Đã gỡ bỏ biệt danh')
  }
  showNicknameModal.value = false
}

function openInFullChat() {
  router.push(`/chat?id=${props.conv.id}`)
  emit('close')
}

const toggleHeaderMenu = () => {
  activeHeaderMenu.value = !activeHeaderMenu.value
}

const toggleMessageAction = (msgId: string | null) => {
  const normalized = !msgId || msgId === 'null' ? null : msgId
  activeMessageAction.value = activeMessageAction.value === normalized ? null : normalized
}

async function handleRevokeMessage(msgId: string) {
  try {
    const { data } = await chatApi.revokeMessage(props.conv.id, msgId)
    const idx = messages.value.findIndex(m => m.id === msgId)
    if (idx >= 0) {
      messages.value[idx] = data?.data || {
        ...messages.value[idx],
        isRevoked: true,
        status: 'revoked',
        content: 'Tin nhắn đã bị thu hồi'
      }
    }
    toast.info('Đã thu hồi tin nhắn')
  } catch (err: any) {
    toast.error(err.response?.data?.message || 'Không thể thu hồi tin nhắn')
  }
}

async function handlePinMessage(msgId: string) {
  try {
    const msg = messages.value.find(m => m.id === msgId)
    const nextPinned = !msg?.isPinned
    await chatApi.pinMessage(props.conv.id, msgId, nextPinned)
    if (msg) msg.isPinned = nextPinned
    toast.success(nextPinned ? 'Đã ghim tin nhắn' : 'Đã bỏ ghim tin nhắn')
  } catch (err: any) {
    toast.error(err.response?.data?.message || 'Không thể ghim tin nhắn')
  }
}

function handleAddReaction(msgId: string, emoji: string) {
  const msg = messages.value.find(m => m.id === msgId)
  if (!msg) return
  if (!msg.reactions) msg.reactions = []
  const existingIdx = msg.reactions.findIndex(r => r.emoji === emoji && r.userId === 'me')
  if (existingIdx >= 0) {
    msg.reactions.splice(existingIdx, 1)
  } else {
    msg.reactions.push({ emoji, userId: 'me', userName: 'Bạn' })
  }
}

function handleSetReplyTo(msg: ChatMessage) {
  newMessage.value = `> ${msg.sender?.name || ''}: ${(msg.content || '').slice(0, 40)}\n`
  const textarea = document.getElementById(`chat-textarea-${props.conv.id}`)
  textarea?.focus()
}

const handleDocumentClick = (e: MouseEvent) => {
  const target = e.target as HTMLElement
  if (activeHeaderMenu.value && !target.closest('.header-menu-container')) {
    activeHeaderMenu.value = false
  }
  if (activeMessageAction.value && !target.closest('.message-action-menu')) {
    activeMessageAction.value = null
  }
}

const toDate = (timeStr?: string) => {
  if (!timeStr) return null
  if (timeStr.includes('-') || timeStr.includes('T')) {
    const d = new Date(timeStr)
    return isNaN(d.getTime()) ? null : d
  }
  return null
}

const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime()
const daysAgo = (d: Date) => Math.round((startOfDay(new Date()) - startOfDay(d)) / 86_400_000)
const WEEKDAYS = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7']

function formatClockTime(timeStr?: string): string {
  if (!timeStr) return ''
  if (/^\d{1,2}:\d{2}$/.test(timeStr)) return timeStr
  const d = toDate(timeStr)
  if (!d) return timeStr
  return d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
}

function formatDayLabel(timeStr?: string): string {
  const d = toDate(timeStr)
  if (!d) return 'Hôm nay'
  const diff = daysAgo(d)
  if (diff === 0) return 'Hôm nay'
  if (diff === 1) return 'Hôm qua'
  if (diff < 7) return `${WEEKDAYS[d.getDay()]}, ${d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })}`
  return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

function isSameDay(a?: string, b?: string): boolean {
  if (!a || !b) return true
  const da = toDate(a)
  const db = toDate(b)
  if (!da || !db) return a === b
  return startOfDay(da) === startOfDay(db)
}

function getStatusIcon(status: string) {
  switch (status) {
    case 'sending': return '⏳'
    case 'sent': return '✓'
    case 'delivered': return '✓✓'
    case 'read': return '✓✓'
    default: return ''
  }
}

function scrollToBottom() {
  nextTick(() => {
    const el = messageContainer.value
    if (el) {
      const distance = el.scrollHeight - el.scrollTop
      el.scrollTo({
        top: el.scrollHeight,
        behavior: distance > 500 ? 'instant' : 'smooth'
      })
    }
  })
}

function handleInput(e: Event) {
  const target = e.target as HTMLTextAreaElement
  newMessage.value = target.value
  target.style.height = 'auto'
  target.style.height = `${Math.min(target.scrollHeight, 120)}px`
}

function handleKeyDown(e: KeyboardEvent) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    sendMessage()
  }
}

function insertEmoji(emoji: string) {
  newMessage.value += emoji
  showEmojiPicker.value = false
}

async function sendMessage() {
  const content = newMessage.value.trim()
  if (!content) return

  newMessage.value = ''
  showEmojiPicker.value = false
  const textarea = document.getElementById(`chat-textarea-${props.conv.id}`)
  if (textarea) {
    textarea.style.height = 'auto'
  }

  try {
    const { data } = await chatApi.sendMessage({
      conversationId: props.conv.id,
      content,
      type: 'text'
    })
    if (data?.data && !messages.value.some(m => m.id === data.data.id)) {
      messages.value.push(data.data)
    }
    scrollToBottom()
  } catch (err: any) {
    toast.error(err.response?.data?.message || 'Gửi tin nhắn thất bại')
  }
}

async function handleUploadAttachment(e: Event, type: 'image' | 'file') {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return

  try {
    const res = await filesApi.uploadFile(file)
    const uploadedUrl = res.data?.data?.fileUrl
    if (!uploadedUrl) throw new Error('Upload failed')

    const size = file.size < 1024 * 1024
      ? `${(file.size / 1024).toFixed(1)} KB`
      : `${(file.size / (1024 * 1024)).toFixed(1)} MB`

    const { data } = await chatApi.sendMessage({
      conversationId: props.conv.id,
      content: type === 'image' ? '[Hình ảnh]' : file.name,
      type,
      imageUrl: type === 'image' ? uploadedUrl : undefined,
      fileUrl: type === 'file' ? uploadedUrl : undefined,
      fileName: type === 'file' ? file.name : undefined,
      fileSize: type === 'file' ? size : undefined
    })
    if (data?.data && !messages.value.some(m => m.id === data.data.id)) {
      messages.value.push(data.data)
    }
    scrollToBottom()
  } catch (err: any) {
    toast.error(err.response?.data?.message || 'Không thể tải tệp đính kèm')
  } finally {
    input.value = ''
  }
}
</script>

<template>
  <div class="w-84.5 bg-white dark:bg-surface-800 rounded-t-xl shadow-2xl border border-b-0 border-gray-200 dark:border-surface-700 flex flex-col" style="height: 455px;">
    <!-- Header -->
    <div class="relative z-50 header-menu-container">
      <div class="flex items-center gap-2 px-3 py-2 bg-white dark:bg-surface-800 border-b border-gray-200 dark:border-surface-700 shrink-0 rounded-t-xl">
        <div class="relative shrink-0">
          <UserAvatar 
            :user="{ avatar: conv.avatar, name: conv.name }" 
            :is-group="conv.isGroup || (!conv.avatar && conv.name?.includes('Nhóm'))"
            size="sm" 
            class="w-8! h-8!" 
          />
          <div v-if="conv.isOnline" class="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white dark:border-surface-800" />
        </div>
        <div 
          class="flex-1 min-w-0 cursor-pointer flex items-center gap-1 group"
          @click="toggleHeaderMenu"
        >
          <div class="flex-1 min-w-0">
            <p class="text-sm font-semibold text-gray-900 dark:text-white truncate group-hover:underline flex items-center gap-1.5">
              <span>{{ conv.nickname || conv.name }}</span>
              <BellOff v-if="conv.isMuted" :size="13" class="text-amber-500 shrink-0" title="Đã tắt thông báo" />
            </p>
            <p class="text-xs text-gray-400">{{ conv.isOnline ? 'Đang hoạt động' : 'Trực tuyến' }}</p>
          </div>
          <ChevronDown :size="16" :class="['text-primary-500 transition-transform', activeHeaderMenu ? 'rotate-180' : '']" />
        </div>
        <div class="flex items-center gap-0.5 shrink-0">
          <button @click="openInFullChat" title="Mở trong trang Tin nhắn" class="p-1.5 rounded-full text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors cursor-pointer"><Maximize2 :size="14" /></button>
          <button @click="$emit('minimize')" title="Thu nhỏ" class="p-1.5 rounded-full text-gray-400 hover:bg-gray-100 dark:hover:bg-surface-700 transition-colors cursor-pointer"><Minus :size="14" /></button>
          <button @click="$emit('close')" title="Đóng" class="p-1.5 rounded-full text-gray-400 hover:bg-gray-100 dark:hover:bg-surface-700 transition-colors cursor-pointer"><X :size="14" /></button>
        </div>
      </div>

      <Transition name="fade">
        <ChatPopupHeaderMenu 
          v-if="activeHeaderMenu"
          :conv="conv"
          @clear-chat="messages = []"
          @close="activeHeaderMenu = false"
          @close-window="$emit('close')"
          @open-nickname="showNicknameModal = true"
        />
      </Transition>
    </div>

    <!-- Messages -->
    <div
      ref="messageContainer"
      @click="activeMessageAction = null"
      @scroll="activeMessageAction = null"
      class="flex-1 overflow-y-auto overflow-x-hidden px-3 py-2 space-y-1.5 chat-messages relative z-0"
    >
      <div v-if="messages.length === 0 && !isLoadingMessages" class="flex flex-col items-center justify-center h-full text-center py-8">
        <UserAvatar 
          :user="{ avatar: conv.avatar, name: conv.name }" 
          :is-group="conv.isGroup || (!conv.avatar && conv.name?.includes('Nhóm'))"
          size="lg" 
          class="w-16! h-16! mb-3" 
        />
        <p class="text-sm font-semibold text-gray-900 dark:text-white">{{ conv.name }}</p>
        <p class="text-xs text-gray-400 mt-1">Bắt đầu cuộc trò chuyện mới</p>
      </div>

      <template v-for="(msg, index) in messages" :key="msg.id">
        <!-- Date separator -->
        <div 
          v-if="index === 0 || !isSameDay(msg.createdAt || msg.timestamp, messages[index - 1].createdAt || messages[index - 1].timestamp)"
          class="flex justify-center my-3"
        >
          <span class="px-2.5 py-0.5 bg-gray-200/70 dark:bg-surface-700/70 rounded-full text-[10px] font-medium text-gray-500 dark:text-gray-400 select-none">
            {{ formatDayLabel(msg.createdAt || msg.timestamp) }}
          </span>
        </div>

        <div :class="['flex', msg.isOwn ? 'justify-end' : 'justify-start']">
          <div :class="['max-w-[calc(100%-86px)] flex gap-1.5 items-end relative group/bubble', msg.isOwn ? 'flex-row-reverse' : '']">
            <UserAvatar v-if="!msg.isOwn" :user="msg.sender as any" size="sm" class="w-6! h-6! shrink-0" />
            <div class="relative flex items-center min-w-0" :class="msg.isOwn ? 'flex-row-reverse' : ''">
              <div class="relative">
                <img
                  v-if="msg.type === 'image' && msg.imageUrl && msg.status !== 'revoked'"
                  :src="msg.imageUrl"
                  alt="Hình ảnh"
                  class="max-h-40 rounded-xl object-cover border border-gray-200 dark:border-surface-600 mb-1"
                />
                <a
                  v-else-if="msg.type === 'file' && msg.fileName && msg.status !== 'revoked'"
                  :href="msg.fileUrl || '#'"
                  :download="msg.fileName"
                  target="_blank"
                  rel="noopener noreferrer"
                  :class="[
                    'flex items-center gap-2.5 px-3 py-2 rounded-2xl text-xs transition-colors',
                    msg.isOwn
                      ? 'bg-primary-500 text-white rounded-br-sm hover:bg-primary-600'
                      : 'bg-gray-100 dark:bg-surface-700 text-gray-900 dark:text-white rounded-bl-sm hover:bg-gray-200 dark:hover:bg-surface-600'
                  ]"
                >
                  <FileText :size="16" class="shrink-0" />
                  <div class="min-w-0 flex-1">
                    <p class="font-semibold truncate">{{ msg.fileName }}</p>
                    <p v-if="msg.fileSize" class="text-[10px] opacity-80">{{ msg.fileSize }}</p>
                  </div>
                  <Download :size="14" class="shrink-0 opacity-80" />
                </a>
                <div
                  v-else
                  :class="[
                    'px-3 py-1.5 text-[15px] leading-relaxed wrap-break-word min-w-0',
                    msg.status === 'revoked' || msg.isRevoked
                      ? 'italic text-gray-400 border border-dashed border-gray-300 dark:border-surface-600 rounded-2xl'
                      : msg.isOwn
                        ? 'bg-primary-500 text-white rounded-2xl rounded-br-sm'
                        : 'bg-gray-100 dark:bg-surface-700 text-gray-900 dark:text-white rounded-2xl rounded-bl-sm'
                  ]"
                >
                  {{ msg.status === 'revoked' || msg.isRevoked ? 'Tin nhắn đã bị thu hồi' : msg.content }}
                </div>
                <div
                  v-if="msg.reactions && msg.reactions.length > 0 && msg.status !== 'revoked' && !msg.isRevoked"
                  :class="['flex flex-wrap gap-1 mt-1', msg.isOwn ? 'justify-end' : 'justify-start']"
                >
                  <button
                    v-for="r in msg.reactions"
                    :key="r.emoji + r.userId"
                    type="button"
                    @click.stop="handleAddReaction(msg.id, r.emoji)"
                    class="px-1.5 py-0.5 text-[11px] bg-white dark:bg-surface-700 border border-gray-200 dark:border-surface-600 rounded-full shadow-2xs cursor-pointer hover:scale-105 transition-transform"
                  >
                    {{ r.emoji }}
                  </button>
                </div>
                <div :class="['flex items-center gap-1 mt-0.5 text-[10px] text-gray-400', msg.isOwn ? 'justify-end' : '']">
                  <span>{{ formatClockTime(msg.createdAt || msg.timestamp) }}</span>
                  <span v-if="msg.isOwn" :class="msg.status === 'read' ? 'text-primary-500' : ''">{{ getStatusIcon(msg.status) }}</span>
                </div>
              </div>

              <ChatMessageActions 
                :msg="msg"
                :active-action-menu="activeMessageAction"
                @toggle-action-menu="toggleMessageAction"
                @revoke-message="handleRevokeMessage"
                @pin-message="handlePinMessage"
                @add-reaction="handleAddReaction"
                @set-reply-to="handleSetReplyTo"
              />
            </div>
          </div>
        </div>
      </template>
    </div>

    <!-- Input -->
    <div class="shrink-0 px-2 py-2.5 relative">
      <input ref="fileInputRef" type="file" class="hidden" @change="handleUploadAttachment($event, 'file')" />
      <input ref="imageInputRef" type="file" accept="image/*" class="hidden" @change="handleUploadAttachment($event, 'image')" />

      <!-- Quick Emoji Popup -->
      <div
        v-if="showEmojiPicker"
        class="absolute bottom-14 right-3 z-50 bg-white dark:bg-surface-800 border border-gray-200 dark:border-surface-700 rounded-xl shadow-xl p-2 grid grid-cols-6 gap-1"
      >
        <button
          v-for="emo in quickEmojis"
          :key="emo"
          type="button"
          class="p-1.5 text-lg hover:bg-gray-100 dark:hover:bg-surface-700 rounded-lg cursor-pointer"
          @click="insertEmoji(emo)"
        >
          {{ emo }}
        </button>
      </div>

      <div class="flex items-end gap-1.5">
        <button
          type="button"
          title="Đính kèm tệp"
          class="p-1.5 text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-full transition-colors shrink-0 mb-0.5 cursor-pointer"
          @click="fileInputRef?.click()"
        >
          <Paperclip :size="20" />
        </button>
        <button
          type="button"
          title="Gửi hình ảnh"
          class="p-1.5 text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-full transition-colors shrink-0 mb-0.5 cursor-pointer"
          @click="imageInputRef?.click()"
        >
          <ImageIcon :size="20" />
        </button>
        
        <div class="flex-1 bg-gray-100 dark:bg-surface-700 rounded-2xl px-3 py-2 flex items-center">
          <textarea
            :id="`chat-textarea-${conv.id}`"
            :value="newMessage"
            @input="handleInput"
            @keydown="handleKeyDown"
            placeholder="Aa"
            rows="1"
            class="bg-transparent border-none outline-none text-[15px] leading-5 w-full text-gray-700 dark:text-gray-300 placeholder-gray-500 resize-none max-h-30 py-0 flex-1 my-auto scrollbar-thin"
          />
          <button
            type="button"
            title="Biểu tượng cảm xúc"
            class="text-primary-500 hover:text-primary-600 transition-colors shrink-0 ml-1 cursor-pointer"
            @click="showEmojiPicker = !showEmojiPicker"
          >
            <Smile :size="20" />
          </button>
        </div>
        <button
          type="button"
          title="Gửi"
          @click="sendMessage"
          class="p-1.5 text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-full transition-colors shrink-0 mb-0.5 cursor-pointer"
        >
          <Send :size="20" class="fill-current" />
        </button>
      </div>
    </div>

    <!-- Nickname Modal -->
    <NicknameModal
      :show="showNicknameModal"
      :user-name="conv.originalName || conv.name"
      :user-avatar="conv.avatar"
      :current-nickname="conv.nickname"
      @close="showNicknameModal = false"
      @save="handleSaveNickname"
    />
  </div>
</template>

<style scoped>
.chat-messages::-webkit-scrollbar { width: 4px; }
.chat-messages::-webkit-scrollbar-track { background: transparent; }
.chat-messages::-webkit-scrollbar-thumb { background: rgba(156, 163, 175, 0.3); border-radius: 99px; }
</style>
