<script setup lang="ts">
import { provide } from 'vue'
import { Phone as PhoneIcon, Video as VideoIcon, X as XIcon } from '@lucide/vue'
import { useChatView } from '@/composables/chat/useChatView'

import ChatSidebar from './components/ChatSidebar.vue'
import ChatMain from './components/ChatMain.vue'
import ChatInfoPanel from './components/ChatInfoPanel.vue'

const chatState = useChatView()
const { showCallDialog, callType, imagePreview, closeMenus } = chatState

// Provide the chat state to all child components
provide('chatState', chatState)
</script>

<template>
  <div class="flex h-[calc(100vh-4rem)] overflow-hidden" @click="closeMenus">
    <ChatSidebar />
    <ChatMain />
    <ChatInfoPanel />

    <!-- Call Dialog -->
    <Transition
      enter-active-class="transition duration-200"
      enter-from-class="opacity-0"
      leave-active-class="transition duration-150"
      leave-to-class="opacity-0"
    >
      <div v-if="showCallDialog" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50" @click="showCallDialog = false">
        <div class="bg-white dark:bg-surface-800 rounded-2xl p-8 max-w-sm w-full mx-4 text-center shadow-2xl" @click.stop>
          <div class="w-16 h-16 rounded-full bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center mx-auto mb-4">
            <component :is="callType === 'audio' ? PhoneIcon : VideoIcon" :size="28" class="text-primary-500" />
          </div>
          <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-2">
            {{ callType === 'audio' ? 'Gọi thoại' : 'Gọi video' }}
          </h3>
          <p class="text-sm text-gray-500 dark:text-gray-400 mb-6">
            Tính năng {{ callType === 'audio' ? 'gọi thoại' : 'gọi video' }} đang được phát triển và sẽ sớm ra mắt trong phiên bản tiếp theo! 🚀
          </p>
          <button
            @click="showCallDialog = false"
            class="px-6 py-2.5 rounded-xl text-sm font-medium text-white gradient-primary hover:opacity-90 transition-all"
          >
            Đã hiểu
          </button>
        </div>
      </div>
    </Transition>

    <!-- Image Preview Modal -->
    <Transition
      enter-active-class="transition duration-200"
      enter-from-class="opacity-0"
      leave-active-class="transition duration-150"
      leave-to-class="opacity-0"
    >
      <div v-if="imagePreview" class="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" @click="imagePreview = null">
        <button class="absolute top-4 right-4 p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors">
          <XIcon :size="24" />
        </button>
        <img :src="imagePreview" alt="Preview" class="max-w-full max-h-full object-contain rounded-lg" />
      </div>
    </Transition>
  </div>
</template>
