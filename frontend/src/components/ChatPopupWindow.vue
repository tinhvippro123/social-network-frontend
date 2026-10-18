<script setup lang="ts">
import { ref, computed, nextTick, onMounted, onUnmounted } from 'vue'
import {
  X, Send, Minus, Phone, Video,
  Smile, Paperclip, Image as ImageIcon,
  PlusCircle, ChevronDown
} from '@lucide/vue'
import type { ChatConversation, ChatMessage } from '@/types'
import { currentUser, mockMessages } from '@/data/mockData'
import ChatMessageActions from '@/views/chat/components/ChatMessageActions.vue'
import ChatPopupHeaderMenu from '@/components/ChatPopupHeaderMenu.vue'

const props = defineProps<{
  conv: ChatConversation
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'minimize'): void
}>()

// Only text messages for the mini popup
const textOnlyMessages = computed(() => {
  return mockMessages.filter(m => m.type === 'text' && m.content.trim() !== '')
})

const messages = ref<ChatMessage[]>([...textOnlyMessages.value].slice(-5))
const newMessage = ref('')
const isTyping = ref(false)
const activeHeaderMenu = ref(false)
const activeMessageAction = ref<string | null>(null)
const messageContainer = ref<HTMLElement | null>(null)

const toggleHeaderMenu = () => {
  activeHeaderMenu.value = !activeHeaderMenu.value
}

const toggleMessageAction = (msgId: string) => {
  activeMessageAction.value = activeMessageAction.value === msgId ? null : msgId
}

// Global click handler to close menus
const handleDocumentClick = (e: MouseEvent) => {
  const target = e.target as HTMLElement
  if (activeHeaderMenu.value && !target.closest('.header-menu-container')) {
    activeHeaderMenu.value = false
  }
  if (activeMessageAction.value && !target.closest('.message-action-menu')) {
    activeMessageAction.value = null
  }
}

onMounted(() => document.addEventListener('click', handleDocumentClick))
onUnmounted(() => document.removeEventListener('click', handleDocumentClick))

function formatTime(timeStr: string): string {
  if (/^\d{1,2}:\d{2}$/.test(timeStr)) return timeStr
  try {
    const date = new Date(timeStr)
    if (!isNaN(date.getTime())) {
      return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
    }
  } catch {}
  return timeStr
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

function sendMessage() {
  const content = newMessage.value.trim()
  if (!content) return

  const msg: ChatMessage = {
    id: `popup-m${Date.now()}`,
    content,
    sender: currentUser,
    createdAt: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
    isOwn: true,
    type: 'text',
    status: 'sending'
  }
  messages.value.push(msg)
  newMessage.value = ''

  const textarea = document.getElementById(`chat-textarea-${props.conv.id}`)
  if (textarea) {
    textarea.style.height = 'auto'
  }

  scrollToBottom()

  setTimeout(() => { msg.status = 'sent' }, 500)
  setTimeout(() => { msg.status = 'delivered' }, 1500)
  setTimeout(() => { msg.status = 'read' }, 3000)

  setTimeout(() => {
    isTyping.value = true
    scrollToBottom()
    setTimeout(() => {
      isTyping.value = false
      const reply: ChatMessage = {
        id: `popup-r${Date.now()}`,
        content: 'OK mình hiểu rồi, cảm ơn bạn nhé! 👍',
        sender: props.conv.participants.find(p => p.id !== currentUser.id) || props.conv.participants[0],
        createdAt: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
        isOwn: false,
        type: 'text',
        status: 'read'
      }
      messages.value.push(reply)
      scrollToBottom()
    }, 2000)
  }, 1500)
}

onMounted(() => {
  scrollToBottom()
})
</script>

<template>
  <div class="w-82 bg-white dark:bg-surface-800 rounded-t-xl shadow-2xl border border-b-0 border-gray-200 dark:border-surface-700 flex flex-col" style="height: 455px;">
    <!-- Header -->
    <div class="relative z-50 header-menu-container">
      <div class="flex items-center gap-2 px-3 py-2 bg-white dark:bg-surface-800 border-b border-gray-200 dark:border-surface-700 shrink-0 rounded-t-xl">
        <div class="relative shrink-0">
          <img :src="conv.avatar" class="w-8 h-8 rounded-full object-cover" />
          <div v-if="conv.isOnline" class="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white dark:border-surface-800" />
        </div>
        <div 
          class="flex-1 min-w-0 cursor-pointer flex items-center gap-1 group"
          @click="toggleHeaderMenu"
        >
          <div class="flex-1 min-w-0">
            <p class="text-sm font-semibold text-gray-900 dark:text-white truncate group-hover:underline">{{ conv.name }}</p>
            <p class="text-xs text-gray-400">{{ conv.isOnline ? 'Đang hoạt động' : 'Ngoại tuyến' }}</p>
          </div>
          <ChevronDown :size="16" :class="['text-primary-500 transition-transform', activeHeaderMenu ? 'rotate-180' : '']" />
        </div>
        <div class="flex items-center gap-0.5 shrink-0">
          <button class="p-1.5 rounded-full text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors"><Phone :size="14" /></button>
          <button class="p-1.5 rounded-full text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors"><Video :size="14" /></button>
          <button @click="$emit('minimize')" class="p-1.5 rounded-full text-gray-400 hover:bg-gray-100 dark:hover:bg-surface-700 transition-colors"><Minus :size="14" /></button>
          <button @click="$emit('close')" class="p-1.5 rounded-full text-gray-400 hover:bg-gray-100 dark:hover:bg-surface-700 transition-colors"><X :size="14" /></button>
        </div>
      </div>

      <Transition name="fade">
        <ChatPopupHeaderMenu 
          v-if="activeHeaderMenu"
          @close="activeHeaderMenu = false"
        />
      </Transition>
    </div>

    <!-- Messages -->
    <div
      ref="messageContainer"
      class="flex-1 overflow-y-auto overflow-x-hidden px-3 py-2 space-y-1.5 chat-messages relative z-0"
    >
      <div v-if="messages.length === 0" class="flex flex-col items-center justify-center h-full text-center py-8">
        <img :src="conv.avatar" class="w-16 h-16 rounded-full object-cover mb-3" />
        <p class="text-sm font-semibold text-gray-900 dark:text-white">{{ conv.name }}</p>
        <p class="text-xs text-gray-400 mt-1">Bắt đầu cuộc trò chuyện mới</p>
      </div>

      <div
        v-for="msg in messages"
        :key="msg.id"
        :class="['flex', msg.isOwn ? 'justify-end' : 'justify-start']"
      >
        <div :class="['max-w-[75%] flex gap-1.5 items-end relative group/bubble', msg.isOwn ? 'flex-row-reverse' : '']">
          <img v-if="!msg.isOwn" :src="msg.sender.avatar" class="w-6 h-6 rounded-full object-cover shrink-0" />
          <div class="relative flex items-center min-w-0" :class="msg.isOwn ? 'flex-row-reverse' : ''">
            <div>
              <div :class="[
                'px-3 py-1.5 text-[15px] leading-relaxed wrap-break-word min-w-0',
                msg.isOwn
                  ? 'bg-primary-500 text-white rounded-2xl rounded-br-sm'
                  : 'bg-gray-100 dark:bg-surface-700 text-gray-900 dark:text-white rounded-2xl rounded-bl-sm'
              ]">
                {{ msg.content }}
              </div>
              <div :class="['flex items-center gap-1 mt-0.5 text-[10px] text-gray-400', msg.isOwn ? 'justify-end' : '']">
                <span>{{ formatTime(msg.createdAt) }}</span>
                <span v-if="msg.isOwn" :class="msg.status === 'read' ? 'text-primary-500' : ''">{{ getStatusIcon(msg.status) }}</span>
              </div>
            </div>

            <!-- Hover Actions for Popup -->
            <ChatMessageActions 
              :msg="msg"
              :active-action-menu="activeMessageAction"
              @toggle-action-menu="toggleMessageAction"
            />
          </div>
        </div>
      </div>

      <!-- Typing -->
      <div v-if="isTyping" class="flex justify-start">
        <div class="flex gap-1.5 items-end">
          <img :src="conv.avatar" class="w-6 h-6 rounded-full object-cover shrink-0" />
          <div class="bg-gray-100 dark:bg-surface-700 rounded-2xl rounded-bl-sm px-4 py-2.5">
            <div class="flex gap-1">
              <span class="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0ms"></span>
              <span class="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 150ms"></span>
              <span class="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 300ms"></span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Input -->
    <div class="shrink-0 px-2 py-2.5">
      <div class="flex items-end gap-1.5">
        <template v-if="newMessage.trim().length > 0">
          <button class="p-1.5 text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-full transition-colors shrink-0 mb-0.5">
            <PlusCircle :size="20" />
          </button>
        </template>
        <template v-else>
          <button class="p-1.5 text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-full transition-colors shrink-0 mb-0.5"><Paperclip :size="20" /></button>
          <button class="p-1.5 text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-full transition-colors shrink-0 mb-0.5"><ImageIcon :size="20" /></button>
        </template>
        
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
          <button class="text-primary-500 hover:text-primary-600 transition-colors shrink-0 ml-1"><Smile :size="20" /></button>
        </div>
        <button @click="sendMessage" class="p-1.5 text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-full transition-colors shrink-0 mb-0.5"><Send :size="20" class="fill-current" /></button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.chat-messages::-webkit-scrollbar { width: 4px; }
.chat-messages::-webkit-scrollbar-track { background: transparent; }
.chat-messages::-webkit-scrollbar-thumb { background: rgba(156, 163, 175, 0.3); border-radius: 99px; }
</style>
