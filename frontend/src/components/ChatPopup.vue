<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import {
  X, Minus, Edit,
  MoreHorizontal
} from '@lucide/vue'
import type { ChatConversation, User } from '@/types'
import UserAvatar from '@/components/UserAvatar.vue'
import ChatPopupWindow from '@/components/ChatPopupWindow.vue'
import { useChatNicknames } from '@/composables/chat/useChatNicknames'
import { useAuthStore } from '@/stores/auth.store'
import usersApi from '@/api/users.api'
import chatApi from '@/api/chat.api'

const route = useRoute()
const authStore = useAuthStore()
const isChatRoute = computed(() => route.path.startsWith('/chat'))

// Open chat windows (max 2)
const openWindows = ref<ChatConversation[]>([])
// Minimized chats (show avatar bubbles)
const minimizedChats = ref<ChatConversation[]>([])

// New message compose popup
const showCompose = ref(false)
const composeSearch = ref('')
const availableUsers = ref<User[]>([])

// More menu (⋯)
const showMoreMenu = ref(false)
const { applyNicknameToConversation } = useChatNicknames()

async function loadComposeUsers() {
  if (!authStore.isLoggedIn) return
  try {
    const [recRes, convRes] = await Promise.allSettled([
      usersApi.getAll(20),
      chatApi.getConversations()
    ])
    const map = new Map<string, User>()
    if (convRes.status === 'fulfilled' && convRes.value.data?.data) {
      for (const conv of convRes.value.data.data) {
        for (const p of conv.participants || []) {
          if (p.id && p.id !== authStore.user?.id) {
            map.set(p.id, p as User)
          }
        }
      }
    }
    if (recRes.status === 'fulfilled' && recRes.value.data?.data) {
      for (const u of recRes.value.data.data) {
        if (u.id && u.id !== authStore.user?.id && !map.has(u.id)) {
          map.set(u.id, u as unknown as User)
        }
      }
    }
    availableUsers.value = Array.from(map.values())
  } catch {
    // ignore
  }
}

// Global click handler to close menus
const handleDocumentClick = (e: MouseEvent) => {
  const target = e.target as HTMLElement
  if (showMoreMenu.value && !target.closest('.more-menu-container')) {
    showMoreMenu.value = false
  }
  if (showCompose.value && !target.closest('.compose-menu-container')) {
    showCompose.value = false
  }
}

const handleNicknameChanged = (e: any) => {
  const detail = e.detail
  if (!detail) return
  const findAndApply = (list: ChatConversation[]) => {
    const match = list.find(c => !c.isGroup && (c.id === detail.convId || c.participants?.some(p => p.id === detail.otherId)))
    if (match) {
      match.nickname = detail.nickname
      match.name = detail.name
      if (detail.originalName) match.originalName = detail.originalName
    }
  }
  findAndApply(openWindows.value)
  findAndApply(minimizedChats.value)
}

const handleConversationRemoved = (e: any) => {
  const id = e?.detail?.id
  if (id) {
    closeWindow(id)
  }
}

onMounted(() => {
  document.addEventListener('click', handleDocumentClick)
  window.addEventListener('chat-nickname-changed', handleNicknameChanged)
  window.addEventListener('chat-conversation-removed', handleConversationRemoved)
})
onUnmounted(() => {
  document.removeEventListener('click', handleDocumentClick)
  window.removeEventListener('chat-nickname-changed', handleNicknameChanged)
  window.removeEventListener('chat-conversation-removed', handleConversationRemoved)
})

const MAX_WINDOWS = 2

const hasMultipleMinimized = computed(() => minimizedChats.value.length >= 2)

const composeUsers = computed(() => {
  const others = availableUsers.value.filter(u => u.id !== authStore.user?.id)
  if (!composeSearch.value) return others
  return others.filter(u =>
    u.name.toLowerCase().includes(composeSearch.value.toLowerCase())
  )
})

function toggleCompose() {
  showCompose.value = !showCompose.value
  composeSearch.value = ''
  showMoreMenu.value = false
  if (showCompose.value && availableUsers.value.length === 0) {
    loadComposeUsers()
  }
}

async function selectComposeUser(user: User) {
  showCompose.value = false
  composeSearch.value = ''
  try {
    const { data } = await chatApi.createConversation({
      participantIds: [user.id],
      isGroup: false
    })
    if (data?.data) {
      openChatWindow(data.data)
      return
    }
  } catch {
    // Fallback if createConversation fails
  }
  const conv: ChatConversation = {
    id: `new-${user.id}`,
    name: user.name,
    avatar: user.avatar,
    lastMessage: '',
    lastMessageTime: '',
    unreadCount: 0,
    isGroup: false,
    isOnline: true,
    isPinned: false,
    isMuted: false,
    participants: authStore.user ? [authStore.user, user] : [user]
  }
  openChatWindow(conv)
}

function openChatWindow(conv: ChatConversation) {
  if (!(conv as any)._popupKey) {
    ;(conv as any)._popupKey = conv.id
  }
  applyNicknameToConversation(conv)
  const existingIdx = openWindows.value.findIndex(w => w.id === conv.id || (w as any)._popupKey === (conv as any)._popupKey)
  if (existingIdx >= 0) return

  const minIdx = minimizedChats.value.findIndex(m => m.id === conv.id || (m as any)._popupKey === (conv as any)._popupKey)
  if (minIdx >= 0) {
    minimizedChats.value.splice(minIdx, 1)
  }

  if (openWindows.value.length >= MAX_WINDOWS) {
    const removed = openWindows.value.shift()!
    minimizedChats.value.push(removed)
  }

  openWindows.value.push(conv)
}

function closeWindow(convId: string) {
  openWindows.value = openWindows.value.filter(w => w.id !== convId && (w as any)._popupKey !== convId)
  minimizedChats.value = minimizedChats.value.filter(m => m.id !== convId && (m as any)._popupKey !== convId)
}

function minimizeWindow(convId: string) {
  const idx = openWindows.value.findIndex(w => w.id === convId || (w as any)._popupKey === convId)
  if (idx >= 0) {
    const conv = openWindows.value.splice(idx, 1)[0]
    minimizedChats.value.push(conv)
  }
}

function restoreWindow(conv: ChatConversation) {
  minimizedChats.value = minimizedChats.value.filter(m => m.id !== conv.id && (m as any)._popupKey !== (conv as any)._popupKey)
  openChatWindow(conv)
}

function closeAllChats() {
  openWindows.value = []
  minimizedChats.value = []
  showMoreMenu.value = false
}

function minimizeAllChats() {
  openWindows.value.forEach(conv => {
    minimizedChats.value.push(conv)
  })
  openWindows.value = []
  showMoreMenu.value = false
}

defineExpose({ openChatWindow })
</script>

<template>
  <!-- Only show on desktop when logged in -->
  <Teleport to="body">
    <div v-if="!isChatRoute && authStore.isLoggedIn" class="hidden sm:flex fixed bottom-0 right-6 z-9999 items-end gap-2">
      <!-- Chat Windows -->
      <TransitionGroup name="chat-window">
        <ChatPopupWindow
          v-for="conv in openWindows"
          :key="(conv as any)._popupKey || conv.id"
          :conv="conv"
          @minimize="minimizeWindow((conv as any)._popupKey || conv.id)"
          @close="closeWindow((conv as any)._popupKey || conv.id)"
        />
      </TransitionGroup>

      <!-- Right column: minimized bubbles + more button + compose -->
      <div class="flex flex-col items-center gap-2 mb-2">
        <!-- More Menu (⋯) — only show when 2+ minimized -->
        <div v-if="hasMultipleMinimized || (openWindows.length + minimizedChats.length) >= 2" class="relative more-menu-container">
          <button
            @click.stop="showMoreMenu = !showMoreMenu"
            class="w-10 h-10 rounded-full bg-gray-200 dark:bg-surface-700 shadow-md flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-surface-600 transition-colors cursor-pointer"
          >
            <MoreHorizontal :size="18" />
          </button>

          <!-- More dropdown -->
          <Transition name="compose">
            <div
              v-if="showMoreMenu"
              class="absolute bottom-12 right-0 w-max bg-white dark:bg-surface-800 rounded-xl shadow-2xl border border-gray-200 dark:border-surface-700 overflow-hidden"
            >
              <button
                @click="closeAllChats"
                class="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-surface-700 transition-colors whitespace-nowrap cursor-pointer"
              >
                <X :size="16" class="text-gray-400 shrink-0" />
                Đóng tất cả đoạn chat
              </button>
              <button
                @click="minimizeAllChats"
                class="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-surface-700 transition-colors whitespace-nowrap cursor-pointer"
              >
                <Minus :size="16" class="text-gray-400 shrink-0" />
                Thu nhỏ đoạn chat đang mở
              </button>
            </div>
          </Transition>
        </div>

        <!-- Minimized Chat Bubbles -->
        <TransitionGroup name="bubble">
          <div
            v-for="conv in minimizedChats"
            :key="'min-' + ((conv as any)._popupKey || conv.id)"
            @click="restoreWindow(conv)"
            class="relative cursor-pointer group"
          >
            <UserAvatar
              :user="{ avatar: conv.avatar, name: conv.name }"
              :is-group="conv.isGroup || (!conv.avatar && conv.name?.includes('Nhóm'))"
              size="lg"
              class="w-12! h-12! shadow-lg border-2 border-white dark:border-surface-800 hover:scale-110 transition-transform"
            />
            <div v-if="conv.isOnline" class="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-surface-800" />
            <button
              @click.stop="closeWindow((conv as any)._popupKey || conv.id)"
              class="absolute -top-1 -right-1 w-5 h-5 bg-gray-200 dark:bg-surface-600 text-gray-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-100 hover:text-red-500 cursor-pointer"
            >
              <X :size="10" />
            </button>
            <div class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              {{ conv.name }}
            </div>
          </div>
        </TransitionGroup>

        <!-- Compose Button (✏️) -->
        <div class="relative compose-menu-container">
          <Transition name="compose">
            <div
              v-if="showCompose"
              class="absolute bottom-14 right-0 w-80 bg-white dark:bg-surface-800 rounded-xl shadow-2xl border border-gray-200 dark:border-surface-700 overflow-hidden"
            >
              <div class="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-surface-700">
                <h3 class="font-semibold text-sm text-gray-900 dark:text-white">Tin nhắn mới</h3>
                <button @click="showCompose = false" class="text-red-500 hover:text-red-600 transition-colors cursor-pointer"><X :size="18" /></button>
              </div>
              <div class="px-4 py-2 border-b border-gray-100 dark:border-surface-700">
                <div class="flex items-center gap-2">
                  <span class="text-sm text-gray-500">Đến:</span>
                  <input v-model="composeSearch" type="text" placeholder="Tìm kiếm người dùng..." class="bg-transparent border-none outline-none text-sm flex-1 text-gray-700 dark:text-gray-300 placeholder-gray-400" />
                </div>
              </div>
              <div class="max-h-64 overflow-y-auto">
                <div
                  v-for="user in composeUsers"
                  :key="user.id"
                  @click="selectComposeUser(user)"
                  class="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-surface-700/50 cursor-pointer transition-colors"
                >
                  <UserAvatar :user="user" size="md" />
                  <div class="flex-1 min-w-0">
                    <p class="text-sm font-medium text-gray-900 dark:text-white truncate">{{ user.name }}</p>
                  </div>
                </div>
                <div v-if="composeUsers.length === 0" class="py-6 text-center">
                  <p class="text-sm text-gray-400">Không tìm thấy người dùng</p>
                </div>
              </div>
            </div>
          </Transition>

          <button
            @click="toggleCompose"
            class="w-12 h-12 rounded-full bg-white dark:bg-surface-800 shadow-xl border border-gray-200 dark:border-surface-700 flex items-center justify-center text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 hover:scale-110 transition-all cursor-pointer"
          >
            <Edit :size="20" />
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.chat-window-enter-active { transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1); }
.chat-window-leave-active { transition: all 0.15s ease-in; }
.chat-window-enter-from { opacity: 0; transform: translateY(40px) scale(0.9); }
.chat-window-leave-to { opacity: 0; transform: translateY(20px) scale(0.95); }

.bubble-enter-active { transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); }
.bubble-leave-active { transition: all 0.15s ease-in; }
.bubble-enter-from { opacity: 0; transform: scale(0.5); }
.bubble-leave-to { opacity: 0; transform: scale(0.5); }

.compose-enter-active { transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1); }
.compose-leave-active { transition: all 0.15s ease-in; }
.compose-enter-from { opacity: 0; transform: translateY(10px) scale(0.95); }
.compose-leave-to { opacity: 0; transform: translateY(10px) scale(0.95); }

.chat-messages::-webkit-scrollbar { width: 4px; }
.chat-messages::-webkit-scrollbar-track { background: transparent; }
.chat-messages::-webkit-scrollbar-thumb { background: rgba(156, 163, 175, 0.3); border-radius: 99px; }
</style>
