<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import {
  Pin as PinIcon, BellOff as BellOffIcon, Trash2 as TrashIcon, Ban as BanIcon, MoreHorizontal
} from '@lucide/vue'
import UserAvatar from '@/components/UserAvatar.vue'
import type { ChatConversation } from '@/types'

defineProps<{
  conv: ChatConversation
  isSelected: boolean
  formatMessageTime: (time: string) => string
}>()

const emit = defineEmits<{
  (e: 'select'): void
  (e: 'pin'): void
  (e: 'mute'): void
  (e: 'delete'): void
  (e: 'block'): void
}>()

const showMenu = ref(false)
const menuRef = ref<HTMLElement | null>(null)

function toggleMenu(e: Event) {
  e.stopPropagation()
  showMenu.value = !showMenu.value
}

function handleAction(action: 'pin' | 'mute' | 'delete' | 'block', e: Event) {
  e.stopPropagation()
  showMenu.value = false
  switch (action) {
    case 'pin': emit('pin'); break
    case 'mute': emit('mute'); break
    case 'delete': emit('delete'); break
    case 'block': emit('block'); break
  }
}

function onDocumentClick(e: MouseEvent) {
  if (menuRef.value && !menuRef.value.contains(e.target as Node)) {
    showMenu.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', onDocumentClick)
})

onUnmounted(() => {
  document.removeEventListener('click', onDocumentClick)
})
</script>

<template>
  <div
    @click="emit('select')"
    :class="[
      'flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all group relative',
      isSelected
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
      <div class="flex items-center justify-between gap-2">
        <div class="flex items-center gap-1.5 min-w-0">
          <h3 :class="[
            'font-medium truncate',
            conv.unreadCount > 0 ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'
          ]">
            {{ conv.name }}
          </h3>
          <BellOffIcon v-if="conv.isMuted" :size="12" class="text-gray-400 shrink-0" />
        </div>

        <!-- Right Action: Time / 3-dots Menu Button -->
        <div class="relative shrink-0 flex items-center" ref="menuRef">
          <!-- Timestamp: displayed normally, hidden on hover if menu closed -->
          <span
            :class="[
              'text-xs text-gray-500 transition-opacity',
              showMenu ? 'hidden' : 'group-hover:hidden'
            ]"
          >
            {{ formatMessageTime(conv.lastMessageTime) }}
          </span>

          <!-- 3-Dots Button: visible on hover or when dropdown is open -->
          <button
            type="button"
            @click="toggleMenu"
            :class="[
              'p-1 rounded-full text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-200 dark:hover:bg-surface-600 transition-colors',
              showMenu ? 'block bg-gray-200 dark:bg-surface-600 text-gray-700 dark:text-gray-200' : 'hidden group-hover:block'
            ]"
            title="Tùy chọn"
          >
            <MoreHorizontal :size="16" />
          </button>

          <!-- Dropdown Menu -->
          <transition name="fade">
            <div
              v-if="showMenu"
              class="absolute right-0 top-7 w-44 bg-white dark:bg-surface-800 rounded-xl shadow-xl border border-gray-200 dark:border-surface-700 py-1.5 z-50 text-xs font-medium"
            >
              <button
                type="button"
                @click="handleAction('pin', $event)"
                class="w-full flex items-center gap-2.5 px-3 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-surface-700 transition-colors"
              >
                <PinIcon :size="14" class="text-gray-400 shrink-0" />
                <span>{{ conv.isPinned ? 'Bỏ ghim' : 'Ghim cuộc trò chuyện' }}</span>
              </button>
              <button
                type="button"
                @click="handleAction('mute', $event)"
                class="w-full flex items-center gap-2.5 px-3 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-surface-700 transition-colors"
              >
                <BellOffIcon :size="14" class="text-gray-400 shrink-0" />
                <span>{{ conv.isMuted ? 'Bật thông báo' : 'Tắt thông báo' }}</span>
              </button>
              <div class="h-px bg-gray-100 dark:bg-surface-700 my-1"></div>
              <button
                type="button"
                @click="handleAction('delete', $event)"
                class="w-full flex items-center gap-2.5 px-3 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
              >
                <TrashIcon :size="14" class="shrink-0" />
                <span>Xóa đoạn chat</span>
              </button>
              <button
                type="button"
                @click="handleAction('block', $event)"
                class="w-full flex items-center gap-2.5 px-3 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
              >
                <BanIcon :size="14" class="shrink-0" />
                <span>Chặn người này</span>
              </button>
            </div>
          </transition>
        </div>
      </div>

      <div class="flex items-center justify-between mt-0.5 gap-2">
        <div class="flex items-center gap-1 min-w-0">
          <p :class="[
            'text-sm truncate',
            conv.unreadCount > 0 ? 'font-semibold text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'
          ]">
            {{ conv.lastMessage }}
          </p>
        </div>
        <span
          v-if="conv.unreadCount > 0"
          class="w-5 h-5 bg-primary-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full shrink-0"
        >
          {{ conv.unreadCount > 99 ? '99+' : conv.unreadCount }}
        </span>
      </div>
    </div>
  </div>
</template>
