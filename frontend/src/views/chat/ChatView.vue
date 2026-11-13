<script setup lang="ts">
import { provide } from 'vue'

import { useChatView } from '@/composables/chat/useChatView'

import ChatSidebar from './components/ChatSidebar.vue'
import ChatMain from './components/ChatMain.vue'
import ChatInfoPanel from './components/ChatInfoPanel.vue'
import NewChatModal from './components/NewChatModal.vue'
import ChatImagePreviewModal from './components/ChatImagePreviewModal.vue'

const chatState = useChatView()
const {
  imagePreview,
  closeMenus,
  showNewChatModal,
  newChatInitialMode,
  newChatPreselectedUserId,
  createNewConversation
} = chatState

// Provide the chat state to all child components
provide('chatState', chatState)
</script>

<template>
  <div class="flex h-[calc(100vh-4rem)] overflow-hidden" @click="closeMenus">
    <ChatSidebar />
    <ChatMain />
    <ChatInfoPanel />

    <!-- Image Preview Modal -->
    <ChatImagePreviewModal
      :image-preview="imagePreview"
      @close="imagePreview = null"
    />

    <!-- New Chat Modal -->
    <NewChatModal
      :show="showNewChatModal"
      :initial-mode="newChatInitialMode"
      :preselected-user-id="newChatPreselectedUserId"
      @close="showNewChatModal = false"
      @create="createNewConversation"
    />
  </div>
</template>
