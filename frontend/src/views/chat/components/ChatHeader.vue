<script setup lang="ts">
import { inject, computed } from 'vue'
import { useRouter } from 'vue-router'
import {
  ChevronLeft as ChevronLeftIcon,
  Search as SearchIcon,
  Info as InfoIcon
} from '@lucide/vue'
import UserAvatar from '@/components/UserAvatar.vue'
import Skeleton from '@/components/ui/Skeleton.vue'

const chatState = inject<any>('chatState')
if (!chatState) {
  throw new Error('ChatState is not provided')
}

const {
  currentUser,
  showMobileChat,
  selectedConversation,
  isInitialLoading,
  isTyping,
  typingUser,
  showInfoPanel,
  showSearchInChat,
  toggleInfoPanel
} = chatState

const router = useRouter()

const otherParticipantId = computed(() => {
  const conv = selectedConversation?.value
  if (!conv) return undefined
  const myId = currentUser?.value?.id
  const other = conv.participants?.find((p: any) => p.id && p.id !== myId)
  return other?.id
})

function handleOpenProfile() {
  if (selectedConversation?.value?.isGroup) {
    if (toggleInfoPanel) {
      toggleInfoPanel()
    } else {
      showInfoPanel.value = !showInfoPanel.value
    }
    return
  }
  if (otherParticipantId.value) {
    router.push(`/profile/${otherParticipantId.value}`)
  }
}
</script>

<template>
  <div class="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-gray-200 dark:border-surface-700 bg-white dark:bg-surface-800">
    <div class="flex items-center gap-3">
      <button
        @click="showMobileChat = false"
        class="sm:hidden p-1 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-surface-700 mr-1 cursor-pointer"
      >
        <ChevronLeftIcon :size="20" />
      </button>
      <div class="cursor-pointer hover:opacity-80 transition-opacity flex items-center gap-3" @click="handleOpenProfile">
        <div class="relative">
          <UserAvatar
            v-if="selectedConversation && !isInitialLoading"
            :user="{ name: selectedConversation.name, avatar: selectedConversation.avatar }"
            :is-group="selectedConversation.isGroup"
            size="sm"
          />
          <Skeleton v-else type="avatar" class="w-8 h-8" rounded="rounded-full" />
          <div v-if="selectedConversation?.isOnline && !isInitialLoading" class="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full ring-2 ring-white dark:ring-surface-800" />
        </div>
        <div class="text-left min-w-0">
          <template v-if="selectedConversation && !isInitialLoading">
            <p class="text-sm font-semibold text-gray-900 dark:text-white">{{ selectedConversation.name }}</p>
            <p class="text-xs text-green-500" v-if="isTyping">{{ typingUser }} đang nhập...</p>
            <p class="text-xs text-gray-400" v-else-if="selectedConversation.isGroup">{{ selectedConversation.participants?.length || 0 }} thành viên</p>
            <p class="text-xs text-green-500" v-else-if="selectedConversation.isOnline">Đang hoạt động</p>
            <p class="text-xs text-gray-400" v-else>Hoạt động gần đây</p>
          </template>
          <template v-else>
            <Skeleton type="text" class="w-24 h-4 mb-1" />
            <Skeleton type="text" class="w-16 h-3" />
          </template>
        </div>
      </div>
    </div>
    <div class="flex items-center gap-1">
      <button
        @click="showSearchInChat = !showSearchInChat"
        title="Tìm kiếm trong cuộc trò chuyện"
        :class="['p-2 rounded-xl transition-colors cursor-pointer', showSearchInChat ? 'text-primary-500 bg-primary-50 dark:bg-primary-900/20' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-surface-700']"
      >
        <SearchIcon :size="18" />
      </button>
      <button
        @click="toggleInfoPanel ? toggleInfoPanel() : (showInfoPanel = !showInfoPanel)"
        title="Thông tin cuộc trò chuyện"
        :class="['p-2 rounded-xl transition-colors cursor-pointer', showInfoPanel ? 'text-primary-500 bg-primary-50 dark:bg-primary-900/20' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-surface-700']"
      >
        <InfoIcon :size="18" />
      </button>
    </div>
  </div>
</template>
