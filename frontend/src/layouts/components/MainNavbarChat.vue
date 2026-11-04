<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { MessageCircle, Search as SearchIcon, Edit } from '@lucide/vue'
import type { ChatConversation } from '@/types'
import chatApi from '@/api/chat.api'
import { useAuthStore } from '@/stores/auth.store'

import UserAvatar from '@/components/UserAvatar.vue'
import { formatMessengerTime } from '@/utils/formatters'
import { useChatNicknames } from '@/composables/chat/useChatNicknames'

const props = defineProps<{
  showChat: boolean
}>()

const emit = defineEmits<{
  (e: 'update:showChat', value: boolean): void
  (e: 'openChatWindow', conv: ChatConversation): void
}>()

const router = useRouter()
const authStore = useAuthStore()
const searchQuery = ref('')
const triggerRef = ref<HTMLElement | null>(null)
const liveConversations = ref<ChatConversation[]>([])
const { applyNicknamesToConversations } = useChatNicknames()

async function loadConversations() {
  if (!authStore.isLoggedIn) {
    liveConversations.value = []
    return
  }
  try {
    const { data } = await chatApi.getConversations()
    if (data && data.data && data.data.length > 0) {
      liveConversations.value = data.data
    } else {
      liveConversations.value = []
    }
  } catch (e) {
    console.warn('Could not load navbar conversations', e)
  }
}

onMounted(() => {
  loadConversations()
  window.addEventListener('chat-nickname-changed', () => {
    liveConversations.value = [...liveConversations.value]
  })
})

watch(() => props.showChat, (isOpen) => {
  if (isOpen) {
    loadConversations()
  }
})

// Use live conversations if logged in and available; otherwise fallback cleanly
const displayedConversations = computed(() => {


  const base = authStore.isLoggedIn ? liveConversations.value : []
  return applyNicknamesToConversations(base)
})

const totalUnread = computed(() =>
  displayedConversations.value.reduce((sum, c) => sum + (c.unreadCount || 0), 0)
)

const filteredConversations = computed(() => {
  if (!searchQuery.value) return displayedConversations.value
  return displayedConversations.value.filter(c =>
    c.name.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})

// Compute dropdown position based on trigger button
const dropdownStyle = computed(() => {
  if (!triggerRef.value) return {}
  const rect = triggerRef.value.getBoundingClientRect()
  return {
    position: 'fixed' as const,
    top: `${rect.bottom + 8}px`,
    right: `${window.innerWidth - rect.right}px`
  }
})

function handleChatClick() {
  // On mobile, navigate to /chat page
  if (window.innerWidth < 640) {
    router.push('/chat')
    return
  }
  emit('update:showChat', !props.showChat)
}

function selectConversation(conv: ChatConversation) {
  conv.unreadCount = 0
  if (window.innerWidth < 640) {
    router.push('/chat')
  } else {
    emit('openChatWindow', conv)
  }
  emit('update:showChat', false)
}
</script>

<template>
  <div class="relative">
    <button
      ref="triggerRef"
      class="relative p-2 rounded-xl text-gray-500 hover:bg-gray-100 dark:hover:bg-surface-700 transition-colors"
      @click.stop="handleChatClick"
    >
      <MessageCircle :size="20" />
      <span
        v-if="totalUnread > 0"
        class="absolute -top-0.5 -right-0.5 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium animate-pulse"
      >
        {{ totalUnread > 99 ? '99+' : totalUnread }}
      </span>
    </button>

    <!-- Chat Dropdown (Teleported to body for z-index) -->
    <Teleport to="body">
      <transition name="slide-up">
        <div
          v-if="showChat"
          :style="dropdownStyle"
          class="w-80 bg-white dark:bg-surface-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-surface-700 overflow-hidden z-9999"
        >
          <!-- Header -->
          <div class="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-surface-700">
            <h3 class="font-semibold text-sm text-gray-900 dark:text-white">Tin nhắn</h3>
            <button
              @click="router.push('/chat'); emit('update:showChat', false)"
              title="Mở toàn bộ cuộc trò chuyện"
              class="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-surface-700 transition-colors"
            >
              <Edit :size="16" />
            </button>
          </div>

          <!-- Search -->
          <div class="px-3 py-2 border-b border-gray-100 dark:border-surface-700">
            <div class="flex items-center gap-2 bg-gray-100 dark:bg-surface-700 rounded-xl px-3 py-1.5">
              <SearchIcon :size="14" class="text-gray-400 shrink-0" />
              <input
                v-model="searchQuery"
                type="text"
                placeholder="Tìm kiếm..."
                class="bg-transparent border-none outline-none text-xs w-full text-gray-700 dark:text-gray-300 placeholder-gray-400"
              />
            </div>
          </div>

          <!-- Conversations -->
          <div class="max-h-80 overflow-y-auto">
            <div v-if="filteredConversations.length === 0" class="py-8 text-center">
              <MessageCircle class="w-8 h-8 mx-auto mb-2 text-gray-300 dark:text-surface-600" />
              <p class="text-sm text-gray-400">Không tìm thấy cuộc trò chuyện</p>
            </div>
            <div
              v-for="conv in filteredConversations"
              :key="conv.id"
              @click="selectConversation(conv)"
              :class="[
                'flex items-center gap-3 px-3.5 py-2.5 hover:bg-gray-50 dark:hover:bg-surface-700/50 cursor-pointer transition-colors',
                conv.unreadCount > 0 ? 'bg-primary-50/40 dark:bg-primary-900/10' : ''
              ]"
            >
              <!-- Avatar with fallback and online indicator -->
              <div class="relative shrink-0">
                <UserAvatar 
                  :user="{ avatar: conv.avatar, name: conv.name }" 
                  :is-group="conv.isGroup || (!conv.avatar && conv.name?.includes('Nhóm'))"
                  size="md" 
                />
                <div
                  v-if="conv.isOnline"
                  class="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white dark:border-surface-800"
                />
              </div>

              <!-- Content: Name & Message Preview with Messenger-style relative time -->
              <div class="flex-1 min-w-0">
                <p :class="['text-[13px] truncate min-w-0 leading-tight', conv.unreadCount > 0 ? 'font-bold text-gray-900 dark:text-white' : 'font-medium text-gray-800 dark:text-gray-200']">
                  {{ conv.name }}
                </p>
                <p :class="['text-xs truncate flex items-center min-w-0 mt-0.5', conv.unreadCount > 0 ? 'font-semibold text-gray-800 dark:text-gray-200' : 'text-gray-500 dark:text-gray-400']">
                  <span class="truncate">{{ conv.lastMessage || 'Đã bắt đầu cuộc trò chuyện' }}</span>
                  <span v-if="conv.lastMessageTime" class="mx-1 shrink-0 text-gray-400 dark:text-gray-500">·</span>
                  <span v-if="conv.lastMessageTime" class="shrink-0 text-gray-400 dark:text-gray-500 font-normal">
                    {{ formatMessengerTime(conv.lastMessageTime) }}
                  </span>
                </p>
              </div>

              <!-- Unread blue dot indicator (Facebook Messenger style) -->
              <div v-if="conv.unreadCount > 0" class="shrink-0">
                <div class="w-2.5 h-2.5 bg-primary-500 rounded-full"></div>
              </div>
            </div>
          </div>

          <!-- Footer -->
          <div class="border-t border-gray-200 dark:border-surface-700 px-4 py-2.5">
            <button
              @click="$router.push('/chat'); emit('update:showChat', false)"
              class="w-full text-center text-sm font-medium text-primary-500 hover:text-primary-600 transition-colors"
            >
              Xem tất cả tin nhắn
            </button>
          </div>
        </div>
      </transition>
    </Teleport>
  </div>
</template>

<style scoped>
.slide-up-enter-active, .slide-up-leave-active {
  transition: all 0.2s ease;
}
.slide-up-enter-from, .slide-up-leave-to {
  opacity: 0;
  transform: translateY(8px);
}
</style>
