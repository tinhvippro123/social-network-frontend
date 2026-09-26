<script setup lang="ts">
import { inject } from 'vue'
import { useRouter } from 'vue-router'
import {
  ChevronLeft as ChevronLeftIcon,
  Phone as PhoneIcon,
  Video as VideoIcon,
  Info as InfoIcon
} from '@lucide/vue'
import UserAvatar from '@/components/UserAvatar.vue'
import Skeleton from '@/components/ui/Skeleton.vue'

const chatState = inject<any>('chatState')
if (!chatState) {
  throw new Error('ChatState is not provided')
}
const router = useRouter()
</script>

<template>
  <div class="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-gray-200 dark:border-surface-700 bg-white dark:bg-surface-800">
    <div class="flex items-center gap-3">
      <button
        @click="chatState.showMobileChat = false"
        class="sm:hidden p-1 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-surface-700 mr-1"
      >
        <ChevronLeftIcon :size="20" />
      </button>
      <div class="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity" @click="router.push(`/profile/${chatState.selectedConversation?.id}`)">
        <div class="relative">
          <UserAvatar v-if="chatState.selectedConversation && !chatState.isInitialLoading" :user="{ name: chatState.selectedConversation.name, avatar: chatState.selectedConversation.avatar }" size="sm" />
          <Skeleton v-else type="avatar" class="w-8 h-8" rounded="rounded-full" />
          <div v-if="chatState.selectedConversation?.isOnline && !chatState.isInitialLoading" class="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full ring-2 ring-white dark:ring-surface-800" />
        </div>
        <div class="text-left">
          <template v-if="chatState.selectedConversation && !chatState.isInitialLoading">
            <p class="text-sm font-semibold text-gray-900 dark:text-white">{{ chatState.selectedConversation.name }}</p>
            <p class="text-xs text-green-500" v-if="chatState.isTyping">{{ chatState.typingUser }} đang nhập...</p>
            <p class="text-xs text-green-500" v-else-if="chatState.selectedConversation.isOnline">Đang hoạt động</p>
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
      <button @click="chatState.handlePerformSearch" class="p-2 text-gray-400 hover:text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-xl transition-colors">
        <PhoneIcon :size="18" />
      </button>
      <button @click="chatState.startCall('video')" class="p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-surface-700 rounded-xl transition-colors">
        <VideoIcon :size="18" />
      </button>
      <button @click="chatState.showInfoPanel = !chatState.showInfoPanel" :class="['p-2 rounded-xl transition-colors', chatState.showInfoPanel ? 'text-primary-500 bg-primary-50 dark:bg-primary-900/20' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-surface-700']">
        <InfoIcon :size="18" />
      </button>
    </div>
  </div>
</template>
